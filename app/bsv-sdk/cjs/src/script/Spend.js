"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Script_js_1 = require("./Script.js");
const BigNumber_js_1 = require("../primitives/BigNumber.js");
const OP_js_1 = require("./OP.js");
const utils_js_1 = require("../primitives/utils.js");
const Hash = require("../primitives/Hash.js");
const TransactionSignature_js_1 = require("../primitives/TransactionSignature.js");
const PublicKey_js_1 = require("../primitives/PublicKey.js");
const ECDSA_js_1 = require("../primitives/ECDSA.js");
// These constants control the current behavior of the interpreter.
// In the future, all of them will go away.
const maxScriptElementSize = 1024 * 1024 * 1024;
const maxMultisigKeyCount = Math.pow(2, 31) - 1;
const requireMinimalPush = true;
const requirePushOnlyUnlockingScripts = true;
const requireLowSSignatures = true;
const requireCleanStack = true;
/**
 * The Spend class represents a spend action within a Bitcoin SV transaction.
 * It encapsulates all the necessary data required for spending a UTXO (Unspent Transaction Output)
 * and includes details about the source transaction, output, and the spending transaction itself.
 *
 * @property {string} sourceTXID - The transaction ID of the source UTXO.
 * @property {number} sourceOutputIndex - The index of the output in the source transaction.
 * @property {BigNumber} sourceSatoshis - The amount of satoshis in the source UTXO.
 * @property {LockingScript} lockingScript - The locking script associated with the UTXO.
 * @property {number} transactionVersion - The version of the current transaction.
 * @property {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} otherInputs -
 *           An array of other inputs in the transaction, each with a txid, outputIndex, and sequence number.
 * @property {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} outputs -
 *           An array of outputs of the current transaction, including the satoshi value and locking script for each.
 * @property {number} inputIndex - The index of this input in the current transaction.
 * @property {UnlockingScript} unlockingScript - The unlocking script that unlocks the UTXO for spending.
 * @property {number} inputSequence - The sequence number of this input.
 */
