import styles from '@/app/styles.module.css'
import { success, questionable, resolved } from '@/app/constants'

interface TableRow {
    tx_status: string
    occurences: string
}

const STAT_CONFIG = [
    { label: 'Success', color: 'bg-emerald-500/20 text-emerald-400', icon: '●' },
    { label: 'Resolved', color: 'bg-slate-500/20 text-slate-400', icon: '●' },
    { label: 'Questionable', color: 'bg-amber-500/20 text-amber-400', icon: '●' },
    { label: 'Failure', color: 'bg-red-500/20 text-red-400', icon: '●' },
]

export default async function GroupTable({ table }: { table: TableRow[] }) {
    const total = table.reduce((acc, group) => acc + Number(group.occurences), 0)
    const stats = table.reduce((acc, group) => {
        const { tx_status, occurences } = group
        if (success.indexOf(tx_status) != -1) {
            acc[0].occurences += Number(occurences)
            return acc
        }
        if (questionable.indexOf(tx_status) != -1) {
            acc[2].occurences += Number(occurences)
            return acc
        }
        if (resolved.indexOf(tx_status) != -1) {
            acc[1].occurences += Number(occurences)
            return acc
        }
        acc[3].occurences += Number(occurences)
        return acc
    }, [{ status: "SUCCESS", occurences: 0 }, { status: "ERRORS_RESOLVED", occurences: 0 }, { status: "QUESTIONABLE", occurences: 0 }, { status: "FAILURE", occurences: 0 }])

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Last 24 Hours</h2>
            <div className={styles.statGrid}>
                {stats.map((group, idx) => {
                    const rate = total > 0 ? Number(100 * group.occurences / total) : 0
                    const config = STAT_CONFIG[idx]
                    return (
                        <div key={idx} className={styles.card}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${config.color}`}>
                                    {config.icon}
                                </span>
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    {config.label}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-slate-100 tabular-nums">
                                {group.occurences.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 tabular-nums">
                                {rate.toPrecision(3)}% of total
                            </div>
                        </div>
                    )
                })}
            </div>
            {table.length === 0 && (
                <div className={`${styles.card} mt-3 text-center text-slate-500 text-sm`}>
                    No data to display
                </div>
            )}
        </div>
    )
}
