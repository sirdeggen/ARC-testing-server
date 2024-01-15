import styles from '@/app/styles.module.css'

export default async function TransactionTable({ transactions }) {
    return (
        <div>
            <h3 className='my-3 font-semibold'>Unresolved Questionable Responses and Failures, for Investigation</h3>
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
                            SourceTxid
                        </th>
                        <th
                            scope="col"
                                                   >
                            Https Status
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
                    {transactions.map((transaction, idx) => {
                        const timestamp = new Date(transaction.time * 1)
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
