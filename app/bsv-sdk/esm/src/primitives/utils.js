import BigNumber from './BigNumber.js';
/**
 * Appends a '0' to a single-character word to ensure it has two characters.
 * @param {string} word - The input word.
 * @returns {string} - The word with a leading '0' if it's a single character; otherwise, the original word.
 */
export const zero2 = (word) => {
    if (word.length === 1) {
        return '0' + word;
    }
    else {
        return word;
    }
};
/**
 * Converts an array of numbers to a hexadecimal string representation.
 * @param {number[]} msg - The input array of numbers.
 * @returns {string} - The hexadecimal string representation of the input array.
 */
export const toHex = (msg) => {
    let res = '';
    for (let i = 0; i < msg.length; i++) {
        res += zero2(msg[i].toString(16));
    }
    return res;
};
/**
 * Converts various message formats into an array of numbers.
 * Supports arrays, hexadecimal strings, base64 strings, and UTF-8 strings.
 *
 * @param {any} msg - The input message (array or string).
 * @param {('hex' | 'utf8')} enc - Specifies the string encoding, if applicable.
 * @returns {any[]} - Array representation of the input.
 */
export const toArray = (msg, enc) => {
    // Return a copy if already an array
    if (Array.isArray(msg)) {
        return msg.slice();
    }
    // Return empty array for falsy values
    if (!msg) {
        return [];
    }
    const res = [];
    // Convert non-string messages to numbers
    if (typeof msg !== 'string') {
        for (let i = 0; i < msg.length; i++) {
            res[i] = msg[i] | 0;
        }
        return res;
    }
    // Handle hexadecimal encoding
    if (enc === 'hex') {
        msg = msg.replace(/[^a-z0-9]+/ig, '');
        if (msg.length % 2 !== 0) {
            msg = '0' + msg;
        }
        for (let i = 0; i < msg.length; i += 2) {
            res.push(parseInt(msg[i] + msg[i + 1], 16));
        }
        // Handle base64
    }
    else if (enc === 'base64') {
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const result = [];
        let currentBit = 0;
        let currentByte = 0;
        for (const char of msg.replace(/=+$/, '')) {
            currentBit = (currentBit << 6) | base64Chars.indexOf(char);
            currentByte += 6;
            if (currentByte >= 8) {
                currentByte -= 8;
                result.push((currentBit >> currentByte) & 0xFF);
                currentBit &= (1 << currentByte) - 1;
            }
        }
        return result;
    }
    else {
        // Handle UTF-8 encoding
        for (let i = 0; i < msg.length; i++) {
            const c = msg.charCodeAt(i);
            const hi = c >> 8;
            const lo = c & 0xff;
            if (hi) {
                res.push(hi, lo);
            }
            else {
                res.push(lo);
            }
        }
    }
    return res;
};
/**
 * Converts an array of numbers to a UTF-8 encoded string.
 * @param {number[]} arr - The input array of numbers.
 * @returns {string} - The UTF-8 encoded string.
 */
