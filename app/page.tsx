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
        where time >= NOW() - '1 day'::INTERVAL
        group by tx_status
    `

    const result = await sql`
        select *
        from txs
        where tx_status!='ERROR_RESOLVED' and tx_status!='SEEN_ON_NETWORK' and tx_status!='MINED' and tx_status!='CONFIRMED' and tx_status!='STORED' and tx_status!='ANNOUNCED_TO_NETWORK' and tx_status!='REQUESTED_BY_NETWORK' and tx_status!='SENT_TO_NETWORK' and tx_status!='ACCEPTED_BY_NETWORK'
    `

    const transactions = result?.rows || []
    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        <span className={styles.arc}>ARC</span>TIC
                    </h1>
                    {running
                        ? <span className={styles.green}>online</span>
                        : <span className={styles.red}>offline</span>
                    }
                </div>
                <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                    Monitoring transaction broadcasting on the BSV Blockchain.
                    One transaction per minute sent to ARC, targeting 99.9% success rate.
                </p>
            </header>

            {/* Chart Section */}
            <section className={`${styles.card} mb-6`}>
                <h2 className="text-lg font-semibold mb-4 text-slate-200">Transaction History</h2>
                <Chart groups={groups as any} />
            </section>

            {/* Stats Section */}
            <section className="mb-6">
                <GroupTable table={table as any} />
            </section>

            {/* Errors Section */}
            <section className={`${styles.card}`}>
                <TransactionTable transactions={transactions as any} />
            </section>
        </main>
    )
}
