export const dynamic = 'force-dynamic'
import { createKysely } from "@vercel/postgres-kysely"

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
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        console.log({ data })
        if (data?.txid && data?.txStatus === 'MINED') {
            const db = createKysely<Database>()
            await db
                .updateTable('txs')
                .set({ tx_status: data.txStatus })
                .where('txid', '=', data.txid)
                .executeTakeFirst()
        }
        return Response.json({ ok: true })
    } catch (error) {
        console.log({ error })
        return Response.json({ ok: false })
    }
}
