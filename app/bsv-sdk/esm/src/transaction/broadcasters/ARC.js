/**
 * Represents an ARC transaction broadcaster.
 */
export default class ARC {
    URL;
    apiKey;
    /**
     * Constructs an instance of the ARC broadcaster.
     *
     * @param {string} URL - The URL endpoint for the ARC API.
     * @param {string} apiKey - The API key used for authorization with the ARC API.
     */
    constructor(URL, apiKey) {
        this.URL = URL;
        this.apiKey = apiKey;
    }
    /**
     * Broadcasts a transaction via ARC.
     * This method will attempt to use `window.fetch` if available (in browser environments).
     * If running in a Node.js environment, it falls back to using the Node.js `https` module.
     *
     * @param {Transaction} tx - The transaction to be broadcasted.
     * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
     */
    async broadcast(tx) {
        const txHex = tx.toHex();
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ rawTx: txHex })
        };
        try {
            let response;
            let data = {};
            if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
                // Use fetch in a browser environment
                response = await window.fetch(`${this.URL}/v1/tx`, requestOptions);
                data = await response.json();
            }
            else if (typeof require !== 'undefined') {
                // Use Node.js https module
                // eslint-disable-next-line
                const https = require('https');
                response = await this.nodeFetch(https, requestOptions);
                data = JSON.parse(response);
            }
            else {
                throw new Error('No method available to perform HTTP request');
            }
            if (data.txid || response.ok || response.statusCode === 200) {
                return {
                    status: 'success',
                    txid: data.txid,
                    message: data?.txStatus + ' ' + data?.extraInfo
                };
            }
            else {
                return {
                    status: 'error',
                    code: data.status ? data.status : 'ERR_UNKNOWN',
                    description: data.detail ? data.detail : 'Unknown error'
                };
            }
        }
        catch (error) {
            return {
                status: 'error',
                code: '500',
                description: typeof error.message === 'string'
                    ? error.message
                    : 'Internal Server Error'
            };
        }
    }
    /** Helper function for Node.js HTTPS requests */
    async nodeFetch(https, requestOptions) {
        return await new Promise((resolve, reject) => {
            const req = https.request(`${this.URL}/v1/tx`, requestOptions, res => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });
            req.on('error', error => {
                reject(error);
            });
            if (requestOptions.body) {
                req.write(requestOptions.body);
            }
            req.end();
        });
    }
}
//# sourceMappingURL=ARC.js.map