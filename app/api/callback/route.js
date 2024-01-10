export const dynamic = 'force-dynamic'
import { createKysely } from "@vercel/postgres-kysely"

export async function POST(req, res) {
    const data = await req.json()
    console.log({ data })
    if (data?.txid && data?.txStatus === 'MINED') {
        // update database
        const db = createKysely()
        await db
            .updateTable('txs')
            .where('txid', '=', data.txid)
            .set('tx_status', data.txStatus)
            .execute()
    }
    return Response.json({ ok: true })
}
