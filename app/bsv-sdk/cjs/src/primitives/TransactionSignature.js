"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Signature_js_1 = require("./Signature.js");
const BigNumber_js_1 = require("./BigNumber.js");
const Hash = require("./Hash.js");
const utils_js_1 = require("./utils.js");
class TransactionSignature extends Signature_js_1.default {
    static format(params) {
        const currentInput = {
            sourceTXID: params.sourceTXID,
            sourceOutputIndex: params.sourceOutputIndex,
            sequence: params.inputSequence
        };
        const inputs = [...params.otherInputs];
        inputs.splice(params.inputIndex, 0, currentInput);
        const getPrevoutHash = () => {
            const writer = new utils_js_1.Writer();
            for (const input of inputs) {
                if (typeof input.sourceTransaction === 'undefined') {
                    writer.writeReverse((0, utils_js_1.toArray)(input.sourceTXID, 'hex'));
                }
                else {
                    writer.writeReverse(input.sourceTransaction.id());
                }
                writer.writeUInt32LE(input.sourceOutputIndex);
            }
            const buf = writer.toArray();
            const ret = Hash.hash256(buf);
            return ret;
        };
        const getSequenceHash = () => {
            const writer = new utils_js_1.Writer();
            for (const input of inputs) {
                writer.writeUInt32LE(input.sequence);
            }
            const buf = writer.toArray();
            const ret = Hash.hash256(buf);
            return ret;
        };
        function getOutputsHash(outputIndex) {
            const writer = new utils_js_1.Writer();
            if (typeof outputIndex === 'undefined') {
                let script;
                for (const output of params.outputs) {
                    writer.writeUInt64LE(output.satoshis);
                    script = output.lockingScript.toBinary();
                    writer.writeVarIntNum(script.length);
                    writer.write(script);
                }
            }
            else {
                const output = params.outputs[outputIndex];
                writer.writeUInt64LE(output.satoshis);
                const script = output.lockingScript.toBinary();
                writer.writeVarIntNum(script.length);
                writer.write(script);
            }
            const buf = writer.toArray();
            const ret = Hash.hash256(buf);
            return ret;
        }
        let hashPrevouts = new Array(32).fill(0);
        let hashSequence = new Array(32).fill(0);
        let hashOutputs = new Array(32).fill(0);
        if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) === 0) {
            hashPrevouts = getPrevoutHash();
        }
        if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) === 0 &&
            (params.scope & 31) !== TransactionSignature.SIGHASH_SINGLE &&
            (params.scope & 31) !== TransactionSignature.SIGHASH_NONE) {
            hashSequence = getSequenceHash();
        }
        if ((params.scope & 31) !== TransactionSignature.SIGHASH_SINGLE && (params.scope & 31) !== TransactionSignature.SIGHASH_NONE) {
            hashOutputs = getOutputsHash();
        }
        else if ((params.scope & 31) === TransactionSignature.SIGHASH_SINGLE && params.inputIndex < params.outputs.length) {
            hashOutputs = getOutputsHash(params.inputIndex);
        }
        const writer = new utils_js_1.Writer();
        // Version
        writer.writeInt32LE(params.transactionVersion);
        // Input prevouts/nSequence (none/all, depending on flags)
        writer.write(hashPrevouts);
        writer.write(hashSequence);
        //  outpoint (32-byte hash + 4-byte little endian)
        writer.writeReverse((0, utils_js_1.toArray)(params.sourceTXID, 'hex'));
        writer.writeUInt32LE(params.sourceOutputIndex);
        // scriptCode of the input (serialized as scripts inside CTxOuts)
        writer.writeVarIntNum(params.subscript.toBinary().length);
        writer.write(params.subscript.toBinary());
        // value of the output spent by this input (8-byte little endian)
        writer.writeUInt64LE(params.sourceSatoshis);
        // nSequence of the input (4-byte little endian)
        const sequenceNumber = currentInput.sequence;
        writer.writeUInt32LE(sequenceNumber);
        // Outputs (none/one/all, depending on flags)
        writer.write(hashOutputs);
        // Locktime
        writer.writeUInt32LE(params.lockTime);
        // sighashType
        writer.writeUInt32LE(params.scope >>> 0);
        const buf = writer.toArray();
        return buf;
    }
    // The format used in a tx
    static fromChecksigFormat(buf) {
        if (buf.length === 0) {
            // allow setting a "blank" signature
            const r = new BigNumber_js_1.default(1);
            const s = new BigNumber_js_1.default(1);
            const scope = 1;
            return new TransactionSignature(r, s, scope);
        }
        const scope = buf[buf.length - 1];
        const derbuf = buf.slice(0, buf.length - 1);
        const tempSig = Signature_js_1.default.fromDER(derbuf);
        return new TransactionSignature(tempSig.r, tempSig.s, scope);
    }
    constructor(r, s, scope) {
        super(r, s);
        this.scope = scope;
    }
    /**
       * Compares to bitcoind's IsLowDERSignature
       * See also Ecdsa signature algorithm which enforces this.
       * See also Bip 62, "low S values in signatures"
       */
    hasLowS() {
        if (this.s.ltn(1) ||
            this.s.gt(new BigNumber_js_1.default('7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0', 'hex'))) {
            return false;
        }
        return true;
    }
    toChecksigFormat() {
        const derbuf = this.toDER();
        return [...derbuf, this.scope];
    }
}
TransactionSignature.SIGHASH_ALL = 0x00000001;
TransactionSignature.SIGHASH_NONE = 0x00000002;
TransactionSignature.SIGHASH_SINGLE = 0x00000003;
TransactionSignature.SIGHASH_FORKID = 0x00000040;
TransactionSignature.SIGHASH_ANYONECANPAY = 0x00000080;
exports.default = TransactionSignature;
//# sourceMappingURL=TransactionSignature.js.map