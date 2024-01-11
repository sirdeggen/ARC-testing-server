import { BarChart } from "@tremor/react"
import { success, questionable, failure } from '@/app/constants'

export default function Chart({ groups }) {
    const setOfCats = new Set()
    const data = groups.reduce((all, group) => {
        const { date: d, tx_status, occurences } = group
        const date = d.toLocaleDateString(['en'], { dateStyle: 'medium' }).split(',')[0]
        const idx = all.findIndex(a => a.date === date)
        setOfCats.add(tx_status)
        if (idx !== -1) {
            all[idx][tx_status] = Number(occurences)
            return all
        }
        all.push({ date, [tx_status]: Number(occurences) })
        return all
    }, [])

    const cats = Array.from(setOfCats)
    return <BarChart 
        data={data}
        index="date"
        categories={["UNKNOWN", "QUEUED", "RECEIVED","STORED","ANNOUNCED_TO_NETWORK", "REQUESTED_BY_NETWORK","SENT_TO_NETWORK", "ACCEPTED_BY_NETWORK","SEEN_ON_NETWORK",  "MINED", "CONFIRMED", "SEEN_IN_ORPHAN_MEMPOOL", "", "REJECTED"]}
        colors={["black", "gray", "stone", "cyan", "teal", "emerald", "lime", "lime", "green", "green", "sky", "red", "brown", "red"]}
        yAxisWidth={50}
        stack={true}
        className="h-80 my-4"
    />
}
