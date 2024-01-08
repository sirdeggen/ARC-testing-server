import nimble, { functions } from '@runonbitcoin/nimble'
import { toUTXO, forgeTx, casts, Forge } from 'txforge'
const { P2PKH, OpReturn, Raw } = casts
const { sha256 } = functions
const { Transaction, Script } = nimble
const { BufferWriter } = nimble.classes
const writeU32LE = nimble.functions.writeU32LE
const writeU64LE = nimble.functions.writeU64LE
const writeVarint = nimble.functions.writeVarint
function outputSize(script) {
    const buf = new BufferWriter()
    writeVarint(buf, script.length)
    buf.write(script.buffer)
    return 8 + buf.length
}
function toExtendedFormat(forge) {
    if (forge.options.sort) {
        forge.sort()
    }

    const tx = new Transaction()
    // First pass populate inputs with zero'd sigs
    forge.inputs.forEach(cast => {
        tx.input(cast.toInput())
    })
    forge.outputs.forEach(cast => tx.output(cast.toOutput()))

    // If changeScript exists, calculate the change and add to tx
    if (forge.changeScript) {
        const rates = forge.options.rates
        const rate = Number.isInteger(rates) ? rates : rates.standard
        const fee = forge.calcRequiredFee()
        const extraFee = Math.ceil((outputSize(forge.changeScript) * rate) / 1000)
        const change = forge.inputSum - forge.outputSum - (fee + extraFee)
        if (change > 0) {
            tx.output(new Transaction.Output(forge.changeScript, change, tx))
        }
    }

    if (forge.locktime > 0) {
        tx.locktime = forge.locktime
    }

    // Second pass replaces signed inputs
    forge.inputs.forEach((cast, vin) => {
        cast.setCtx(tx, vin)
        tx.inputs[vin].script = cast.toScript()
        tx.inputs[vin].ef = {
            previousTxSatoshis: cast.utxo.satoshis,
            previousTxScriptLength: Buffer.from(cast.utxo.script, 'hex').length,
            previousTxScript: Buffer.from(cast.utxo.script, 'hex'),
        }
    })

    let sliceLength = 0
    const efBuf = new BufferWriter()
    writeU32LE(efBuf, tx.version) // version
    sliceLength = efBuf.length
    efBuf.write(Buffer.from('0000000000ef', 'hex')) // ef flag
    sliceLength = efBuf.length
    writeVarint(efBuf, forge.inputs.length) // input count
    sliceLength = efBuf.length
    tx.inputs.map((input, idx) => {
        efBuf.write(Buffer.from(input.txid, 'hex').reverse()) // txid
        sliceLength = efBuf.length
        writeU32LE(efBuf, input.vout) // vout
        sliceLength = efBuf.length
        if (input.script === null) {
            writeVarint(efBuf, 0)
            sliceLength = efBuf.length
        } else {
            writeVarint(efBuf, input.script.length) // unlocking script length
            sliceLength = efBuf.length
            efBuf.write(input.script.toBuffer()) // unlocking script
            sliceLength = efBuf.length

            writeU32LE(efBuf, input.sequence) // sequence
            sliceLength = efBuf.length

            writeU64LE(efBuf, input.ef.previousTxSatoshis) // utxo satoshis
            sliceLength = efBuf.length
            writeVarint(efBuf, input.ef.previousTxScriptLength) // length of previous locking script
            sliceLength = efBuf.length
            efBuf.write(input.ef.previousTxScript) // previous locking script
            sliceLength = efBuf.length
        }
    })
    writeVarint(efBuf, tx.outputs.length) // output count
    sliceLength = efBuf.length
    tx.outputs.map(output => {
        writeU64LE(efBuf, output.satoshis) // satoshis
        sliceLength = efBuf.length
        writeVarint(efBuf, output.script.length) // locking script length
        sliceLength = efBuf.length
        efBuf.write(output.script.toBuffer()) // locking script
        sliceLength = efBuf.length
    })

    writeU32LE(efBuf, tx.locktime) // locktime

    return { tx, ef: Buffer.from(efBuf.toBuffer()) }
}
export function forgeEfTx(params = {}) {
    const forge = new Forge(params)
    return toExtendedFormat(forge)
}