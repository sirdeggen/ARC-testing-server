export async function POST(req, res) {
    console.dir(req?.body || {}, { depth: null })
    res.status(200).end()
}
