import GroupTable from '@/app/comps/GroupTable'
import TransactionTable from '@/app/comps/TransactionTable'
import styles from './styles.module.css'
import { sql } from '@vercel/postgres'

export const revalidate = 120

export default async function IndexPage() {
    const { rows: groups } = await sql`
            select tx_status, count(tx_status) as occurences
            from transactions
            group by tx_status
        `

    const result = await sql`
        select *
        from transactions
        where tx_status!='SEEN_ON_NETWORK'
    `
    const transactions = result?.rows || []
    return (
        <main className={styles.bounding}>
            <h1><span href="https://github.com/bitcoin-sv/arc" target="_blank" className={styles.arc}>ARC</span>TIC</h1>
            <h3>
                Real World Monitoring Tool for Transaction Broadcasting on the BSV Blockchain.
            </h3>
            <GroupTable groups={groups} />
            <hr />
            <TransactionTable transactions={transactions} />
        </main>
    )
}
