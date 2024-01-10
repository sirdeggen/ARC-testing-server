import { BarChart } from "@tremor/react"

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
        categories={cats}
        colors={["lime", "sky", "blue", "yellow", "red", "fuchsia", "purple", "indigo", "orange", "teal", "green", "cyan", "pink", "brown", "gray", "black"]}
        yAxisWidth={20}
        stack={true}
        className="h-80 m-4"
    />
}