const toUTF8 = (arr) => {
    let result = '';
    for (let i = 0; i < arr.length; i++) {
        const byte = arr[i];
        // 1-byte sequence (0xxxxxxx)
        if (byte <= 0x7F) {
            result += String.fromCharCode(byte);
        }
        // 2-byte sequence (110xxxxx 10xxxxxx)
        else if (byte >= 0xC0 && byte <= 0xDF) {
            const byte2 = arr[++i];
            const codePoint = ((byte & 0x1F) << 6) | (byte2 & 0x3F);
            result += String.fromCharCode(codePoint);
        }
        // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
        else if (byte >= 0xE0 && byte <= 0xEF) {
            const byte2 = arr[++i];
            const byte3 = arr[++i];
            const codePoint = ((byte & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F);
            result += String.fromCharCode(codePoint);
        }
        // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
        else if (byte >= 0xF0 && byte <= 0xF7) {
            const byte2 = arr[++i];
            const byte3 = arr[++i];
            const byte4 = arr[++i];
            const codePoint = ((byte & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            // Convert to UTF-16 surrogate pair
            const surrogate1 = 0xD800 + ((codePoint - 0x10000) >> 10);
            const surrogate2 = 0xDC00 + ((codePoint - 0x10000) & 0x3FF);
            result += String.fromCharCode(surrogate1, surrogate2);
        }
    }
    return result;
};
/**
 * Encodes an array of numbers into a specified encoding ('hex' or 'utf8'). If no encoding is provided, returns the original array.
 * @param {number[]} arr - The input array of numbers.
 * @param {('hex' | 'utf8')} enc - The desired encoding.
 * @returns {string | number[]} - The encoded message as a string (for 'hex' and 'utf8') or the original array.
 */
export const encode = (arr, enc) => {
    switch (enc) {
        case 'hex':
            return toHex(arr);
        case 'utf8':
            return toUTF8(arr);
        // If no encoding is provided, return the original array
        default:
            return arr;
    }
};
/**
 * Converts an array of bytes (each between 0 and 255) into a base64 encoded string.
 *
 * @param {number[]} byteArray - An array of numbers where each number is a byte (0-255).
 * @returns {string} The base64 encoded string.
 *
 * @example
 * const bytes = [72, 101, 108, 108, 111]; // Represents the string "Hello"
 * console.log(toBase64(bytes)); // Outputs: SGVsbG8=
 */
export function toBase64(byteArray) {
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i;
    for (i = 0; i < byteArray.length; i += 3) {
        const byte1 = byteArray[i];
        const byte2 = i + 1 < byteArray.length ? byteArray[i + 1] : 0;
        const byte3 = i + 2 < byteArray.length ? byteArray[i + 2] : 0;
        const encoded1 = byte1 >> 2;
        const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
        const encoded3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
        const encoded4 = byte3 & 0x3F;
        result += base64Chars.charAt(encoded1) + base64Chars.charAt(encoded2);
        result += i + 1 < byteArray.length ? base64Chars.charAt(encoded3) : '=';
        result += i + 2 < byteArray.length ? base64Chars.charAt(encoded4) : '=';
    }
    return result;
}
export class Writer {
    bufs;
    constructor(bufs) {
        this.bufs = bufs || [];
    }
    getLength() {
        let len = 0;
        for (const buf of this.bufs) {
            len = len + buf.length;
        }
        return len;
    }
    toArray() {
        const ret = [];
        for (const x of this.bufs) {
            ret.push(...x);
        }
        return ret;
    }
    write(buf) {
        this.bufs.push(buf);
        return this;
    }
    writeReverse(buf) {
        const buf2 = new Array(buf.length);
        for (let i = 0; i < buf2.length; i++) {
            buf2[i] = buf[buf.length - 1 - i];
        }
        this.bufs.push(buf2);
        return this;
    }
    writeUInt8(n) {
        const buf = new Array(1);
        buf[0] = n;
        this.write(buf);
        return this;
    }
    writeInt8(n) {
        const buf = new Array(1);
        buf[0] = n & 0xFF;
        this.write(buf);
        return this;
    }
    writeUInt16BE(n) {
        this.bufs.push([
            (n >> 8) & 0xFF, // shift right 8 bits to get the high byte
            n & 0xFF // low byte is just the last 8 bits
        ]);
        return this;
    }
    writeInt16BE(n) {
        return this.writeUInt16BE(n & 0xFFFF); // Mask with 0xFFFF to get the lower 16 bits
    }
    writeUInt16LE(n) {
        this.bufs.push([
            n & 0xFF, // low byte is just the last 8 bits
            (n >> 8) & 0xFF // shift right 8 bits to get the high byte
        ]);
        return this;
    }
    writeInt16LE(n) {
        return this.writeUInt16LE(n & 0xFFFF); // Mask with 0xFFFF to get the lower 16 bits
    }
    writeUInt32BE(n) {
        this.bufs.push([
            (n >> 24) & 0xFF, // highest byte
            (n >> 16) & 0xFF,
            (n >> 8) & 0xFF,
            n & 0xFF // lowest byte
        ]);
        return this;
    }
    writeInt32BE(n) {
        return this.writeUInt32BE(n >>> 0); // Using unsigned right shift to handle negative numbers
    }
    writeUInt32LE(n) {
        this.bufs.push([
            n & 0xFF, // lowest byte
            (n >> 8) & 0xFF,
            (n >> 16) & 0xFF,
            (n >> 24) & 0xFF // highest byte
        ]);
        return this;
    }
    writeInt32LE(n) {
        return this.writeUInt32LE(n >>> 0); // Using unsigned right shift to handle negative numbers
    }
    writeUInt64BEBn(bn) {
        const buf = bn.toArray('be', 8);
        this.write(buf);
        return this;
    }
    writeUInt64LEBn(bn) {
        const buf = bn.toArray('be', 8);
        this.writeReverse(buf);
        return this;
    }
    writeUInt64LE(n) {
        const buf = new BigNumber(n).toArray('be', 8);
        this.writeReverse(buf);
        return this;
    }
    writeVarIntNum(n) {
        const buf = Writer.varIntNum(n);
        this.write(buf);
        return this;
    }
    writeVarIntBn(bn) {
        const buf = Writer.varIntBn(bn);
        this.write(buf);
        return this;
    }
    static varIntNum(n) {
        let buf;
        if (n < 253) {
            buf = [n]; // 1 byte
        }
        else if (n < 0x10000) {
            // 253 followed by the number in little-endian format
            buf = [
                253, // 0xfd
                n & 0xFF, // low byte
                (n >> 8) & 0xFF // high byte
            ];
        }
        else if (n < 0x100000000) {
            // 254 followed by the number in little-endian format
            buf = [
                254, // 0xfe
                n & 0xFF,
                (n >> 8) & 0xFF,
                (n >> 16) & 0xFF,
                (n >> 24) & 0xFF
            ];
        }
        else {
            // 255 followed by the number in little-endian format
            // Since JavaScript bitwise operations work on 32 bits, we need to handle 64-bit numbers in two parts
            const low = n & 0xFFFFFFFF;
            const high = Math.floor(n / 0x100000000) & 0xFFFFFFFF;
            buf = [
                255, // 0xff
                low & 0xFF,
                (low >> 8) & 0xFF,
                (low >> 16) & 0xFF,
                (low >> 24) & 0xFF,
                high & 0xFF,
                (high >> 8) & 0xFF,
                (high >> 16) & 0xFF,
                (high >> 24) & 0xFF
            ];
        }
        return buf;
    }
    static varIntBn(bn) {
        let buf;
        if (bn.ltn(253)) {
            const n = bn.toNumber();
            // No need for bitwise operation as the value is within a byte's range
            buf = [n];
        }
        else if (bn.ltn(0x10000)) {
            const n = bn.toNumber();
            // Value fits in a uint16
            buf = [253, n & 0xFF, (n >> 8) & 0xFF];
        }
        else if (bn.lt(new BigNumber(0x100000000))) {
            const n = bn.toNumber();
            // Value fits in a uint32
            buf = [254, n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF];
        }
        else {
            const bw = new Writer();
            bw.writeUInt8(255);
            bw.writeUInt64LEBn(bn);
            buf = bw.toArray();
        }
        return buf;
    }
}
export class Reader {
    bin;
    pos;
    constructor(bin = [], pos = 0) {
        this.bin = bin;
        this.pos = pos;
    }
    eof() {
        return this.pos >= this.bin.length;
    }
    read(len = this.bin.length) {
        const bin = this.bin.slice(this.pos, this.pos + len);
        this.pos = this.pos + len;
        return bin;
    }
    readReverse(len = this.bin.length) {
        const bin = this.bin.slice(this.pos, this.pos + len);
        this.pos = this.pos + len;
        const buf2 = new Array(bin.length);
        for (let i = 0; i < buf2.length; i++) {
            buf2[i] = bin[bin.length - 1 - i];
        }
        return buf2;
    }
    readUInt8() {
        const val = this.bin[this.pos];
        this.pos += 1;
        return val;
    }
    readInt8() {
        const val = this.bin[this.pos];
        this.pos += 1;
        // If the sign bit is set, convert to negative value
        return (val & 0x80) !== 0 ? val - 0x100 : val;
    }
    readUInt16BE() {
        const val = (this.bin[this.pos] << 8) | this.bin[this.pos + 1];
        this.pos += 2;
        return val;
    }
    readInt16BE() {
        const val = this.readUInt16BE();
        // If the sign bit is set, convert to negative value
        return (val & 0x8000) !== 0 ? val - 0x10000 : val;
    }
    readUInt16LE() {
        const val = this.bin[this.pos] | (this.bin[this.pos + 1] << 8);
        this.pos += 2;
        return val;
    }
    readInt16LE() {
        const val = this.readUInt16LE();
        // If the sign bit is set, convert to negative value
        const x = (val & 0x8000) !== 0 ? val - 0x10000 : val;
        return x;
    }
    readUInt32BE() {
        const val = (this.bin[this.pos] * 0x1000000) + // Shift the first byte by 24 bits
            ((this.bin[this.pos + 1] << 16) | // Shift the second byte by 16 bits
                (this.bin[this.pos + 2] << 8) | // Shift the third byte by 8 bits
                this.bin[this.pos + 3]); // The fourth byte
        this.pos += 4;
        return val;
    }
    readInt32BE() {
        const val = this.readUInt32BE();
        // If the sign bit is set, convert to negative value
        return (val & 0x80000000) !== 0 ? val - 0x100000000 : val;
    }
    readUInt32LE() {
        const val = (this.bin[this.pos] |
            (this.bin[this.pos + 1] << 8) |
            (this.bin[this.pos + 2] << 16) |
            (this.bin[this.pos + 3] << 24)) >>> 0;
        this.pos += 4;
        return val;
    }
    readInt32LE() {
        const val = this.readUInt32LE();
        // Explicitly check if the sign bit is set and then convert to a negative value
        return (val & 0x80000000) !== 0 ? val - 0x100000000 : val;
    }
    readUInt64BEBn() {
        const bin = this.bin.slice(this.pos, this.pos + 8);
        const bn = new BigNumber(bin);
        this.pos = this.pos + 8;
        return bn;
    }
    readUInt64LEBn() {
        const bin = this.readReverse(8);
        const bn = new BigNumber(bin);
        return bn;
    }
    readVarIntNum() {
        const first = this.readUInt8();
        let bn;
        let n;
        switch (first) {
            case 0xfd:
                return this.readUInt16LE();
            case 0xfe:
                return this.readUInt32LE();
            case 0xff:
                bn = this.readUInt64LEBn();
                if (bn.lte(new BigNumber(2).pow(new BigNumber(53)))) {
                    return bn.toNumber();
                }
                else {
                    throw new Error('number too large to retain precision - use readVarIntBn');
                }
            default:
                return first;
        }
    }
    readVarInt() {
        const first = this.bin[this.pos];
        switch (first) {
            case 0xfd:
                return this.read(1 + 2);
            case 0xfe:
                return this.read(1 + 4);
            case 0xff:
                return this.read(1 + 8);
            default:
                return this.read(1);
        }
    }
    readVarIntBn() {
        const first = this.readUInt8();
        switch (first) {
            case 0xfd:
                return new BigNumber(this.readUInt16LE());
            case 0xfe:
                return new BigNumber(this.readUInt32LE());
            case 0xff:
                return this.readUInt64LEBn();
            default:
                return new BigNumber(first);
        }
    }
}
//# sourceMappingURL=utils.js.map