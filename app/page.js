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
            <TransactionTable transactions={transactions} groups={groups} />
        </main>
    )
}
