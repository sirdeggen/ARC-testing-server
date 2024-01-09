export const dynamic = 'force-dynamic'
import { kv } from '@vercel/kv'
import { createKysely } from '@vercel/postgres-kysely'
import { Transaction, PrivateKey, P2PKH, BigNumber } from '@bsv/sdk'
const { PRIVHEX, TAAL_KEY } = process.env

const privkey = PrivateKey.fromString(PRIVHEX, 16)
const h = BigNumber.fromHex('d1aa47165f58d8ddc2be987a41c9ad4609b9a912', 'le')
const pkh = h.toArray('le', 20)

async function broadcastToARC(endpoint, efHex) {
    console.log({ broadcastToARC: { endpoint, efHex } })
    let status, data
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TAAL_KEY}`,
                'X-CallbackUrl': 'https://arctic.xn--nda.network/api/callback',
            },
            body: `{ "rawTx": "${efHex}" }`,
        }
        const response = await fetch(endpoint, options)
        status = response?.status || 400
        data = await response.json()
        return { status, data }
    } catch (error) {
        console.log({ error })
        if (!status) status = 400
        return { status, error }
    }
}

export async function GET(req, res) {
    try {
        const time = Date.now()
        // grab a utxo from the key value store

        // get a value from vercel kvs
        const utxos = await kv?.get('utxos')
        console.log({ utxos })
        const utxo = utxos.shift()
        console.log({ utxo })

        const sourceTransaction = Transaction.fromHex(utxo)
        
        const tx = new Transaction()
        tx.addInput({
            sourceTransaction,
            sourceOutputIndex: 0,   
            unlockingScriptTemplate: new P2PKH().unlock(privkey),
        })
        tx.addOutput({
            lockingScript: new P2PKH().lock(pkh),
            change: true
        })
        await tx.fee({ computeFee: () => 2 })
        await tx.sign()
        const rawtx = tx.toHex()
        const ef = tx.toHexEF()
        const txid = tx.id()

        console.log({ txid, ef })

        // save the new utxos and any unused ones
        const newUtxo = rawtx
        utxos.push(newUtxo)

        await kv.set('utxos', utxos)

        // send the transaction to ARC
        const {
            status: http_status,
            data,
            error: arcError,
        } = await broadcastToARC('https://api.taal.com/arc/v1/tx', efHex)

        let extra_info = '',
            arc_status = '',
            arc_title = '',
            tx_status = '',
            error = ''
        if (data?.extraInfo) extra_info = data.extraInfo
        if (data?.arcStatus) arc_status = data.arcStatus
        if (data?.arcTitle) arc_title = data.arcTitle
        if (data?.txStatus) tx_status = data.txStatus
        if (arcError) error = arcError.message()

        // log the response in a postgres database

        const db = createKysely()
        await db
            .insertInto('transactions')
            .values({ txid, time, http_status, arc_status, arc_title, tx_status, extra_info, error })
            .execute()

        return Response.json({ success: true })
    } catch (error) {
        console.log({ error })
        return Response.json({ success: false })
    }
}
