"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OP_js_1 = require("./OP.js");
const utils_js_1 = require("../primitives/utils.js");
const BigNumber_js_1 = require("../primitives/BigNumber.js");
/**
 * The Script class represents a script in a Bitcoin SV transaction,
 * encapsulating the functionality to construct, parse, and serialize
 * scripts used in both locking (output) and unlocking (input) scripts.
 *
 * @property {ScriptChunk[]} chunks - An array of script chunks that make up the script.
 */
class Script {
    /**
     * @method fromASM
     * Static method to construct a Script instance from an ASM (Assembly) formatted string.
     * @param asm - The script in ASM string format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromASM("OP_DUP OP_HASH160 abcd... OP_EQUALVERIFY OP_CHECKSIG")
     */
    static fromASM(asm) {
        const chunks = [];
        const tokens = asm.split(' ');
        let i = 0;
        while (i < tokens.length) {
            const token = tokens[i];
            let opCode;
            let opCodeNum;
            if (typeof OP_js_1.default[token] !== 'undefined') {
                opCode = token;
                opCodeNum = OP_js_1.default[token];
            }
            // we start with two special cases, 0 and -1, which are handled specially in
            // toASM. see _chunkToString.
            if (token === '0') {
                opCodeNum = 0;
                chunks.push({
                    op: opCodeNum
                });
                i = i + 1;
            }
            else if (token === '-1') {
                opCodeNum = OP_js_1.default.OP_1NEGATE;
                chunks.push({
                    op: opCodeNum
                });
                i = i + 1;
            }
            else if (opCode === undefined) {
                let hex = tokens[i];
                if (hex.length % 2 !== 0) {
                    hex = '0' + hex;
                }
                const arr = (0, utils_js_1.toArray)(hex, 'hex');
                if ((0, utils_js_1.encode)(arr, 'hex') !== hex) {
                    throw new Error('invalid hex string in script');
                }
                const len = arr.length;
                if (len >= 0 && len < OP_js_1.default.OP_PUSHDATA1) {
                    opCodeNum = len;
                }
                else if (len < Math.pow(2, 8)) {
                    opCodeNum = OP_js_1.default.OP_PUSHDATA1;
                }
                else if (len < Math.pow(2, 16)) {
                    opCodeNum = OP_js_1.default.OP_PUSHDATA2;
                }
                else if (len < Math.pow(2, 32)) {
                    opCodeNum = OP_js_1.default.OP_PUSHDATA4;
                }
                chunks.push({
                    data: arr,
                    op: opCodeNum
                });
                i = i + 1;
            }
            else if (opCodeNum === OP_js_1.default.OP_PUSHDATA1 ||
                opCodeNum === OP_js_1.default.OP_PUSHDATA2 ||
                opCodeNum === OP_js_1.default.OP_PUSHDATA4) {
                chunks.push({
                    data: (0, utils_js_1.toArray)(tokens[i + 2], 'hex'),
                    op: opCodeNum
                });
                i = i + 3;
            }
            else {
                chunks.push({
                    op: opCodeNum
                });
                i = i + 1;
            }
        }
        return new Script(chunks);
    }
    /**
     * @method fromHex
     * Static method to construct a Script instance from a hexadecimal string.
     * @param hex - The script in hexadecimal format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromHex("76a9...");
     */
    static fromHex(hex) {
        return Script.fromBinary((0, utils_js_1.toArray)(hex, 'hex'));
    }
    /**
     * @method fromBinary
     * Static method to construct a Script instance from a binary array.
     * @param bin - The script in binary array format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromBinary([0x76, 0xa9, ...])
     */
    static fromBinary(bin) {
        bin = [...bin];
        const chunks = [];
        const br = new utils_js_1.Reader(bin);
        while (!br.eof()) {
            const op = br.readUInt8();
            let len = 0;
            // eslint-disable-next-line @typescript-eslint/no-shadow
            let data = [];
            if (op > 0 && op < OP_js_1.default.OP_PUSHDATA1) {
                len = op;
                chunks.push({
                    data: br.read(len),
                    op
                });
            }
            else if (op === OP_js_1.default.OP_PUSHDATA1) {
                try {
                    len = br.readUInt8();
                    data = br.read(len);
                }
                catch (err) {
                    br.read();
                }
                chunks.push({
                    data,
                    op
                });
            }
            else if (op === OP_js_1.default.OP_PUSHDATA2) {
                try {
                    len = br.readUInt16LE();
                    data = br.read(len);
                }
                catch (err) {
                    br.read();
                }
                chunks.push({
                    data,
                    op
                });
            }
            else if (op === OP_js_1.default.OP_PUSHDATA4) {
                try {
                    len = br.readUInt32LE();
                    data = br.read(len);
                }
                catch (err) {
                    br.read();
                }
                chunks.push({
                    data,
                    op
                });
            }
            else {
                chunks.push({
                    op
                });
            }
        }
        return new Script(chunks);
    }
    /**
     * @constructor
     * Constructs a new Script object.
     * @param chunks=[] - An array of script chunks to directly initialize the script.
     */
    constructor(chunks = []) {
        this.chunks = chunks;
    }
    /**
     * @method toASM
     * Serializes the script to an ASM formatted string.
     * @returns The script in ASM string format.
     */
    toASM() {
        let str = '';
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            str += this._chunkToString(chunk);
        }
        return str.slice(1);
    }
    /**
     * @method toHex
     * Serializes the script to a hexadecimal string.
     * @returns The script in hexadecimal format.
     */
    toHex() {
        return (0, utils_js_1.encode)(this.toBinary(), 'hex');
    }
    /**
     * @method toBinary
     * Serializes the script to a binary array.
     * @returns The script in binary array format.
     */
    toBinary() {
        const writer = new utils_js_1.Writer();
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            const op = chunk.op;
            writer.writeUInt8(op);
            if (chunk.data) {
                if (op < OP_js_1.default.OP_PUSHDATA1) {
                    writer.write(chunk.data);
                }
                else if (op === OP_js_1.default.OP_PUSHDATA1) {
                    writer.writeUInt8(chunk.data.length);
                    writer.write(chunk.data);
                }
                else if (op === OP_js_1.default.OP_PUSHDATA2) {
                    writer.writeUInt16LE(chunk.data.length);
                    writer.write(chunk.data);
                }
                else if (op === OP_js_1.default.OP_PUSHDATA4) {
                    writer.writeUInt32LE(chunk.data.length);
                    writer.write(chunk.data);
                }
            }
        }
        return writer.toArray();
    }
    /**
     * @method writeScript
     * Appends another script to this script.
     * @param script - The script to append.
     * @returns This script instance for chaining.
     */
    writeScript(script) {
        this.chunks = this.chunks.concat(script.chunks);
        return this;
    }
    /**
     * @method writeOpCode
     * Appends an opcode to the script.
     * @param op - The opcode to append.
     * @returns This script instance for chaining.
     */
    writeOpCode(op) {
        this.chunks.push({ op });
        return this;
    }
    /**
     * @method setChunkOpCode
     * Sets the opcode of a specific chunk in the script.
     * @param i - The index of the chunk.
     * @param op - The opcode to set.
     * @returns This script instance for chaining.
     */
    setChunkOpCode(i, op) {
        this.chunks[i] = { op };
        return this;
    }
    /**
     * @method writeBn
    * Appends a BigNumber to the script as an opcode.
    * @param bn - The BigNumber to append.
    * @returns This script instance for chaining.
     */
    writeBn(bn) {
        if (bn.cmpn(0) === OP_js_1.default.OP_0) {
            this.chunks.push({
                op: OP_js_1.default.OP_0
            });
        }
        else if (bn.cmpn(-1) === 0) {
            this.chunks.push({
                op: OP_js_1.default.OP_1NEGATE
            });
        }
        else if (bn.cmpn(1) >= 0 && bn.cmpn(16) <= 0) {
            // see OP_1 - OP_16
            this.chunks.push({
                op: bn.toNumber() + OP_js_1.default.OP_1 - 1
            });
        }
        else {
            const buf = bn.toSm('little');
            this.writeBin(buf);
        }
        return this;
    }
    /**
     * @method writeBin
     * Appends binary data to the script, determining the appropriate opcode based on length.
     * @param bin - The binary data to append.
     * @returns This script instance for chaining.
     * @throws {Error} Throws an error if the data is too large to be pushed.
     */
    writeBin(bin) {
        let op;
        if (bin.length > 0 && bin.length < OP_js_1.default.OP_PUSHDATA1) {
            op = bin.length;
        }
        else if (bin.length === 0) {
            op = OP_js_1.default.OP_0;
        }
        else if (bin.length < Math.pow(2, 8)) {
            op = OP_js_1.default.OP_PUSHDATA1;
        }
        else if (bin.length < Math.pow(2, 16)) {
            op = OP_js_1.default.OP_PUSHDATA2;
        }
        else if (bin.length < Math.pow(2, 32)) {
            op = OP_js_1.default.OP_PUSHDATA4;
        }
        else {
            throw new Error("You can't push that much data");
        }
        this.chunks.push({
            data: bin,
            op
        });
        return this;
    }
    /**
     * @method writeNumber
     * Appends a number to the script.
     * @param num - The number to append.
     * @returns This script instance for chaining.
     */
    writeNumber(num) {
        this.writeBn(new BigNumber_js_1.default(num));
        return this;
    }
    /**
     * @method removeCodeseparators
     * Removes all OP_CODESEPARATOR opcodes from the script.
     * @returns This script instance for chaining.
     */
    removeCodeseparators() {
        const chunks = [];
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].op !== OP_js_1.default.OP_CODESEPARATOR) {
                chunks.push(this.chunks[i]);
            }
        }
        this.chunks = chunks;
        return this;
    }
    /**
     * Deletes the given item wherever it appears in the current script.
     *
     * @param script - The script containing the item to delete from the current script.
     *
     * @returns This script instance for chaining.
     */
    findAndDelete(script) {
        const buf = script.toHex();
        for (let i = 0; i < this.chunks.length; i++) {
            const script2 = new Script([this.chunks[i]]);
            const buf2 = script2.toHex();
            if (buf === buf2) {
                this.chunks.splice(i, 1);
            }
        }
        return this;
    }
    /**
     * @method isPushOnly
     * Checks if the script contains only push data operations.
     * @returns True if the script is push-only, otherwise false.
     */
    isPushOnly() {
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            const opCodeNum = chunk.op;
            if (opCodeNum > OP_js_1.default.OP_16) {
                return false;
            }
        }
        return true;
    }
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns True if the script is a locking script, otherwise false.
     */
    isLockingScript() {
        throw new Error('Not implemented');
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns True if the script is an unlocking script, otherwise false.
     */
    isUnlockingScript() {
        throw new Error('Not implemented');
    }
    /**
     * @private
     * @method _chunkToString
     * Converts a script chunk to its string representation.
     * @param chunk - The script chunk.
     * @returns The string representation of the chunk.
     */
    _chunkToString(chunk) {
        const op = chunk.op;
        let str = '';
        if (typeof chunk.data === 'undefined') {
            const val = OP_js_1.default[op];
            str = `${str} ${val}`;
        }
        else {
            str = `${str} ${(0, utils_js_1.toHex)(chunk.data)}`;
        }
        return str;
    }
}
exports.default = Script;
//# sourceMappingURL=Script.js.map