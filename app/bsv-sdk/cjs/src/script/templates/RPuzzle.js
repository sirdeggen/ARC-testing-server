"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OP_js_1 = require("../OP.js");
const LockingScript_js_1 = require("../LockingScript.js");
const UnlockingScript_js_1 = require("../UnlockingScript.js");
const PrivateKey_js_1 = require("../../primitives/PrivateKey.js");
const TransactionSignature_js_1 = require("../../primitives/TransactionSignature.js");
const Hash_js_1 = require("../../primitives/Hash.js");
/**
 * RPuzzle class implementing ScriptTemplate.
 *
 * This class provides methods to create R Puzzle and R Puzzle Hash locking and unlocking scripts, including the unlocking of UTXOs with the correct K value.
 */
class RPuzzle {
    /**
     * @constructor
     * Constructs an R Puzzle template instance for a given puzzle type
     *
     * @param {'raw'|'SHA1'|'SHA256'|'HASH256'|'RIPEMD160'|'HASH160'} type Denotes the type of puzzle to create
     */
    constructor(type = 'raw') {
        this.type = 'raw';
        this.type = type;
    }
    /**
     * Creates an R puzzle locking script for a given R value or R value hash.
     *
     * @param {number[]} value - An array representing the R value or its hash.
     * @returns {LockingScript} - An R puzzle locking script.
     */
    lock(value) {
        const chunks = [
            { op: OP_js_1.default.OP_OVER },
            { op: OP_js_1.default.OP_3 },
            { op: OP_js_1.default.OP_SPLIT },
            { op: OP_js_1.default.OP_NIP },
            { op: OP_js_1.default.OP_1 },
            { op: OP_js_1.default.OP_SPLIT },
            { op: OP_js_1.default.OP_SWAP },
            { op: OP_js_1.default.OP_SPLIT },
            { op: OP_js_1.default.OP_DROP }
        ];
        if (this.type !== 'raw') {
            chunks.push({
                op: OP_js_1.default['OP_' + this.type]
            });
        }
        chunks.push({ op: value.length, data: value });
        chunks.push({ op: OP_js_1.default.OP_EQUALVERIFY });
        chunks.push({ op: OP_js_1.default.OP_CHECKSIG });
        return new LockingScript_js_1.default(chunks);
    }
    /**
     * Creates a function that generates an R puzzle unlocking script along with its signature and length estimation.
     *
     * The returned object contains:
     * 1. `sign` - A function that, when invoked with a transaction and an input index,
     *    produces an unlocking script suitable for an R puzzle locked output.
     * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
     *
     * @param {BigNumber} k — The K-value used to unlock the R-puzzle.
     * @param {PrivateKey} privateKey - The private key used for signing the transaction. If not provided, a random key will be generated.
     * @param {'all'|'none'|'single'} signOutputs - The signature scope for outputs.
     * @param {boolean} anyoneCanPay - Flag indicating if the signature allows for other inputs to be added later.
     * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
     */
    unlock(k, privateKey, signOutputs = 'all', anyoneCanPay = false) {
        return {
            sign: async (tx, inputIndex) => {
                if (typeof privateKey === 'undefined') {
                    privateKey = PrivateKey_js_1.default.fromRandom();
                }
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
                const rawSignature = privateKey.sign((0, Hash_js_1.sha256)(preimage), undefined, true, k);
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
exports.default = RPuzzle;
//# sourceMappingURL=RPuzzle.js.map