class Spend {
    /**
     * @constructor
     * Constructs the Spend object with necessary transaction details.
     * @param {string} params.sourceTXID - The transaction ID of the source UTXO.
     * @param {number} params.sourceOutputIndex - The index of the output in the source transaction.
     * @param {BigNumber} params.sourceSatoshis - The amount of satoshis in the source UTXO.
     * @param {LockingScript} params.lockingScript - The locking script associated with the UTXO.
     * @param {number} params.transactionVersion - The version of the current transaction.
     * @param {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} params.otherInputs -
     *        An array of other inputs in the transaction.
     * @param {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} params.outputs -
     *        The outputs of the current transaction.
     * @param {number} params.inputIndex - The index of this input in the current transaction.
     * @param {UnlockingScript} params.unlockingScript - The unlocking script for this spend.
     * @param {number} params.inputSequence - The sequence number of this input.
     * @param {number} params.lockTime - The lock time of the transaction.
     *
     * @example
     * const spend = new Spend({
     *   sourceTXID: "abcd1234", // sourceTXID
     *   sourceOutputIndex: 0, // sourceOutputIndex
     *   sourceSatoshis: new BigNumber(1000), // sourceSatoshis
     *   lockingScript: LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
     *   transactionVersion: 1, // transactionVersion
     *   otherInputs: [{ sourceTXID: "abcd1234", sourceOutputIndex: 1, sequence: 0xffffffff }], // otherInputs
     *   outputs: [{ satoshis: new BigNumber(500), lockingScript: LockingScript.fromASM("OP_DUP...") }], // outputs
     *   inputIndex: 0, // inputIndex
     *   unlockingScript: UnlockingScript.fromASM("3045... 02ab..."),
     *   inputSequence: 0xffffffff // inputSequence
     * });
     */
    constructor(params) {
        this.sourceTXID = params.sourceTXID;
        this.sourceOutputIndex = params.sourceOutputIndex;
        this.sourceSatoshis = params.sourceSatoshis;
        this.lockingScript = params.lockingScript;
        this.transactionVersion = params.transactionVersion;
        this.otherInputs = params.otherInputs;
        this.outputs = params.outputs;
        this.inputIndex = params.inputIndex;
        this.unlockingScript = params.unlockingScript;
        this.inputSequence = params.inputSequence;
        this.lockTime = params.lockTime;
        this.reset();
    }
    reset() {
        this.context = 'UnlockingScript';
        this.programCounter = 0;
        this.lastCodeSeparator = null;
        this.stack = [];
        this.altStack = [];
        this.ifStack = [];
    }
    step() {
        // If the context is UnlockingScript and we have reached the end,
        // set the context to LockingScript and zero the program counter
        if (this.context === 'UnlockingScript' &&
            this.programCounter >= this.unlockingScript.chunks.length) {
            this.context = 'LockingScript';
            this.programCounter = 0;
        }
        let operation;
        if (this.context === 'UnlockingScript') {
            operation = this.unlockingScript.chunks[this.programCounter];
        }
        else {
            operation = this.lockingScript.chunks[this.programCounter];
        }
        const isOpcodeDisabled = (op) => {
            return op === OP_js_1.default.OP_2MUL ||
                op === OP_js_1.default.OP_2DIV ||
                op === OP_js_1.default.OP_VERIF ||
                op === OP_js_1.default.OP_VERNOTIF ||
                op === OP_js_1.default.OP_VER;
        };
        const isChunkMinimal = (chunk) => {
            const data = chunk.data;
            const op = chunk.op;
            if (!Array.isArray(data)) {
                return true;
            }
            if (data.length === 0) {
                // Could have used OP_0.
                return op === OP_js_1.default.OP_0;
            }
            else if (data.length === 1 && data[0] >= 1 && data[0] <= 16) {
                // Could have used OP_1 .. OP_16.
                return op === OP_js_1.default.OP_1 + (data[0] - 1);
            }
            else if (data.length === 1 && data[0] === 0x81) {
                // Could have used OP_1NEGATE.
                return op === OP_js_1.default.OP_1NEGATE;
            }
            else if (data.length <= 75) {
                // Could have used a direct push (opCode indicating number of bytes pushed + those bytes).
                return op === data.length;
            }
            else if (data.length <= 255) {
                // Could have used OP_PUSHDATA.
                return op === OP_js_1.default.OP_PUSHDATA1;
            }
            else if (data.length <= 65535) {
                // Could have used OP_PUSHDATA2.
                return op === OP_js_1.default.OP_PUSHDATA2;
            }
            return true;
        };
        // NOTE: Is 4 still the default maximum number size?
        // In Genesis, was it lifted to 750000?
        const isMinimallyEncoded = (buf, maxNumSize = 4) => {
            if (buf.length > maxNumSize) {
                return false;
            }
            if (buf.length > 0) {
                // Check that the number is encoded with the minimum possible number
                // of bytes.
                //
                // If the most-significant-byte - excluding the sign bit - is zero
                // then we're not minimal. Note how this test also rejects the
                // negative-zero encoding, 0x80.
                if ((buf[buf.length - 1] & 0x7f) === 0) {
                    // One exception: if there's more than one byte and the most
                    // significant bit of the second-most-significant-byte is set it
                    // would conflict with the sign bit. An example of this case is
                    // +-255, which encode to 0xff00 and 0xff80 respectively.
                    // (big-endian).
                    if (buf.length <= 1 || (buf[buf.length - 2] & 0x80) === 0) {
                        return false;
                    }
                }
            }
            return true;
        };
        const minimallyEncode = (buf) => {
            if (buf.length === 0) {
                return buf;
            }
            // If the last byte is not 0x00 or 0x80, we are minimally encoded.
            const last = buf[buf.length - 1];
            if ((last & 0x7f) !== 0) {
                return buf;
            }
            // If the script is one byte long, then we have a zero, which encodes as an
            // empty array.
            if (buf.length === 1) {
                return [];
            }
            // If the next byte has it sign bit set, then we are minimaly encoded.
            if ((buf[buf.length - 2] & 0x80) !== 0) {
                return buf;
            }
            // We are not minimally encoded, we need to figure out how much to trim.
            for (let i = buf.length - 1; i > 0; i--) {
                // We found a non zero byte, time to encode.
                if (buf[i - 1] !== 0) {
                    if ((buf[i - 1] & 0x80) !== 0) {
                        // We found a byte with it sign bit set so we need one more
                        // byte.
                        buf[i++] = last;
                    }
                    else {
                        // the sign bit is clear, we can use it.
                        buf[i - 1] |= last;
                    }
                    return buf.slice(0, i);
                }
            }
            // If we found the whole thing is zeros, then we have a zero.
            return [];
        };
        const padDataToSize = (buf, len) => {
            let b = buf;
            while (b.length < len) {
                b = [0x00, ...b];
            }
            return b;
        };
        /**
         * This function is translated from bitcoind's IsDERSignature and is used in
         * the script interpreter.  This "DER" format actually includes an extra byte,
         * the nHashType, at the end. It is really the tx format, not DER format.
         *
         * A canonical signature exists of: [30] [total len] [02] [len R] [R] [02] [len S] [S] [hashtype]
         * Where R and S are not negative (their first byte has its highest bit not set), and not
         * excessively padded (do not start with a 0 byte, unless an otherwise negative number follows,
         * in which case a single 0 byte is necessary and even required).
         *
         * See https://bitcointalk.org/index.php?topic=8392.msg127623#msg127623
         */
        const isChecksigFormat = (buf) => {
            if (buf.length < 9) {
                //  Non-canonical signature: too short
                return false;
            }
            if (buf.length > 73) {
                // Non-canonical signature: too long
                return false;
            }
            if (buf[0] !== 0x30) {
                //  Non-canonical signature: wrong type
                return false;
            }
            if (buf[1] !== buf.length - 3) {
                //  Non-canonical signature: wrong length marker
                return false;
            }
            const nLEnR = buf[3];
            if (5 + nLEnR >= buf.length) {
                //  Non-canonical signature: S length misplaced
                return false;
            }
            const nLEnS = buf[5 + nLEnR];
            if (nLEnR + nLEnS + 7 !== buf.length) {
                //  Non-canonical signature: R+S length mismatch
                return false;
            }
            const R = buf.slice(4);
            if (buf[4 - 2] !== 0x02) {
                //  Non-canonical signature: R value type mismatch
                return false;
            }
            if (nLEnR === 0) {
                //  Non-canonical signature: R length is zero
                return false;
            }
            if ((R[0] & 0x80) !== 0) {
                //  Non-canonical signature: R value negative
                return false;
            }
            if (nLEnR > 1 && R[0] === 0x00 && (R[1] & 0x80) === 0) {
                //  Non-canonical signature: R value excessively padded
                return false;
            }
            const S = buf.slice(6 + nLEnR);
            if (buf[6 + nLEnR - 2] !== 0x02) {
                //  Non-canonical signature: S value type mismatch
                return false;
            }
            if (nLEnS === 0) {
                //  Non-canonical signature: S length is zero
                return false;
            }
            if ((S[0] & 0x80) !== 0) {
                //  Non-canonical signature: S value negative
                return false;
            }
            if (nLEnS > 1 && S[0] === 0x00 && (S[1] & 0x80) === 0) {
                //  Non-canonical signature: S value excessively padded
                return false;
            }
            return true;
        };
        const checkSignatureEncoding = (buf) => {
            // Empty signature. Not strictly DER encoded, but allowed to provide a
            // compact way to provide an invalid signature for use with CHECK(MULTI)SIG
            if (buf.length === 0) {
                return true;
            }
            if (!isChecksigFormat(buf)) {
                this.scriptEvaluationError('The signature format is invalid.');
            }
            const sig = TransactionSignature_js_1.default.fromChecksigFormat(buf);
            if (requireLowSSignatures && !sig.hasLowS()) {
                this.scriptEvaluationError('The signature must have a low S value.');
            }
            if ((sig.scope & TransactionSignature_js_1.default.SIGHASH_FORKID) === 0) {
                this.scriptEvaluationError('The signature must use SIGHASH_FORKID.');
                return false;
            }
            return true;
        };
        const checkPublicKeyEncoding = (buf) => {
            if (buf.length < 33) {
                this.scriptEvaluationError('The public key is too short, it must be at least 33 bytes.');
            }
            if (buf[0] === 0x04) {
                if (buf.length !== 65) {
                    this.scriptEvaluationError('The non-compressed public key must be 65 bytes.');
                }
            }
            else if ((buf[0] === 0x02 || buf[0] === 0x03)) {
                if (buf.length !== 33) {
                    this.scriptEvaluationError('The compressed public key must be 33 bytes.');
                }
            }
            else {
                this.scriptEvaluationError('The public key is in an unknown format.');
            }
            return true;
        };
        const verifySignature = (sig, pubkey, subscript) => {
            const preimage = TransactionSignature_js_1.default.format({
                sourceTXID: this.sourceTXID,
                sourceOutputIndex: this.sourceOutputIndex,
                sourceSatoshis: this.sourceSatoshis,
                transactionVersion: this.transactionVersion,
                otherInputs: this.otherInputs,
                outputs: this.outputs,
                inputIndex: this.inputIndex,
                subscript,
                inputSequence: this.inputSequence,
                lockTime: this.lockTime,
                scope: sig.scope
            });
            const hash = new BigNumber_js_1.default(Hash.hash256(preimage));
            return (0, ECDSA_js_1.verify)(hash, sig, pubkey);
        };
        const isScriptExecuting = !this.ifStack.includes(false);
        let buf, buf1, buf2, buf3, spliced, n, size, rawnum, num, signbit, x1, x2, x3, bn, bn1, bn2, bn3, bufSig, bufPubkey, subscript, bufHash;
        let sig, pubkey, i, fOk, nKeysCount, ikey, ikey2, nSigsCount, isig;
        let fValue, fEqual, fSuccess;
        // Read instruction
        const currentOpcode = operation.op;
        if (typeof currentOpcode === 'undefined') {
            this.scriptEvaluationError(`An opcode is missing in this chunk of the ${this.context}!`);
        }
        if (Array.isArray(operation.data) &&
            operation.data.length > maxScriptElementSize) {
            this.scriptEvaluationError(`It's not currently possible to push data larger than ${maxScriptElementSize} bytes.`);
        }
        if (isScriptExecuting && isOpcodeDisabled(currentOpcode)) {
            this.scriptEvaluationError('This opcode is currently disabled.');
        }
        if (isScriptExecuting && currentOpcode >= 0 &&
            currentOpcode <= OP_js_1.default.OP_PUSHDATA4) {
            if (requireMinimalPush && !isChunkMinimal(operation)) {
                this.scriptEvaluationError('This data is not minimally-encoded.');
            }
            if (!Array.isArray(operation.data)) {
                this.stack.push([]);
            }
            else {
                this.stack.push(operation.data);
            }
        }
        else if (isScriptExecuting || (OP_js_1.default.OP_IF <= currentOpcode && currentOpcode <= OP_js_1.default.OP_ENDIF)) {
            switch (currentOpcode) {
                case OP_js_1.default.OP_1NEGATE:
                case OP_js_1.default.OP_1:
                case OP_js_1.default.OP_2:
                case OP_js_1.default.OP_3:
                case OP_js_1.default.OP_4:
                case OP_js_1.default.OP_5:
                case OP_js_1.default.OP_6:
                case OP_js_1.default.OP_7:
                case OP_js_1.default.OP_8:
                case OP_js_1.default.OP_9:
                case OP_js_1.default.OP_10:
                case OP_js_1.default.OP_11:
                case OP_js_1.default.OP_12:
                case OP_js_1.default.OP_13:
                case OP_js_1.default.OP_14:
                case OP_js_1.default.OP_15:
                case OP_js_1.default.OP_16:
                    n = currentOpcode - (OP_js_1.default.OP_1 - 1);
                    buf = new BigNumber_js_1.default(n).toScriptNum();
                    this.stack.push(buf);
                    break;
                case OP_js_1.default.OP_NOP:
                case OP_js_1.default.OP_NOP2:
                case OP_js_1.default.OP_NOP3:
                case OP_js_1.default.OP_NOP1:
                case OP_js_1.default.OP_NOP4:
                case OP_js_1.default.OP_NOP5:
                case OP_js_1.default.OP_NOP6:
                case OP_js_1.default.OP_NOP7:
                case OP_js_1.default.OP_NOP8:
                case OP_js_1.default.OP_NOP9:
                case OP_js_1.default.OP_NOP10:
                case OP_js_1.default.OP_NOP11:
                case OP_js_1.default.OP_NOP12:
                case OP_js_1.default.OP_NOP13:
                case OP_js_1.default.OP_NOP14:
                case OP_js_1.default.OP_NOP15:
                case OP_js_1.default.OP_NOP16:
                case OP_js_1.default.OP_NOP17:
                case OP_js_1.default.OP_NOP18:
                case OP_js_1.default.OP_NOP19:
                case OP_js_1.default.OP_NOP20:
                case OP_js_1.default.OP_NOP21:
                case OP_js_1.default.OP_NOP22:
                case OP_js_1.default.OP_NOP23:
                case OP_js_1.default.OP_NOP24:
                case OP_js_1.default.OP_NOP25:
                case OP_js_1.default.OP_NOP26:
                case OP_js_1.default.OP_NOP27:
                case OP_js_1.default.OP_NOP28:
                case OP_js_1.default.OP_NOP29:
                case OP_js_1.default.OP_NOP30:
                case OP_js_1.default.OP_NOP31:
                case OP_js_1.default.OP_NOP32:
                case OP_js_1.default.OP_NOP33:
                case OP_js_1.default.OP_NOP34:
                case OP_js_1.default.OP_NOP35:
                case OP_js_1.default.OP_NOP36:
                case OP_js_1.default.OP_NOP37:
                case OP_js_1.default.OP_NOP38:
                case OP_js_1.default.OP_NOP39:
                case OP_js_1.default.OP_NOP40:
                case OP_js_1.default.OP_NOP41:
                case OP_js_1.default.OP_NOP42:
                case OP_js_1.default.OP_NOP43:
                case OP_js_1.default.OP_NOP44:
                case OP_js_1.default.OP_NOP45:
                case OP_js_1.default.OP_NOP46:
                case OP_js_1.default.OP_NOP47:
                case OP_js_1.default.OP_NOP48:
                case OP_js_1.default.OP_NOP49:
                case OP_js_1.default.OP_NOP50:
                case OP_js_1.default.OP_NOP51:
                case OP_js_1.default.OP_NOP52:
                case OP_js_1.default.OP_NOP53:
                case OP_js_1.default.OP_NOP54:
                case OP_js_1.default.OP_NOP55:
                case OP_js_1.default.OP_NOP56:
                case OP_js_1.default.OP_NOP57:
                case OP_js_1.default.OP_NOP58:
                case OP_js_1.default.OP_NOP59:
                case OP_js_1.default.OP_NOP60:
                case OP_js_1.default.OP_NOP61:
                case OP_js_1.default.OP_NOP62:
                case OP_js_1.default.OP_NOP63:
                case OP_js_1.default.OP_NOP64:
                case OP_js_1.default.OP_NOP65:
                case OP_js_1.default.OP_NOP66:
                case OP_js_1.default.OP_NOP67:
                case OP_js_1.default.OP_NOP68:
                case OP_js_1.default.OP_NOP69:
                case OP_js_1.default.OP_NOP70:
                case OP_js_1.default.OP_NOP71:
                case OP_js_1.default.OP_NOP72:
                case OP_js_1.default.OP_NOP73:
                case OP_js_1.default.OP_NOP77:
                    break;
                case OP_js_1.default.OP_IF:
                case OP_js_1.default.OP_NOTIF:
                    fValue = false;
                    if (isScriptExecuting) {
                        if (this.stack.length < 1) {
                            this.scriptEvaluationError('OP_IF and OP_NOTIF require at least one item on the stack when they are used!');
                        }
                        buf = this.stacktop(-1);
                        fValue = this.castToBool(buf);
                        if (currentOpcode === OP_js_1.default.OP_NOTIF) {
                            fValue = !fValue;
                        }
                        this.stack.pop();
                    }
                    this.ifStack.push(fValue);
                    break;
                case OP_js_1.default.OP_ELSE:
                    if (this.ifStack.length === 0) {
                        this.scriptEvaluationError('OP_ELSE requires a preceeding OP_IF.');
                    }
                    this.ifStack[this.ifStack.length - 1] = !this.ifStack[this.ifStack.length - 1];
                    break;
                case OP_js_1.default.OP_ENDIF:
                    if (this.ifStack.length === 0) {
                        this.scriptEvaluationError('OP_ENDIF requires a preceeding OP_IF.');
                    }
                    this.ifStack.pop();
                    break;
                case OP_js_1.default.OP_VERIFY:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_VERIFY requires at least one item to be on the stack.');
                    }
                    buf = this.stacktop(-1);
                    fValue = this.castToBool(buf);
                    if (fValue) {
                        this.stack.pop();
                    }
                    else {
                        this.scriptEvaluationError('OP_VERIFY requires the top stack value to be truthy.');
                    }
                    break;
                case OP_js_1.default.OP_RETURN:
                    if (this.context === 'UnlockingScript') {
                        this.programCounter = this.unlockingScript.chunks.length;
                    }
                    else {
                        this.programCounter = this.lockingScript.chunks.length;
                    }
                    break;
                case OP_js_1.default.OP_TOALTSTACK:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_TOALTSTACK requires at oeast one item to be on the stack.');
                    }
                    this.altStack.push(this.stack.pop());
                    break;
                case OP_js_1.default.OP_FROMALTSTACK:
                    if (this.altStack.length < 1) {
                        this.scriptEvaluationError('OP_FROMALTSTACK requires at least one item to be on the stack.');
                    }
                    this.stack.push(this.altStack.pop());
                    break;
                case OP_js_1.default.OP_2DROP:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_2DROP requires at least two items to be on the stack.');
                    }
                    this.stack.pop();
                    this.stack.pop();
                    break;
                case OP_js_1.default.OP_2DUP:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_2DUP requires at least two items to be on the stack.');
                    }
                    buf1 = this.stacktop(-2);
                    buf2 = this.stacktop(-1);
                    this.stack.push([...buf1]);
                    this.stack.push([...buf2]);
                    break;
                case OP_js_1.default.OP_3DUP:
                    if (this.stack.length < 3) {
                        this.scriptEvaluationError('OP_3DUP requires at least three items to be on the stack.');
                    }
                    buf1 = this.stacktop(-3);
                    buf2 = this.stacktop(-2);
                    buf3 = this.stacktop(-1);
                    this.stack.push([...buf1]);
                    this.stack.push([...buf2]);
                    this.stack.push([...buf3]);
                    break;
                case OP_js_1.default.OP_2OVER:
                    if (this.stack.length < 4) {
                        this.scriptEvaluationError('OP_2OVER requires at least four items to be on the stack.');
                    }
                    buf1 = this.stacktop(-4);
                    buf2 = this.stacktop(-3);
                    this.stack.push([...buf1]);
                    this.stack.push([...buf2]);
                    break;
                case OP_js_1.default.OP_2ROT:
                    if (this.stack.length < 6) {
                        this.scriptEvaluationError('OP_2ROT requires at least six items to be on the stack.');
                    }
                    spliced = this.stack.splice(this.stack.length - 6, 2);
                    this.stack.push(spliced[0]);
                    this.stack.push(spliced[1]);
                    break;
                case OP_js_1.default.OP_2SWAP:
                    if (this.stack.length < 4) {
                        this.scriptEvaluationError('OP_2SWAP requires at least four items to be on the stack.');
                    }
                    spliced = this.stack.splice(this.stack.length - 4, 2);
                    this.stack.push(spliced[0]);
                    this.stack.push(spliced[1]);
                    break;
                case OP_js_1.default.OP_IFDUP:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_IFDUP requires at least one item to be on the stack.');
                    }
                    buf = this.stacktop(-1);
                    fValue = this.castToBool(buf);
                    if (fValue) {
                        this.stack.push([...buf]);
                    }
                    break;
                case OP_js_1.default.OP_DEPTH:
                    buf = new BigNumber_js_1.default(this.stack.length).toScriptNum();
                    this.stack.push(buf);
                    break;
                case OP_js_1.default.OP_DROP:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_DROP requires at least one item to be on the stack.');
                    }
                    this.stack.pop();
                    break;
                case OP_js_1.default.OP_DUP:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_DUP requires at least one item to be on the stack.');
                    }
                    this.stack.push([...this.stacktop(-1)]);
                    break;
                case OP_js_1.default.OP_NIP:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_NIP requires at least two items to be on the stack.');
                    }
                    this.stack.splice(this.stack.length - 2, 1);
                    break;
                case OP_js_1.default.OP_OVER:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_OVER requires at least two items to be on the stack.');
                    }
                    this.stack.push([...this.stacktop(-2)]);
                    break;
                case OP_js_1.default.OP_PICK:
                case OP_js_1.default.OP_ROLL:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least two items to be on the stack.`);
                    }
                    buf = this.stacktop(-1);
                    bn = BigNumber_js_1.default.fromScriptNum(buf, requireMinimalPush);
                    n = bn.toNumber();
                    this.stack.pop();
                    if (n < 0 || n >= this.stack.length) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the top stack element to be 0 or a positive number less than the current size of the stack.`);
                    }
                    buf = this.stacktop(-n - 1);
                    if (currentOpcode === OP_js_1.default.OP_ROLL) {
                        this.stack.splice(this.stack.length - n - 1, 1);
                    }
                    this.stack.push([...buf]);
                    break;
                case OP_js_1.default.OP_ROT:
                    if (this.stack.length < 3) {
                        this.scriptEvaluationError('OP_ROT requires at least three items to be on the stack.');
                    }
                    x1 = this.stacktop(-3);
                    x2 = this.stacktop(-2);
                    x3 = this.stacktop(-1);
                    this.stack[this.stack.length - 3] = x2;
                    this.stack[this.stack.length - 2] = x3;
                    this.stack[this.stack.length - 1] = x1;
                    break;
                case OP_js_1.default.OP_SWAP:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_SWAP requires at least two items to be on the stack.');
                    }
                    x1 = this.stacktop(-2);
                    x2 = this.stacktop(-1);
                    this.stack[this.stack.length - 2] = x2;
                    this.stack[this.stack.length - 1] = x1;
                    break;
                case OP_js_1.default.OP_TUCK:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_TUCK requires at least two items to be on the stack.');
                    }
                    this.stack.splice(this.stack.length - 2, 0, [...this.stacktop(-1)]);
                    break;
                case OP_js_1.default.OP_SIZE:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_SIZE requires at least one item to be on the stack.');
                    }
                    bn = new BigNumber_js_1.default(this.stacktop(-1).length);
                    this.stack.push(bn.toScriptNum());
                    break;
                case OP_js_1.default.OP_AND:
                case OP_js_1.default.OP_OR:
                case OP_js_1.default.OP_XOR:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least one item to be on the stack.`);
                    }
                    buf1 = this.stacktop(-2);
                    buf2 = this.stacktop(-1);
                    if (buf1.length !== buf2.length) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the top two stack items to be the same size.`);
                    }
                    switch (currentOpcode) {
                        case OP_js_1.default.OP_AND:
                            for (let i = 0; i < buf1.length; i++) {
                                buf1[i] &= buf2[i];
                            }
                            break;
                        case OP_js_1.default.OP_OR:
                            for (let i = 0; i < buf1.length; i++) {
                                buf1[i] |= buf2[i];
                            }
                            break;
                        case OP_js_1.default.OP_XOR:
                            for (let i = 0; i < buf1.length; i++) {
                                buf1[i] ^= buf2[i];
                            }
                            break;
                    }
                    // And pop vch2.
                    this.stack.pop();
                    break;
                case OP_js_1.default.OP_INVERT:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_INVERT requires at least one item to be on the stack.');
                    }
                    buf = this.stacktop(-1);
                    for (let i = 0; i < buf.length; i++) {
                        buf[i] = ~buf[i];
                    }
                    break;
                case OP_js_1.default.OP_LSHIFT:
                case OP_js_1.default.OP_RSHIFT:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least two items to be on the stack.`);
                    }
                    buf1 = this.stacktop(-2);
                    if (buf1.length === 0) {
                        this.stack.pop();
                    }
                    else {
                        bn1 = new BigNumber_js_1.default(buf1);
                        bn2 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-1), requireMinimalPush);
                        n = bn2.toNumber();
                        if (n < 0) {
                            this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the top item on the stack not to be negative.`);
                        }
                        this.stack.pop();
                        this.stack.pop();
                        let shifted;
                        if (currentOpcode === OP_js_1.default.OP_LSHIFT) {
                            shifted = bn1.ushln(n);
                        }
                        if (currentOpcode === OP_js_1.default.OP_RSHIFT) {
                            shifted = bn1.ushrn(n);
                        }
                        const bufShifted = padDataToSize([...shifted.toArray().slice(buf1.length * -1)], buf1.length);
                        this.stack.push(bufShifted);
                    }
                    break;
                case OP_js_1.default.OP_EQUAL:
                case OP_js_1.default.OP_EQUALVERIFY:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least two items to be on the stack.`);
                    }
                    buf1 = this.stacktop(-2);
                    buf2 = this.stacktop(-1);
                    fEqual = (0, utils_js_1.toHex)(buf1) === (0, utils_js_1.toHex)(buf2);
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(fEqual ? [1] : []);
                    if (currentOpcode === OP_js_1.default.OP_EQUALVERIFY) {
                        if (fEqual) {
                            this.stack.pop();
                        }
                        else {
                            this.scriptEvaluationError('OP_EQUALVERIFY requires the top two stack items to be equal.');
                        }
                    }
                    break;
                case OP_js_1.default.OP_1ADD:
                case OP_js_1.default.OP_1SUB:
                case OP_js_1.default.OP_NEGATE:
                case OP_js_1.default.OP_ABS:
                case OP_js_1.default.OP_NOT:
                case OP_js_1.default.OP_0NOTEQUAL:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least one items to be on the stack.`);
                    }
                    buf = this.stacktop(-1);
                    bn = BigNumber_js_1.default.fromScriptNum(buf, requireMinimalPush);
                    switch (currentOpcode) {
                        case OP_js_1.default.OP_1ADD:
                            bn = bn.addn(1);
                            break;
                        case OP_js_1.default.OP_1SUB:
                            bn = bn.subn(1);
                            break;
                        case OP_js_1.default.OP_NEGATE:
                            bn = bn.neg();
                            break;
                        case OP_js_1.default.OP_ABS:
                            if (bn.cmpn(0) < 0) {
                                bn = bn.neg();
                            }
                            break;
                        case OP_js_1.default.OP_NOT:
                            bn = new BigNumber_js_1.default((bn.cmpn(0) === 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_0NOTEQUAL:
                            bn = new BigNumber_js_1.default((bn.cmpn(0) !== 0) ? 1 : 0 + 0);
                            break;
                    }
                    this.stack.pop();
                    this.stack.push(bn.toScriptNum());
                    break;
                case OP_js_1.default.OP_ADD:
                case OP_js_1.default.OP_SUB:
                case OP_js_1.default.OP_MUL:
                case OP_js_1.default.OP_MOD:
                case OP_js_1.default.OP_DIV:
                case OP_js_1.default.OP_BOOLAND:
                case OP_js_1.default.OP_BOOLOR:
                case OP_js_1.default.OP_NUMEQUAL:
                case OP_js_1.default.OP_NUMEQUALVERIFY:
                case OP_js_1.default.OP_NUMNOTEQUAL:
                case OP_js_1.default.OP_LESSTHAN:
                case OP_js_1.default.OP_GREATERTHAN:
                case OP_js_1.default.OP_LESSTHANOREQUAL:
                case OP_js_1.default.OP_GREATERTHANOREQUAL:
                case OP_js_1.default.OP_MIN:
                case OP_js_1.default.OP_MAX:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least two items to be on the stack.`);
                    }
                    bn1 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-2), requireMinimalPush);
                    bn2 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-1), requireMinimalPush);
                    bn = new BigNumber_js_1.default(0);
                    switch (currentOpcode) {
                        case OP_js_1.default.OP_ADD:
                            bn = bn1.add(bn2);
                            break;
                        case OP_js_1.default.OP_SUB:
                            bn = bn1.sub(bn2);
                            break;
                        case OP_js_1.default.OP_MUL:
                            bn = bn1.mul(bn2);
                            break;
                        case OP_js_1.default.OP_DIV:
                            if (bn2.cmpn(0) === 0) {
                                this.scriptEvaluationError('OP_DIV cannot divide by zero!');
                            }
                            bn = bn1.div(bn2);
                            break;
                        case OP_js_1.default.OP_MOD:
                            if (bn2.cmpn(0) === 0) {
                                this.scriptEvaluationError('OP_MOD cannot divide by zero!');
                            }
                            bn = bn1.mod(bn2);
                            break;
                        case OP_js_1.default.OP_BOOLAND:
                            bn = new BigNumber_js_1.default(((bn1.cmpn(0) !== 0) && (bn2.cmpn(0) !== 0)) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_BOOLOR:
                            bn = new BigNumber_js_1.default(((bn1.cmpn(0) !== 0) || (bn2.cmpn(0) !== 0)) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_NUMEQUAL:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) === 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_NUMEQUALVERIFY:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) === 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_NUMNOTEQUAL:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) !== 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_LESSTHAN:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) < 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_GREATERTHAN:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) > 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_LESSTHANOREQUAL:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) <= 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_GREATERTHANOREQUAL:
                            bn = new BigNumber_js_1.default((bn1.cmp(bn2) >= 0) ? 1 : 0 + 0);
                            break;
                        case OP_js_1.default.OP_MIN:
                            bn = (bn1.cmp(bn2) < 0 ? bn1 : bn2);
                            break;
                        case OP_js_1.default.OP_MAX:
                            bn = (bn1.cmp(bn2) > 0 ? bn1 : bn2);
                            break;
                    }
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(bn.toScriptNum());
                    if (currentOpcode === OP_js_1.default.OP_NUMEQUALVERIFY) {
                        if (this.castToBool(this.stacktop(-1))) {
                            this.stack.pop();
                        }
                        else {
                            this.scriptEvaluationError('OP_NUMEQUALVERIFY requires the top stack item to be truthy.');
                        }
                    }
                    break;
                case OP_js_1.default.OP_WITHIN:
                    if (this.stack.length < 3) {
                        this.scriptEvaluationError('OP_WITHIN requires at least three items to be on the stack.');
                    }
                    bn1 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-3), requireMinimalPush);
                    bn2 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-2), requireMinimalPush);
                    bn3 = BigNumber_js_1.default.fromScriptNum(this.stacktop(-1), requireMinimalPush);
                    fValue = (bn2.cmp(bn1) <= 0) && (bn1.cmp(bn3) < 0);
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(fValue ? [1] : []);
                    break;
                case OP_js_1.default.OP_RIPEMD160:
                case OP_js_1.default.OP_SHA1:
                case OP_js_1.default.OP_SHA256:
                case OP_js_1.default.OP_HASH160:
                case OP_js_1.default.OP_HASH256:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least one item to be on the stack.`);
                    }
                    buf = this.stacktop(-1);
                    if (currentOpcode === OP_js_1.default.OP_RIPEMD160) {
                        bufHash = Hash.ripemd160(buf);
                    }
                    else if (currentOpcode === OP_js_1.default.OP_SHA1) {
                        bufHash = Hash.sha1(buf);
                    }
                    else if (currentOpcode === OP_js_1.default.OP_SHA256) {
                        bufHash = Hash.sha256(buf);
                    }
                    else if (currentOpcode === OP_js_1.default.OP_HASH160) {
                        bufHash = Hash.hash160(buf);
                    }
                    else if (currentOpcode === OP_js_1.default.OP_HASH256) {
                        bufHash = Hash.hash256(buf);
                    }
                    this.stack.pop();
                    this.stack.push(bufHash);
                    break;
                case OP_js_1.default.OP_CODESEPARATOR:
                    this.lastCodeSeparator = this.programCounter;
                    break;
                case OP_js_1.default.OP_CHECKSIG:
                case OP_js_1.default.OP_CHECKSIGVERIFY:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least two items to be on the stack.`);
                    }
                    bufSig = this.stacktop(-2);
                    bufPubkey = this.stacktop(-1);
                    if (!checkSignatureEncoding(bufSig) ||
                        !checkPublicKeyEncoding(bufPubkey)) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires correct encoding for the public key and signature.`);
                    }
                    // Subset of script starting at the most recent codeseparator
                    // CScript scriptCode(pbegincodehash, pend);
                    if (this.context === 'UnlockingScript') {
                        subscript = new Script_js_1.default(this.unlockingScript.chunks.slice(this.lastCodeSeparator));
                    }
                    else {
                        subscript = new Script_js_1.default(this.lockingScript.chunks.slice(this.lastCodeSeparator));
                    }
                    // Drop the signature, since there's no way for a signature to sign itself
                    subscript.findAndDelete(new Script_js_1.default().writeBin(bufSig));
                    try {
                        sig = TransactionSignature_js_1.default.fromChecksigFormat(bufSig);
                        pubkey = PublicKey_js_1.default.fromString((0, utils_js_1.toHex)(bufPubkey));
                        fSuccess = verifySignature(sig, pubkey, subscript);
                    }
                    catch (e) {
                        // invalid sig or pubkey
                        fSuccess = false;
                    }
                    if (!fSuccess && bufSig.length > 0) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} failed to verify the signature, and requires an empty signature when verification fails.`);
                    }
                    this.stack.pop();
                    this.stack.pop();
                    // stack.push_back(fSuccess ? vchTrue : vchFalse);
                    this.stack.push(fSuccess ? [1] : []);
                    if (currentOpcode === OP_js_1.default.OP_CHECKSIGVERIFY) {
                        if (fSuccess) {
                            this.stack.pop();
                        }
                        else {
                            this.scriptEvaluationError('OP_CHECKSIGVERIFY requires that a valid signature is provided.');
                        }
                    }
                    break;
                case OP_js_1.default.OP_CHECKMULTISIG:
                case OP_js_1.default.OP_CHECKMULTISIGVERIFY:
                    i = 1;
                    if (this.stack.length < i) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires at least 1 item to be on the stack.`);
                    }
                    nKeysCount = BigNumber_js_1.default.fromScriptNum(this.stacktop(-i), requireMinimalPush).toNumber();
                    // TODO: Keys and opcount are parameterized in client. No magic numbers!
                    if (nKeysCount < 0 || nKeysCount > maxMultisigKeyCount) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires a key count between 0 and ${maxMultisigKeyCount}.`);
                    }
                    ikey = ++i;
                    i += nKeysCount;
                    // ikey2 is the position of last non-signature item in
                    // the stack. Top stack item = 1. With
                    // SCRIPT_VERIFY_NULLFAIL, this is used for cleanup if
                    // operation fails.
                    ikey2 = nKeysCount + 2;
                    if (this.stack.length < i) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the number of stack items not to be less than the number of keys used.`);
                    }
                    nSigsCount = BigNumber_js_1.default.fromScriptNum(this.stacktop(-i), requireMinimalPush).toNumber();
                    if (nSigsCount < 0 || nSigsCount > nKeysCount) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the number of signatures to be no greater than the number of keys.`);
                    }
                    isig = ++i;
                    i += nSigsCount;
                    if (this.stack.length < i) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the number of stack items not to be less than the number of signatures provided.`);
                    }
                    // Subset of script starting at the most recent codeseparator
                    if (this.context === 'UnlockingScript') {
                        subscript = new Script_js_1.default(this.unlockingScript.chunks.slice(this.lastCodeSeparator));
                    }
                    else {
                        subscript = new Script_js_1.default(this.lockingScript.chunks.slice(this.lastCodeSeparator));
                    }
                    // Drop the signatures, since there's no way for a signature to sign itself
                    for (let k = 0; k < nSigsCount; k++) {
                        bufSig = this.stacktop(-isig - k);
                        subscript.findAndDelete(new Script_js_1.default().writeBin(bufSig));
                    }
                    fSuccess = true;
                    while (fSuccess && nSigsCount > 0) {
                        // valtype& vchSig  = this.stacktop(-isig);
                        bufSig = this.stacktop(-isig);
                        // valtype& vchPubKey = this.stacktop(-ikey);
                        bufPubkey = this.stacktop(-ikey);
                        if (!checkSignatureEncoding(bufSig) ||
                            !checkPublicKeyEncoding(bufPubkey)) {
                            this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires correct encoding for the public key and signature.`);
                        }
                        try {
                            sig = TransactionSignature_js_1.default.fromChecksigFormat(bufSig);
                            pubkey = PublicKey_js_1.default.fromString((0, utils_js_1.toHex)(bufPubkey));
                            fOk = verifySignature(sig, pubkey, subscript);
                        }
                        catch (e) {
                            // invalid sig or pubkey
                            fOk = false;
                        }
                        if (fOk) {
                            isig++;
                            nSigsCount--;
                        }
                        ikey++;
                        nKeysCount--;
                        // If there are more signatures left than keys left,
                        // then too many signatures have failed
                        if (nSigsCount > nKeysCount) {
                            fSuccess = false;
                        }
                    }
                    // Clean up stack of actual arguments
                    while (i-- > 1) {
                        if (!fSuccess && !ikey2 && (this.stacktop(-1).length > 0)) {
                            this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} failed to verify a signature, and requires an empty signature when verification fails.`);
                        }
                        if (ikey2 > 0) {
                            ikey2--;
                        }
                        this.stack.pop();
                    }
                    // A bug causes CHECKMULTISIG to consume one extra argument
                    // whose contents were not checked in any way.
                    //
                    // Unfortunately this is a potential source of mutability,
                    // so optionally verify it is exactly equal to zero prior
                    // to removing it from the stack.
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires an extra item to be on the stack.`);
                    }
                    if (this.stacktop(-1).length > 0) { // NOTE: Is this necessary? We don't care about malleability.
                        this.scriptEvaluationError(`${OP_js_1.default[currentOpcode]} requires the extra stack item to be empty.`);
                    }
                    this.stack.pop();
                    this.stack.push(fSuccess ? [1] : []);
                    if (currentOpcode === OP_js_1.default.OP_CHECKMULTISIGVERIFY) {
                        if (fSuccess) {
                            this.stack.pop();
                        }
                        else {
                            this.scriptEvaluationError('OP_CHECKMULTISIGVERIFY requires that a sufficient number of valid signatures are provided.');
                        }
                    }
                    break;
                case OP_js_1.default.OP_CAT:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_CAT requires at least two items to be on the stack.');
                    }
                    buf1 = this.stacktop(-2);
                    buf2 = this.stacktop(-1);
                    if (buf1.length + buf2.length > maxScriptElementSize) {
                        this.scriptEvaluationError(`It's not currently possible to push data larger than ${maxScriptElementSize} bytes.`);
                    }
                    this.stack[this.stack.length - 2] = [...buf1, ...buf2];
                    this.stack.pop();
                    break;
                case OP_js_1.default.OP_SPLIT:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_SPLIT requires at least two items to be on the stack.');
                    }
                    buf1 = this.stacktop(-2);
                    // Make sure the split point is apropriate.
                    n = BigNumber_js_1.default.fromScriptNum(this.stacktop(-1), requireMinimalPush).toNumber();
                    if (n < 0 || n > buf1.length) {
                        this.scriptEvaluationError('OP_SPLIT requires the first stack item to be a non-negative number less than or equal to the size of the second-from-top stack item.');
                    }
                    // Prepare the results in their own buffer as `data`
                    // will be invalidated.
                    // Copy buffer data, to slice it before
                    buf2 = [...buf1];
                    // Replace existing stack values by the new values.
                    this.stack[this.stack.length - 2] = buf2.slice(0, n);
                    this.stack[this.stack.length - 1] = buf2.slice(n);
                    break;
                case OP_js_1.default.OP_NUM2BIN:
                    if (this.stack.length < 2) {
                        this.scriptEvaluationError('OP_NUM2BIN requires at least two items to be on the stack.');
                    }
                    size = BigNumber_js_1.default.fromScriptNum(this.stacktop(-1), requireMinimalPush).toNumber();
                    if (size > maxScriptElementSize) {
                        this.scriptEvaluationError(`It's not currently possible to push data larger than ${maxScriptElementSize} bytes.`);
                    }
                    this.stack.pop();
                    rawnum = this.stacktop(-1);
                    // Try to see if we can fit that number in the number of
                    // byte requested.
                    rawnum = minimallyEncode(rawnum);
                    if (rawnum.length > size) {
                        this.scriptEvaluationError('OP_NUM2BIN requires that the size expressed in the top stack item is large enough to hold the value expressed in the second-from-top stack item.');
                    }
                    // We already have an element of the right size, we
                    // don't need to do anything.
                    if (rawnum.length === size) {
                        this.stack[this.stack.length - 1] = rawnum;
                        break;
                    }
                    signbit = 0x00;
                    if (rawnum.length > 0) {
                        signbit = rawnum[rawnum.length - 1] & 0x80;
                        rawnum[rawnum.length - 1] &= 0x7f;
                    }
                    num = new Array(size);
                    num.fill(0);
                    for (n = 0; n < size; n++) {
                        num[n] = rawnum[n];
                    }
                    n = rawnum.length - 1;
                    while (n++ < size - 2) {
                        num[n] = 0x00;
                    }
                    num[n] = signbit;
                    this.stack[this.stack.length - 1] = num;
                    break;
                case OP_js_1.default.OP_BIN2NUM:
                    if (this.stack.length < 1) {
                        this.scriptEvaluationError('OP_BIN2NUM requires at least one item to be on the stack.');
                    }
                    buf1 = this.stacktop(-1);
                    buf2 = minimallyEncode(buf1);
                    this.stack[this.stack.length - 1] = buf2;
                    // The resulting number must be a valid number.
                    if (!isMinimallyEncoded(buf2)) {
                        this.scriptEvaluationError('OP_BIN2NUM requires that the resulting number is valid.');
                    }
                    break;
                default:
                    this.scriptEvaluationError('Invalid opcode!');
            }
        }
        // Finally, increment the program counter
        this.programCounter++;
    }
    /**
     * @method validate
     * Validates the spend action by interpreting the locking and unlocking scripts.
     * @returns {boolean} Returns true if the scripts are valid and the spend is legitimate, otherwise false.
     * @example
     * if (spend.validate()) {
     *   console.log("Spend is valid!");
     * } else {
     *   console.log("Invalid spend!");
     * }
     */
    validate() {
        if (requirePushOnlyUnlockingScripts && !this.unlockingScript.isPushOnly()) {
            this.scriptEvaluationError('Unlocking scripts can only contain push operations, and no other opcodes.');
        }
        while (true) {
            this.step();
            if (this.context === 'LockingScript' && this.programCounter >= this.lockingScript.chunks.length) {
                break;
            }
        }
        if (this.ifStack.length > 0) {
            this.scriptEvaluationError('Every OP_IF must be terminated prior to the end of the script.');
        }
        if (requireCleanStack) {
            if (this.stack.length !== 1) {
                this.scriptEvaluationError('The clean stack rule requires exactly one item to be on the stack after script execution.');
            }
        }
        if (!this.castToBool(this.stacktop(-1))) {
            this.scriptEvaluationError('The top stack element must be truthy after script evaluation.');
        }
        return true;
    }
    stacktop(i) {
        return this.stack[this.stack.length + i];
    }
    castToBool(val) {
        for (let i = 0; i < val.length; i++) {
            if (val[i] !== 0) {
                // can be negative zero
                if (i === val.length - 1 && val[i] === 0x80) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
    scriptEvaluationError(str) {
        throw new Error(`Script evaluation error: ${str}\n\nSource TXID: ${this.sourceTXID}\nSource output index: ${this.sourceOutputIndex}\nContext: ${this.context}\nProgram counter: ${this.programCounter}\nStack size: ${this.stack.length}\nAlt stack size: ${this.altStack.length}`);
    }
}
exports.default = Spend;
//# sourceMappingURL=Spend.js.map