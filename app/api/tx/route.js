import { kv } from '@vercel/kv'
import { forgeEfTx } from '@/app/nimble'
import { P2PKH } from 'txforge/casts'
import { toUTXO } from 'txforge'

const apiKey = process.env.TAAL_KEY
const wif = process.env.WIF

const privkey = nimble.PrivateKey.fromString(wif)
const a = privkey.toAddress()

async function broadcastToARC(endpoint, ef, apiKey) {
    let response, data
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'X-CallbackUrl': 'https://mysite.com/api/callback',
            },
            body: `{ "rawTx": "${ef.toString('hex')}" }`,
        }
        response = await fetch(endpoint, options)
        data = await response.json()
        return { status: response?.status, data }
    } catch (error) {
        console.log({ error })
        return { status: response?.status, error }
    }
}

console.log({ sending: tx.toString('hex'), ef: ef.toString('hex') })

export default async function handler(req, res) {
    try {
        // grab a utxo from the key value store

        // get a value from vercel kvs
        const utxosString = (await kv.get('utxos')) || '[]'
        const utxos = JSON.parse(utxosString)
        const utxo = utxos.shift()

        const input = P2PKH.unlock(toUTXO(utxo), { privkey })
        const output = P2PKH.lock(utxo.satoshis - 2, { address: a })

        const inputs = [input]
        const outputs = [output]
        const change = { address: a.toString() }
        const { ef, tx } = forgeEfTx({ inputs, outputs })

        // spend it into a new utxo
        // send the transaction to ARC
        await broadcastToARC('https://api.taal.com/arc/v1/tx', ef, apiKey)

        // log the response in a key value store
        // return the response 200

        res.status(200).end()
    } catch (error) {
        console.log({ error })
        res.status(500).end()
    }
}
