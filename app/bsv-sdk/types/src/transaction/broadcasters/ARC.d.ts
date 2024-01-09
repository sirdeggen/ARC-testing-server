import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js';
import Transaction from '../Transaction.js';
/**
 * Represents an ARC transaction broadcaster.
 */
export default class ARC implements Broadcaster {
    URL: string;
    apiKey: string;
    /**
     * Constructs an instance of the ARC broadcaster.
     *
     * @param {string} URL - The URL endpoint for the ARC API.
     * @param {string} apiKey - The API key used for authorization with the ARC API.
     */
    constructor(URL: string, apiKey: string);
    /**
     * Broadcasts a transaction via ARC.
     * This method will attempt to use `window.fetch` if available (in browser environments).
     * If running in a Node.js environment, it falls back to using the Node.js `https` module.
     *
     * @param {Transaction} tx - The transaction to be broadcasted.
     * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
     */
    broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure>;
    /** Helper function for Node.js HTTPS requests */
    private nodeFetch;
}
//# sourceMappingURL=ARC.d.ts.map