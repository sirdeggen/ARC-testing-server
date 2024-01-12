export const dynamic = 'force-dynamic'
import { createKysely } from "@vercel/postgres-kysely"

export async function POST(req, res) {
    try {
        const data = await req.json()
        console.log({ data })
        if (data?.txid && data?.txStatus === 'MINED') {
            // update database
            const db = createKysely()
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
