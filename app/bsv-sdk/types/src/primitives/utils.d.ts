import BigNumber from './BigNumber.js';
/**
 * Appends a '0' to a single-character word to ensure it has two characters.
 * @param {string} word - The input word.
 * @returns {string} - The word with a leading '0' if it's a single character; otherwise, the original word.
 */
export declare const zero2: (word: string) => string;
/**
 * Converts an array of numbers to a hexadecimal string representation.
 * @param {number[]} msg - The input array of numbers.
 * @returns {string} - The hexadecimal string representation of the input array.
 */
export declare const toHex: (msg: number[]) => string;
/**
 * Converts various message formats into an array of numbers.
 * Supports arrays, hexadecimal strings, base64 strings, and UTF-8 strings.
 *
 * @param {any} msg - The input message (array or string).
 * @param {('hex' | 'utf8')} enc - Specifies the string encoding, if applicable.
 * @returns {any[]} - Array representation of the input.
 */
export declare const toArray: (msg: any, enc?: 'hex' | 'utf8' | 'base64') => any[];
/**
 * Encodes an array of numbers into a specified encoding ('hex' or 'utf8'). If no encoding is provided, returns the original array.
 * @param {number[]} arr - The input array of numbers.
 * @param {('hex' | 'utf8')} enc - The desired encoding.
 * @returns {string | number[]} - The encoded message as a string (for 'hex' and 'utf8') or the original array.
 */
export declare const encode: (arr: number[], enc?: 'hex' | 'utf8') => string | number[];
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
export declare function toBase64(byteArray: number[]): string;
export declare class Writer {
    bufs: number[][];
    constructor(bufs?: number[][]);
    getLength(): number;
    toArray(): number[];
    write(buf: number[]): Writer;
    writeReverse(buf: number[]): Writer;
    writeUInt8(n: number): Writer;
    writeInt8(n: number): Writer;
    writeUInt16BE(n: number): Writer;
    writeInt16BE(n: number): Writer;
    writeUInt16LE(n: number): Writer;
    writeInt16LE(n: number): Writer;
    writeUInt32BE(n: number): Writer;
    writeInt32BE(n: number): Writer;
    writeUInt32LE(n: number): Writer;
    writeInt32LE(n: number): Writer;
    writeUInt64BEBn(bn: BigNumber): Writer;
    writeUInt64LEBn(bn: BigNumber): Writer;
    writeUInt64LE(n: number): Writer;
    writeVarIntNum(n: number): Writer;
    writeVarIntBn(bn: BigNumber): Writer;
    static varIntNum(n: number): number[];
    static varIntBn(bn: BigNumber): number[];
}
export declare class Reader {
    bin: number[];
    pos: number;
    constructor(bin?: number[], pos?: number);
    eof(): boolean;
    read(len?: number): number[];
    readReverse(len?: number): number[];
    readUInt8(): number;
    readInt8(): number;
    readUInt16BE(): number;
    readInt16BE(): number;
    readUInt16LE(): number;
    readInt16LE(): number;
    readUInt32BE(): number;
    readInt32BE(): number;
    readUInt32LE(): number;
    readInt32LE(): number;
    readUInt64BEBn(): BigNumber;
    readUInt64LEBn(): BigNumber;
    readVarIntNum(): number;
    readVarInt(): number[];
    readVarIntBn(): BigNumber;
}
//# sourceMappingURL=utils.d.ts.map