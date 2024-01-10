import createTx from '@/app/api/createTx'
export async function GET() {
    return createTx()
}
