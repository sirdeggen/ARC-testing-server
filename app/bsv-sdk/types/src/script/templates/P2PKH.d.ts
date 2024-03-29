import ScriptTemplate from '../ScriptTemplate.js';
import LockingScript from '../LockingScript.js';
import UnlockingScript from '../UnlockingScript.js';
import Transaction from '../../transaction/Transaction.js';
import PrivateKey from '../../primitives/PrivateKey.js';
/**
 * P2PKH (Pay To Public Key Hash) class implementing ScriptTemplate.
 *
 * This class provides methods to create Pay To Public Key Hash locking and unlocking scripts, including the unlocking of P2PKH UTXOs with the private key.
 */
export default class P2PKH implements ScriptTemplate {
    /**
     * Creates a P2PKH locking script for a given public key hash.
     *
     * @param {number[]} pubkeyhash - An array representing the public key hash.
     * @returns {LockingScript} - A P2PKH locking script.
     */
    lock(pubkeyhash: number[]): LockingScript;
    /**
     * Creates a function that generates a P2PKH unlocking script along with its signature and length estimation.
     *
     * The returned object contains:
     * 1. `sign` - A function that, when invoked with a transaction and an input index,
     *    produces an unlocking script suitable for a P2PKH locked output.
     * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
     *
     * @param {PrivateKey} privateKey - The private key used for signing the transaction.
     * @param {'all'|'none'|'single'} signOutputs - The signature scope for outputs.
     * @param {boolean} anyoneCanPay - Flag indicating if the signature allows for other inputs to be added later.
     * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
     */
    unlock(privateKey: PrivateKey, signOutputs?: 'all' | 'none' | 'single', anyoneCanPay?: boolean): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: () => Promise<106>;
    };
}
//# sourceMappingURL=P2PKH.d.ts.map