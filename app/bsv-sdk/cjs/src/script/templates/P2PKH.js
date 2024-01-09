"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OP_js_1 = require("../OP.js");
const LockingScript_js_1 = require("../LockingScript.js");
const UnlockingScript_js_1 = require("../UnlockingScript.js");
const TransactionSignature_js_1 = require("../../primitives/TransactionSignature.js");
const Hash_js_1 = require("../../primitives/Hash.js");
/**
 * P2PKH (Pay To Public Key Hash) class implementing ScriptTemplate.
 *
 * This class provides methods to create Pay To Public Key Hash locking and unlocking scripts, including the unlocking of P2PKH UTXOs with the private key.
 */
class P2PKH {
    /**
     * Creates a P2PKH locking script for a given public key hash.
     *
     * @param {number[]} pubkeyhash - An array representing the public key hash.
     * @returns {LockingScript} - A P2PKH locking script.
     */
    lock(pubkeyhash) {
        return new LockingScript_js_1.default([
            { op: OP_js_1.default.OP_DUP },
            { op: OP_js_1.default.OP_HASH160 },
            { op: pubkeyhash.length, data: pubkeyhash },
            { op: OP_js_1.default.OP_EQUALVERIFY },
            { op: OP_js_1.default.OP_CHECKSIG }
        ]);
    }
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
    unlock(privateKey, signOutputs = 'all', anyoneCanPay = false) {
        return {
            sign: async (tx, inputIndex) => {
                let signatureScope = TransactionSignature_js_1.default.SIGHASH_FORKID;
                if (signOutputs === 'all') {
                    signatureScope |= TransactionSignature_js_1.default.SIGHASH_ALL;
                }
                if (signOutputs === 'none') {
                    signatureScope |= TransactionSignature_js_1.default.SIGHASH_NONE;
                }
                if (signOutputs === 'single') {
                    signatureScope |= TransactionSignature_js_1.default.SIGHASH_SINGLE;
                }
                if (anyoneCanPay) {
                    signatureScope |= TransactionSignature_js_1.default.SIGHASH_ANYONECANPAY;
                }
                const otherInputs = [...tx.inputs];
                const [input] = otherInputs.splice(inputIndex, 1);
                if (typeof input.sourceTransaction !== 'object') {
                    // Question: Should the library support use-cases where the source transaction is not provided? This is to say, is it ever acceptable for someone to sign an input spending some output from a transaction they have not provided? Some elements (such as the satoshi value and output script) are always required. A merkle proof is also always required, and verifying it (while also verifying that the claimed output is contained within the claimed transaction) is also always required. This seems to require the entire input transaction.
                    throw new Error('The source transaction is needed for transaction signing.');
                }
                const preimage = TransactionSignature_js_1.default.format({
                    sourceTXID: input.sourceTransaction.id('hex'),
                    sourceOutputIndex: input.sourceOutputIndex,
                    sourceSatoshis: input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis,
                    transactionVersion: tx.version,
                    otherInputs,
                    inputIndex,
                    outputs: tx.outputs,
                    inputSequence: input.sequence,
                    subscript: input.sourceTransaction.outputs[input.sourceOutputIndex].lockingScript,
                    lockTime: tx.lockTime,
                    scope: signatureScope
                });
                const rawSignature = privateKey.sign((0, Hash_js_1.sha256)(preimage));
                const sig = new TransactionSignature_js_1.default(rawSignature.r, rawSignature.s, signatureScope);
                const sigForScript = sig.toChecksigFormat();
                const pubkeyForScript = privateKey.toPublicKey().encode(true);
                return new UnlockingScript_js_1.default([
                    { op: sigForScript.length, data: sigForScript },
                    { op: pubkeyForScript.length, data: pubkeyForScript }
                ]);
            },
            estimateLength: async () => {
                // public key (1+33) + signature (1+71)
                // Note: We add 1 to each element's length because of the associated OP_PUSH
                return 106;
            }
        };
    }
}
exports.default = P2PKH;
//# sourceMappingURL=P2PKH.js.map