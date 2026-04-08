import { kv } from '@vercel/kv'
import { createKysely } from '@vercel/postgres-kysely'

interface TxsTable {
    txid: string
    sourceTxid: string
    time: string
    http_status: string
    arc_status: string
    arc_title: string
    tx_status: string
    extra_info: string
    error: string
}

interface Database {
    txs: TxsTable
}
import { Transaction, PrivateKey, BigNumber, SatoshisPerKilobyte } from '@bsv/sdk'
import P2PKHT from '@/app/api/P2PKHT'

const { PRIVHEX, PUBKEYHASH, TAAL_KEY, ARC_URL } = process.env

interface ArcResponse {
    extraInfo?: string
    arcStatus?: string
    status?: string
    arcTitle?: string
    title?: string
    txStatus?: string
}

async function broadcastToARC(efHex: string): Promise<{ status: string; data?: ArcResponse; error?: unknown }> {
    let status: string | undefined
    let data: ArcResponse | undefined
    const endpoint = ARC_URL + '/v1/tx'
    try {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TAAL_KEY}`,
                'X-CallbackUrl': 'https://arctic.xn--nda.network/api/callback',
            },
            body: `{ "rawTx": "${efHex}" }`,
            signal: AbortSignal.timeout(10000)
        }
        const response = await fetch(endpoint, options)
        status = String(response?.status || 400)
        data = await response.json()
        return { status, data }
    } catch (error) {
        console.log({ error })
        if (!status) status = '400'
        return { status, error }
    }
}


export default async function createTx(offset: number) {
    try {
        const spendable = 'utxo_' + offset
        const running = await kv.get('running')
        if (!running) return Response.json({ success: false })

        const privkey = PrivateKey.fromString(PRIVHEX!, 16)
        const h = BigNumber.fromHex(PUBKEYHASH!, 'le')
        const pkh = h.toArray('le', 20)
        const time = new Date().toISOString()

        const utxos = await kv.get<string[]>(spendable)
        const utxo = utxos!.shift()!
        const sourceTransaction = Transaction.fromHex(utxo)
        const sourceTxid = sourceTransaction.id('hex')

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
        await tx.fee(new SatoshisPerKilobyte(100))
        await tx.sign()
        const rawtx = tx.toHex()
        const ef = tx.toHexEF()
        const txid = tx.id('hex')
        console.info({ txid, sourceTxid, rawtx, ef })

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
        if (data?.arcStatus) arc_status = data.status!
        if (data?.arcTitle) arc_title = data.title!
        if (data?.txStatus) tx_status = data.txStatus
        if (arcError) error = String(arcError)

        if ((arcError as Error)?.name === 'TimeoutError') {
            console.error('ARC request timed out after 10 seconds, we will save both old and new utxos and try again.')
            extra_info = 'Request timed out after 10s'
            utxos!.push(utxo)
            utxos!.push(rawtx)
        } else if (tx_status !== 'REJECTED') {
            utxos!.push(rawtx)
        } else {
            console.log('tx was rejected, removing unspendable utxo: ', sourceTxid)
        }
        await kv.set(spendable, utxos)

        console.log({ txid, time, http_status, arc_status, arc_title, tx_status, extra_info, error })
        const db = createKysely<Database>()
        await db
            .insertInto('txs')
            .values({ txid, sourceTxid, time, http_status, arc_status, arc_title, tx_status, extra_info, error })
            .execute()

        if (tx_status === 'SEEN_IN_ORPHAN_MEMPOOL') {
            await kv.set('running', 0)
            console.error('stopped running due to ' + tx_status + ' status for ' + txid + ' attempting to spend ' + spendable)
        }

        return Response.json({ txid, txStatus: tx_status })
    } catch (error) {
        console.error({ error })
        return Response.json({ success: false })
    }
}
