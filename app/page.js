import TransactionTable from '@/app/comps/TransactionTable'
import styles from './styles.module.css'

export default async function IndexPage() {
    return (
        <main className={styles.bounding}>
            <TransactionTable />
        </main>
    )
}
