import { kv } from '@vercel/kv'
import { createKysely } from '@vercel/postgres-kysely'
import { Transaction, PrivateKey, BigNumber, P2PKHT } from '@/app/bsv-sdk/esm/mod'
const { PRIVHEX, TAAL_KEY, ARC_URL } = process.env

async function broadcastToARC(efHex) {
    let status, data
    const endpoint = ARC_URL + '/v1/tx'
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
        status = String(response?.status || 400)
        data = await response.json()
        return { status, data }
    } catch (error) {
        console.log({ error })
        if (!status) status = 400
        return { status, error }
    }
}


export default async function createTx(offset) {
    try {
        const spendable = 'utxo_' + offset
        // stop running if we have run in to orphan mempool issues.
        const running = await kv.get('running')
        if (!running) return Response.json({ success: false })

        const privkey = PrivateKey.fromString(PRIVHEX, 16)
        const h = BigNumber.fromHex('d1aa47165f58d8ddc2be987a41c9ad4609b9a912', 'le')
        const pkh = h.toArray('le', 20)
        const time = new Date().toISOString()

        // grab a utxo from the key value store
        const utxos = await kv.get(spendable)
        const utxo = utxos.shift()
        const sourceTransaction = Transaction.fromHex(utxo)

        const p2pkh = new P2PKHT()
        
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
        console.info({ txid, rawtx, ef })

        // save the new utxos and any unused ones
        utxos.push(rawtx)

        await kv.set(spendable, utxos)

        // send the transaction to ARC
        const {
            status: http_status,
            data,
            error: arcError,
        } = await broadcastToARC(ef)

        let extra_info = '',
            arc_status = '',
            arc_title = '',
            tx_status = '',
            error = ''
        if (data?.extraInfo) extra_info = data.extraInfo
        if (data?.arcStatus) arc_status = data.status
        if (data?.arcTitle) arc_title = data.title
        if (data?.txStatus) tx_status = data.txStatus
        if (arcError) error = arcError.message()

        // log the response in a postgres database

        console.log({ txid, time, http_status, arc_status, arc_title, tx_status, extra_info, error })
        const db = createKysely()
        await db
            .insertInto('txs')
            .values({ txid, time, http_status, arc_status, arc_title, tx_status, extra_info, error })
            .execute()

        if (tx_status === 'SEEN_IN_ORPHAN_MEMPOOL' || tx_status === '') {
            await kv.set('running', 0)
            console.error('stopped running due to ' + tx_status + ' status for ' + txid + ' attempting to spend ' + spendable)
        }

        return Response.json({ txid, txStatus: tx_status })
    } catch (error) {
        console.error({ error })
        return Response.json({ success: false })
    }
}