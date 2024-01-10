export const dynamic = 'force-dynamic'
import createTx from '@/app/api/createTx'
export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return createTx()
}
