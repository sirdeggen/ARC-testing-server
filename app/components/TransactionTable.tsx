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

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        REJECTED: 'bg-red-500/15 text-red-400',
        SEEN_IN_ORPHAN_MEMPOOL: 'bg-amber-500/15 text-amber-400',
    }
    const cls = colors[status] ?? 'bg-slate-500/15 text-slate-400'
    return (
        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
            {status}
        </span>
    )
}

export default async function TransactionTable({ transactions }: { transactions: TransactionRow[] }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-200">Issues</h2>
                {transactions.length > 0 && (
                    <span className="text-xs bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full font-medium">
                        {transactions.length} unresolved
                    </span>
                )}
            </div>
            <div className={styles.tableWrapper}>
                {/* Desktop table */}
                <table className={`${styles.table} hidden sm:table`}>
                    <thead>
                        <tr>
                            <th scope="col">Txid</th>
                            <th scope="col">Time</th>
                            <th scope="col">Source</th>
                            <th scope="col">HTTP</th>
                            <th scope="col">Status</th>
                            <th scope="col">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, idx) => {
                            const timestamp = new Date(Number(tx.time))
                            return <tr key={idx}>
                                <td>
                                    <a target="_blank" href={`https://whatsonchain.com/tx/${tx.txid}`}
                                       className="font-mono text-xs">
                                        {tx.txid.slice(0, 10)}...
                                    </a>
                                </td>
                                <td className="text-xs text-slate-400 whitespace-nowrap">
                                    {timestamp.toLocaleTimeString()} {timestamp.toLocaleDateString()}
                                </td>
                                <td>
                                    <a target="_blank" href={`https://whatsonchain.com/tx/${tx.sourceTxid}`}
                                       className="font-mono text-xs">
                                        {tx.sourceTxid?.slice(0, 10)}...
                                    </a>
                                </td>
                                <td className="font-mono text-xs">{tx.http_status}</td>
                                <td><StatusBadge status={tx.tx_status} /></td>
                                <td className="text-xs text-slate-400 max-w-48 truncate">{tx.extra_info}</td>
                            </tr>
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-slate-500 py-8">
                                    All clear — no unresolved issues
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Mobile card list */}
                <div className="sm:hidden space-y-3">
                    {transactions.map((tx, idx) => {
                        const timestamp = new Date(Number(tx.time))
                        return (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                                <div className="flex items-center justify-between">
                                    <a target="_blank" href={`https://whatsonchain.com/tx/${tx.txid}`}
                                       className="font-mono text-xs text-blue-400">
                                        {tx.txid.slice(0, 16)}...
                                    </a>
                                    <StatusBadge status={tx.tx_status} />
                                </div>
                                <div className="text-xs text-slate-500">
                                    {timestamp.toLocaleTimeString()} - {timestamp.toLocaleDateString()}
                                </div>
                                {tx.extra_info && (
                                    <div className="text-xs text-slate-400">{tx.extra_info}</div>
                                )}
                            </div>
                        )
                    })}
                    {transactions.length === 0 && (
                        <div className="text-center text-slate-500 py-8 text-sm">
                            All clear — no unresolved issues
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
