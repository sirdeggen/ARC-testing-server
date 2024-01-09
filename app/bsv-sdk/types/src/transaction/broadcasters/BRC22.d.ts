import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js';
import Transaction from '../Transaction.js';
export default class ARC implements Broadcaster {
    URL: string;
    constructor(URL: string);
    broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure>;
}
//# sourceMappingURL=BRC22.d.ts.map