import styles from '@/app/styles.module.css'

export default async function GroupTable({ groups }) {
    const total = groups.reduce((acc, group) => acc + Number(group.occurences), 0)
    return (
        <div>
            <p>One transaction every 2 minutes will be sent to ARC at TAAL. The response types will be counted below.</p>
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
                {groups.map(group => (
                    <tr key={group.tx_status}>
                        <td>
                            <div className={styles.left}>{group.tx_status}</div>
                        </td>
                        <td>
                            <div className={styles.center}>{group.occurences}</div>
                        </td>
                        <td>
                            <div className={styles.right}>{Number(100 * group.occurences/ total).toPrecision(3)} %</div>
                        </td>
                    </tr>
                ))}
                {groups.length === 0 && (
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
