import styles from '@/app/styles.module.css'

export default function TransactionTable({ transactions }) {
    return (
        <div>
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                        <table className={styles.table}>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Txid
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Time
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Https Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Arc Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Arc Title
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Tx Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                                    >
                                        Extra Info
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map(transaction => {
                                    const timestamp = new Date(transaction.time * 1)
                                    return <tr key={transaction.txid}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900"><a target="_blank" href={`https://whatsonchain.com/tx/${transaction.txid}`}>{transaction.txid.slice(0,8)}...</a></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{timestamp.toLocaleTimeString()} - {timestamp.toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{transaction.https_status}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{transaction.arc_status}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{transaction.arc_title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{transaction.tx_status}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{transaction.extra_info}</div>
                                        </td>
                                    </tr>
                                })}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">No transactions found.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
