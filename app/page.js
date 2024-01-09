import { sql } from '@vercel/postgres'
import TransactionTable from '@/app/comps/TransactionTable'
import styles from './styles.module.css'

export default async function IndexPage() {
    const result = await sql`
        SELECT * FROM transactions
    `
    const transactions = result?.rows || []

    return (
        <main className={styles.bounding}>
            <TransactionTable transactions={transactions} />
        </main>
    )
}
