export default class ARC {
    URL;
    constructor(URL) {
        this.URL = URL;
    }
    async broadcast(tx) {
        const metadata = tx.metadata;
        if (!Array.isArray(metadata.topics)) {
            return {
                status: 'error',
                code: 'ERR_NO_TOPICS',
                description: 'The BRC-22 transaction broadcaster requires an array of topics in the transaction metadata.'
            };
        }
        const txHex = tx.toHex();
        return {
            status: 'success',
            txid: tx.id('hex'),
            message: 'OK'
        };
    }
}
//# sourceMappingURL=BRC22.js.map