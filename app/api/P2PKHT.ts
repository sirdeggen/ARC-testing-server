import {
    LockingScript,
    UnlockingScript,
    OP,
    TransactionSignature,
    Hash,
    PrivateKey,
    Transaction,
} from '@bsv/sdk'

const { sha256, toArray } = Hash

export default class P2PKHT {
    lock(pubkeyhash: number[]): LockingScript {
        const time = toArray(Date.now().toString())
        return new LockingScript([
            { op: time.length, data: time },
            { op: OP.OP_DROP },
            { op: OP.OP_DUP },
            { op: OP.OP_HASH160 },
            { op: pubkeyhash.length, data: pubkeyhash },
            { op: OP.OP_EQUALVERIFY },
            { op: OP.OP_CHECKSIG }
        ])
    }

    unlock(privateKey: PrivateKey, signOutputs: 'all' | 'none' | 'single' = 'all', anyoneCanPay = false) {
        return {
            sign: async (tx: Transaction, inputIndex: number) => {
                let signatureScope = TransactionSignature.SIGHASH_FORKID
                if (signOutputs === 'all') {
                    signatureScope |= TransactionSignature.SIGHASH_ALL
                }
                if (signOutputs === 'none') {
                    signatureScope |= TransactionSignature.SIGHASH_NONE
                }
                if (signOutputs === 'single') {
                    signatureScope |= TransactionSignature.SIGHASH_SINGLE
                }
                if (anyoneCanPay) {
                    signatureScope |= TransactionSignature.SIGHASH_ANYONECANPAY
                }
                const otherInputs = [...tx.inputs]
                const [input] = otherInputs.splice(inputIndex, 1)
                if (typeof input.sourceTransaction !== 'object') {
                    throw new Error('The source transaction is needed for transaction signing.')
                }
                const srcOutIdx = input.sourceOutputIndex
                const preimage = TransactionSignature.format({
                    sourceTXID: input.sourceTransaction.id('hex'),
                    sourceOutputIndex: srcOutIdx,
                    sourceSatoshis: input.sourceTransaction.outputs[srcOutIdx].satoshis ?? 0,
                    transactionVersion: tx.version,
                    otherInputs,
                    inputIndex,
                    outputs: tx.outputs,
                    inputSequence: input.sequence ?? 0xFFFFFFFF,
                    subscript: input.sourceTransaction.outputs[srcOutIdx].lockingScript,
                    lockTime: tx.lockTime,
                    scope: signatureScope
                })
                const rawSignature = privateKey.sign(sha256(preimage))
                const sig = new TransactionSignature(rawSignature.r, rawSignature.s, signatureScope)
                const sigForScript = sig.toChecksigFormat()
                const pubkeyForScript = privateKey.toPublicKey().encode(true) as number[]
                return new UnlockingScript([
                    { op: sigForScript.length, data: sigForScript },
                    { op: pubkeyForScript.length, data: pubkeyForScript }
                ])
            },
            estimateLength: async () => {
                return 106
            }
        }
    }
}
