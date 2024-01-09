export const dynamic = 'force-dynamic'
import { kv } from '@vercel/kv'
import { createKysely } from '@vercel/postgres-kysely'
import { PrivateKey } from '@bsv/sdk'

const apiKey = process.env.TAAL_KEY
const wif = process.env.WIF

const privkey = PrivateKey.fromString(wif)
const a = privkey.toPublic()

async function broadcastToARC(endpoint, efHex, apiKey) {
    console.log({ broadcastToARC: { endpoint, efHex, apiKey } })
    let status, data
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
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

        const outputSats = utxo.satoshis - 2
        const u = toUTXO(utxo)
        const input = P2PKH.unlock(u, { privkey })
        const output = P2PKH.lock(outputSats, { address: a })

        const inputs = [input]
        const outputs = [output]
        const { ef, tx } = forgeEfTx({ inputs, outputs })
        const txid = tx.hash

        console.log({ txid })

        // save the new utxos and any unused ones
        const newUtxo = { txid, vout: 0, satoshis: utxo.satoshis - 2, script: utxo.script }
        utxos.push(newUtxo)

        await kv.set('utxos', utxos)

        // send the transaction to ARC
        const {
            status: http_status,
            data,
            error: arcError,
        } = await broadcastToARC('https://api.taal.com/arc/v1/tx', ef.toString('hex'), apiKey)

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
