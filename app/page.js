import Chart from '@/app/components/Chart'
import GroupTable from '@/app/components/GroupTable'
import TransactionTable from '@/app/components/TransactionTable'
import styles from './styles.module.css'
import { sql } from '@vercel/postgres'
import { kv } from '@vercel/kv'

export const revalidate = 60

export default async function IndexPage() {
    const running = await kv.get('running')
    const { rows: groups } = await sql`
            select tx_status, count(tx_status) as occurences, Date(time) as date
            from txs
            group by date, tx_status
        `

    const { rows: table } = await sql`
        select tx_status, count(tx_status) as occurences
        from txs
        group by tx_status
    `

    const result = await sql`
        select *
        from txs
        where tx_status='SEEN_ON_NETWORK' and tx_status!='MINED' and tx_status!='CONFIRMED' and tx_status!='STORED' and tx_status!='ANNOUNCED_TO_NETWORK' and tx_status!='REQUESTED_BY_NETWORK' and tx_status!='SENT_TO_NETWORK' and tx_status!='ACCEPTED_BY_NETWORK'
    `

    const transactions = result?.rows || []
    return (
        <main className="p-12">
            <h1><span className={styles.arc}>ARC</span>TIC {!running && <span className={styles.red}>_down_</span>}</h1>
            <h3>
                Real World Monitoring Tool for Transaction Broadcasting on the BSV Blockchain.
            </h3>
            <p>One transaction every 10 seconds will be sent to ARC at TAAL. The response types will be counted below.</p>
            <Chart groups={groups} />
            <GroupTable table={table} />
            <hr />
            <TransactionTable transactions={transactions} />
        </main>
    )
}
