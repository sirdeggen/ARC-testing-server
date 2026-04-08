'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from '@/app/styles.module.css'
import { all } from '@/app/constants'

const STATUS_COLORS: Record<string, string> = {
    UNKNOWN: '#64748b',
    QUEUED: '#94a3b8',
    RECEIVED: '#a1a1aa',
    STORED: '#06b6d4',
    ANNOUNCED_TO_NETWORK: '#14b8a6',
    REQUESTED_BY_NETWORK: '#10b981',
    SENT_TO_NETWORK: '#84cc16',
    ACCEPTED_BY_NETWORK: '#a3e635',
    SEEN_ON_NETWORK: '#22c55e',
    MINED: '#4ade80',
    CONFIRMED: '#38bdf8',
    SEEN_IN_ORPHAN_MEMPOOL: '#f87171',
    '': '#92400e',
    REJECTED: '#ef4444',
    ERROR_RESOLVED: '#71717a',
}

interface GroupRow {
    date: Date
    tx_status: string
    occurences: string
}

export default function Chart({ groups }: { groups: GroupRow[] }) {
    const data = groups.sort((a, b) => {
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1
        return 0
    }).reduce((acc: Record<string, string | number>[], group) => {
        const { date: d, tx_status, occurences } = group
        const date = new Date(d).toLocaleDateString(['en'], { dateStyle: 'medium' }).split(',')[0]
        const idx = acc.findIndex(a => a.date === date)
        if (idx !== -1) {
            acc[idx][tx_status] = Number(occurences)
            return acc
        }
        acc.push({ date, [tx_status]: Number(occurences) })
        return acc
    }, [])

    return <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                    tickLine={false}
                />
                <YAxis
                    width={60}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                {all.map(status => (
                    <Bar
                        key={status || 'empty'}
                        dataKey={status}
                        stackId="a"
                        fill={STATUS_COLORS[status] ?? '#888'}
                        name={status || '(empty)'}
                        radius={status === all[all.length - 1] ? [3, 3, 0, 0] : undefined}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
}
