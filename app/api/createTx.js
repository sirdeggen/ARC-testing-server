export const dynamic = 'force-dynamic'
import { kv } from '@vercel/kv'
import { createKysely } from '@vercel/postgres-kysely'
import { Transaction, PrivateKey, P2PKH, BigNumber } from '@/app/bsv-sdk/esm/mod'
const { PRIVHEX, TAAL_KEY } = process.env

async function broadcastToARC(endpoint, efHex) {
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


export default async function createTx() {
    try {
        const privkey = PrivateKey.fromString(PRIVHEX, 16)
        const h = BigNumber.fromHex('d1aa47165f58d8ddc2be987a41c9ad4609b9a912', 'le')
        const pkh = h.toArray('le', 20)
        const time = Date.now()
        // grab a utxo from the key value store

        // get a value from vercel kvs
        const utxos = await kv.get('utxos')
        const utxo = utxos.shift()
        const sourceTransaction = Transaction.fromHex(utxo)

        const p2pkh = new P2PKH()
        
        const tx = new Transaction()
        tx.addInput({
            sourceTransaction,
            sourceOutputIndex: 0,   
            unlockingScriptTemplate: p2pkh.unlock(privkey),
        })
        tx.addOutput({
            lockingScript: p2pkh.lock(pkh),
            change: true
        })
        await tx.fee()
        await tx.sign()
        const rawtx = tx.toHex()
        const ef = tx.toHexEF()
        const txid = tx.id('hex')
        console.log({ txid, rawtx, ef })

        // save the new utxos and any unused ones
        utxos.push(rawtx)

        await kv.set('utxos', utxos)

        // send the transaction to ARC
        const {
            status: http_status,
            data,
            error: arcError,
        } = await broadcastToARC('https://api.taal.com/arc/v1/tx', ef)

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

        return Response.json({ txid, txStatus: tx_status })
    } catch (error) {
        console.log({ error })
        return Response.json({ success: false })
    }
}