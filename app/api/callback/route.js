export async function POST(req, res) {
    console.log(req?.body || {})
    res.status(200).end()
}
