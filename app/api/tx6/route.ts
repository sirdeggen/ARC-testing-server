export const dynamic = 'force-dynamic'
import createTx from '@/app/api/createTx'
export async function GET() {
    return createTx(6)
}
