import { sql } from '@vercel/postgres'
import styles from '@/app/styles.module.css'

export default async function TransactionTable() {
    const { rows: groups } = await sql`
            select tx_status, count(tx_status) as occurences
            from transactions
            group by tx_status
        `
    const total = groups.reduce((acc, group) => acc + group.occurences, 0)
    
    const result = await sql`
        select *
        from transactions
        where tx_status!='SEEN_ON_NETWORK'
    `
    const transactions = result?.rows || []
    return (
        <div>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th
                        scope="col"
                        className={styles.left}                   >
                        Status
                    </th>
                    <th
                        scope="col" className={styles.center}
                                               >
                        Count
                    </th>
                    <th
                        scope="col"
                        className={styles.right}                >
                        % of Total
                    </th>
                </tr>
            </thead>
            <tbody>
                {groups.map(group => (
                    <tr key={group.tx_status}>
                        <td>
                            <div className={styles.left}>{group.tx_status}</div>
                        </td>
                        <td>
                            <div className={styles.center}>{group.occurences}</div>
                        </td>
                        <td>
                            <div className={styles.right}>{Number(100 * group.occurences/ total).toPrecision(3)} %</div>
                        </td>
                    </tr>
                ))}
                {groups.length === 0 && (
                    <tr>
                        <td colSpan={7}>
                            <div>No data to display</div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        <hr />
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th
                            scope="col"
                                                   >
                            Txid
                        </th>
                        <th
                            scope="col"
                                                   >
                            Time
                        </th>
                        <th
                            scope="col"
                                                   >
                            Https Status
                        </th>
                        <th
                            scope="col"
                                                   >
                            Arc Status
                        </th>
                        <th
                            scope="col"
                                                   >
                            Arc Title
                        </th>
                        <th scope="col">
                            Tx Status
                        </th>
                        <th
                            scope="col">
                            Extra Info
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => {
                        const timestamp = new Date(transaction.time * 1)
                        return <tr key={transaction.txid}>
                            <td>
                                <div><a target="_blank" href={`https://whatsonchain.com/tx/${transaction.txid}`}>{transaction.txid.slice(0,8)}...</a></div>
                            </td>
                            <td>
                                <div>{timestamp.toLocaleTimeString()} - {timestamp.toLocaleDateString()}</div>
                            </td>
                            <td>
                                <div>{transaction.https_status}</div>
                            </td>
                            <td>
                                <div>{transaction.arc_status}</div>
                            </td>
                            <td>
                                <div>{transaction.arc_title}</div>
                            </td>
                            <td>
                                <div>{transaction.tx_status}</div>
                            </td>
                            <td>
                                <div>{transaction.extra_info}</div>
                            </td>
                        </tr>
                    })}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={7}>
                                <div>No errors raised, all transactions seem to have been accepted by the network</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
