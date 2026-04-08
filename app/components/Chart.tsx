'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from '@/app/styles.module.css'
import { all } from '@/app/constants'

const STATUS_COLORS: Record<string, string> = {
    UNKNOWN: '#000000',
    QUEUED: '#808080',
    RECEIVED: '#78716c',
    STORED: '#06b6d4',
    ANNOUNCED_TO_NETWORK: '#14b8a6',
    REQUESTED_BY_NETWORK: '#10b981',
    SENT_TO_NETWORK: '#84cc16',
    ACCEPTED_BY_NETWORK: '#84cc16',
    SEEN_ON_NETWORK: '#22c55e',
    MINED: '#22c55e',
    CONFIRMED: '#0ea5e9',
    SEEN_IN_ORPHAN_MEMPOOL: '#ef4444',
    '': '#92400e',
    REJECTED: '#ef4444',
    ERROR_RESOLVED: '#a3a3a3',
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
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
                <XAxis dataKey="date" />
                <YAxis width={50} />
                <Tooltip />
                <Legend />
                {all.map(status => (
                    <Bar
                        key={status || 'empty'}
                        dataKey={status}
                        stackId="a"
                        fill={STATUS_COLORS[status] ?? '#888'}
                        name={status || '(empty)'}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
}
