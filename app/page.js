import { sql } from '@vercel/postgres'
import TransactionTable from '@/app/comps/TransactionTable'

export default async function IndexPage() {
    const result = await sql`
        SELECT *
        FROM transactions
    `
    const transactions = result?.rows || []

    return (
        <main className="p-4 md:p-10 mx-auto max-w-7xl">
            <TransactionTable transactions={transactions} />
        </main>
    )
}
