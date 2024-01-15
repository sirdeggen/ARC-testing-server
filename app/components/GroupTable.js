import styles from '@/app/styles.module.css'
import { success, questionable, resolved } from '@/app/constants'

export default async function GroupTable({ table }) {
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
            <h3 className='my-3 font-semibold'>Success Rate (Last 24h)</h3>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th
                        scope="col"
                        className={styles.left}                   >
                        Status
                    </th>
                    <th
                        scope="col" className={styles.center}
                                               >
                        Count
                    </th>
                    <th
                        scope="col"
                        className={styles.right}                >
                        % of Total
                    </th>
                </tr>
            </thead>
            <tbody>
                {stats.map((group, idx) => {
                    const rate = Number(100 * group.occurences/ total)
                    return (
                        <tr key={idx}>
                            <td>
                                <div className={styles.left}>{group.status}</div>
                            </td>
                            <td>
                                <div className={styles.center}>{group.occurences}</div>
                            </td>
                            <td className={Math.round(rate * 10) >= 999 ? styles.success : ''}>
                                <div className={styles.right}>{rate.toPrecision(3)} %</div>
                            </td>
                        </tr>)
                })}
                {table.length === 0 && (
                    <tr>
                        <td colSpan={7}>
                            <div>No data to display</div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        </div>
    )
}
