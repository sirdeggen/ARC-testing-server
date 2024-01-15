import { BarChart } from "@tremor/react"
import styles from '@/app/styles.module.css'
import { success, questionable, failure, all, allColors } from '@/app/constants'

export default function Chart({ groups }) {
    const setOfCats = new Set()
    const data = groups.sort((a, b) => {
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1
        return 0
    }).reduce((all, group) => {
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
    return <div className={styles.chart}>
        <BarChart 
            data={data}
            index="date"
            categories={all}
            colors={allColors}
            yAxisWidth={50}
            stack={true}
            className="h-full my-4"
        />
    </div>
}
