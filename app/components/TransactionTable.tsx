import styles from '@/app/styles.module.css'

interface TransactionRow {
    txid: string
    time: string
    sourceTxid: string
    http_status: string
    arc_title: string
    tx_status: string
    extra_info: string
}

export default async function TransactionTable({ transactions }: { transactions: TransactionRow[] }) {
    return (
        <div>
            <h3 className='my-3 font-semibold'>Unresolved Questionable Responses and Failures, for Investigation</h3>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope="col">Txid</th>
                        <th scope="col">Time</th>
                        <th scope="col">SourceTxid</th>
                        <th scope="col">Https Status</th>
                        <th scope="col">Arc Title</th>
                        <th scope="col">Tx Status</th>
                        <th scope="col">Extra Info</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, idx) => {
                        const timestamp = new Date(Number(transaction.time))
                        return <tr key={idx}>
                            <td>
                                <div><a target="_blank" href={`https://whatsonchain.com/tx/${transaction.txid}`}>{transaction.txid.slice(0,8)}...</a></div>
                            </td>
                            <td>
                                <div>{timestamp.toLocaleTimeString()} - {timestamp.toLocaleDateString()}</div>
                            </td>
                            <td>
                                <div><a target="_blank" href={`https://whatsonchain.com/tx/${transaction.sourceTxid}`}>{transaction.sourceTxid?.slice(0,8)}...</a></div>
                            </td>
                            <td>
                                <div>{transaction.http_status}</div>
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
