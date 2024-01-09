const assert = (expression, message = 'Hash assertion failed') => {
    if (!expression) {
        throw new Error(message);
    }
};
/**
 * The BaseHash class is an abstract base class for cryptographic hash functions.
 * It provides a common structure and functionality for hash function classes.
 *
 * @class BaseHash
 *
 * @property pending - Stores partially processed message segments.
 * @property pendingTotal - The total number of characters that are being stored in `pending`
 * @property blockSize - The size of each block to processed.
 * @property outSize - The size of the final hash output.
 * @property endian - The endianness used during processing, can either be 'big' or 'little'.
 * @property _delta8 - The block size divided by 8, useful in various computations.
 * @property _delta32 - The block size divided by 32, useful in various computations.
 * @property padLength - The length of padding to be added to finalize the computation.
 * @property hmacStrength - The HMAC strength value.
 *
 * @param blockSize - The size of the block to be hashed.
 * @param outSize - The size of the resulting hash.
 * @param hmacStrength - The strength of the HMAC.
 * @param padLength - The length of the padding to be added.
 *
 * @example
 * Sub-classes would extend this base BaseHash class like:
 * class RIPEMD160 extends BaseHash {
 *   constructor () {
 *     super(512, 160, 192, 64);
 *     // ...
 *   }
 *   // ...
 * }
 */
class BaseHash {
    pending;
    pendingTotal;
    blockSize;
    outSize;
    endian;
    _delta8;
    _delta32;
    padLength;
    hmacStrength;
    constructor(blockSize, outSize, hmacStrength, padLength) {
        this.pending = null;
        this.pendingTotal = 0;
        this.blockSize = blockSize;
        this.outSize = outSize;
        this.hmacStrength = hmacStrength;
        this.padLength = padLength / 8;
        this.endian = 'big';
        this._delta8 = this.blockSize / 8;
        this._delta32 = this.blockSize / 32;
    }
    _update(msg, start) {
        throw new Error('Not implemented');
    }
    _digest(enc) {
        throw new Error('Not implemented');
    }
    /**
     * Converts the input message into an array, pads it, and joins into 32bit blocks.
     * If there is enough data, it tries updating the hash computation.
     *
     * @method update
     * @param msg - The message segment to include in the hashing computation.
     * @param enc - The encoding of the message. If 'hex', the string will be treated as such, 'utf8' otherwise.
     *
     * @returns Returns the instance of the object for chaining.
     *
     * @example
     * sha256.update('Hello World', 'utf8');
     */
    update(msg, enc) {
        // Convert message to array, pad it, and join into 32bit blocks
        msg = toArray(msg, enc);
        if (this.pending == null) {
            this.pending = msg;
        }
        else {
            this.pending = this.pending.concat(msg);
        }
        this.pendingTotal += msg.length;
        // Enough data, try updating
        if (this.pending.length >= this._delta8) {
            msg = this.pending;
            // Process pending data in blocks
            const r = msg.length % this._delta8;
            this.pending = msg.slice(msg.length - r, msg.length);
            if (this.pending.length === 0) {
                this.pending = null;
            }
            msg = join32(msg, 0, msg.length - r, this.endian);
            for (let i = 0; i < msg.length; i += this._delta32) {
                this._update(msg, i);
            }
        }
        return this;
    }
    /**
     * Finalizes the hash computation and returns the hash value/result.
     *
     * @method digest
     * @param enc - The encoding of the final hash. If 'hex' then a hex string will be provided, otherwise an array of numbers.
     *
     * @returns Returns the final hash value.
     *
     * @example
     * const hash = sha256.digest('hex');
     */
    digest(enc) {
        this.update(this._pad());
        assert(this.pending === null);
        return this._digest(enc);
    }
    ;
    /**
     * [Private Method] Used internally to prepare the padding for the final stage of the hash computation.
     *
     * @method _pad
     * @private
     *
     * @returns Returns an array denoting the padding.
     */
    _pad() {
        let len = this.pendingTotal;
        const bytes = this._delta8;
        const k = bytes - ((len + this.padLength) % bytes);
        const res = new Array(k + this.padLength);
        res[0] = 0x80;
        let i;
        for (i = 1; i < k; i++) {
            res[i] = 0;
        }
        // Append length
        len <<= 3;
        let t;
        if (this.endian === 'big') {
            for (t = 8; t < this.padLength; t++) {
                res[i++] = 0;
            }
            res[i++] = 0;
            res[i++] = 0;
            res[i++] = 0;
            res[i++] = 0;
            res[i++] = (len >>> 24) & 0xff;
            res[i++] = (len >>> 16) & 0xff;
            res[i++] = (len >>> 8) & 0xff;
            res[i++] = len & 0xff;
        }
        else {
            res[i++] = len & 0xff;
            res[i++] = (len >>> 8) & 0xff;
            res[i++] = (len >>> 16) & 0xff;
            res[i++] = (len >>> 24) & 0xff;
            res[i++] = 0;
            res[i++] = 0;
            res[i++] = 0;
            res[i++] = 0;
            for (t = 8; t < this.padLength; t++) {
                res[i++] = 0;
            }
        }
        return res;
    }
}
function isSurrogatePair(msg, i) {
    if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
        return false;
    }
    if (i < 0 || i + 1 >= msg.length) {
        return false;
    }
    return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
}
export function toArray(msg, enc) {
    if (Array.isArray(msg)) {
        return msg.slice();
    }
    if (!msg) {
        return [];
    }
    const res = [];
    if (typeof msg === 'string') {
        if (enc !== 'hex') {
            // Inspired by stringToUtf8ByteArray() in closure-library by Google
            // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
            // Apache License 2.0
            // https://github.com/google/closure-library/blob/master/LICENSE
            let p = 0;
            for (let i = 0; i < msg.length; i++) {
                let c = msg.charCodeAt(i);
                if (c < 128) {
                    res[p++] = c;
                }
                else if (c < 2048) {
                    res[p++] = (c >> 6) | 192;
                    res[p++] = (c & 63) | 128;
                }
                else if (isSurrogatePair(msg, i)) {
                    c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
                    res[p++] = (c >> 18) | 240;
                    res[p++] = ((c >> 12) & 63) | 128;
                    res[p++] = ((c >> 6) & 63) | 128;
                    res[p++] = (c & 63) | 128;
                }
                else {
                    res[p++] = (c >> 12) | 224;
                    res[p++] = ((c >> 6) & 63) | 128;
                    res[p++] = (c & 63) | 128;
                }
            }
        }
        else {
            msg = msg.replace(/[^a-z0-9]+/ig, '');
            if (msg.length % 2 !== 0) {
                msg = '0' + msg;
            }
            for (let i = 0; i < msg.length; i += 2) {
                res.push(parseInt(msg[i] + msg[i + 1], 16));
            }
        }
    }
    else {
        msg = msg;
        for (let i = 0; i < msg.length; i++) {
            res[i] = msg[i] | 0;
        }
    }
    return res;
}
function htonl(w) {
    const res = (w >>> 24) |
        ((w >>> 8) & 0xff00) |
        ((w << 8) & 0xff0000) |
        ((w & 0xff) << 24);
    return res >>> 0;
}
function toHex32(msg, endian) {
    let res = '';
    for (let i = 0; i < msg.length; i++) {
        let w = msg[i];
        if (endian === 'little') {
            w = htonl(w);
        }
        res += zero8(w.toString(16));
    }
    return res;
}
function zero8(word) {
    if (word.length === 7) {
        return '0' + word;
    }
    else if (word.length === 6) {
        return '00' + word;
    }
    else if (word.length === 5) {
        return '000' + word;
    }
    else if (word.length === 4) {
        return '0000' + word;
    }
    else if (word.length === 3) {
        return '00000' + word;
    }
    else if (word.length === 2) {
        return '000000' + word;
    }
    else if (word.length === 1) {
        return '0000000' + word;
    }
    else {
        return word;
    }
}
function join32(msg, start, end, endian) {
    const len = end - start;
    assert(len % 4 === 0);
    const res = new Array(len / 4);
    for (let i = 0, k = start; i < res.length; i++, k += 4) {
        let w;
        if (endian === 'big') {
            w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
        }
        else {
            w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
        }
        res[i] = w >>> 0;
    }
    return res;
}
function split32(msg, endian) {
    const res = new Array(msg.length * 4);
    for (let i = 0, k = 0; i < msg.length; i++, k += 4) {
        const m = msg[i];
        if (endian === 'big') {
            res[k] = m >>> 24;
            res[k + 1] = (m >>> 16) & 0xff;
            res[k + 2] = (m >>> 8) & 0xff;
            res[k + 3] = m & 0xff;
        }
        else {
            res[k + 3] = m >>> 24;
            res[k + 2] = (m >>> 16) & 0xff;
            res[k + 1] = (m >>> 8) & 0xff;
            res[k] = m & 0xff;
        }
    }
    return res;
}
function rotr32(w, b) {
    return (w >>> b) | (w << (32 - b));
}
function rotl32(w, b) {
    return (w << b) | (w >>> (32 - b));
}
function sum32(a, b) {
    return (a + b) >>> 0;
}
function SUM32_3(a, b, c) {
    return (a + b + c) >>> 0;
}
function SUM32_4(a, b, c, d) {
    return (a + b + c + d) >>> 0;
}
function SUM32_5(a, b, c, d, e) {
    return (a + b + c + d + e) >>> 0;
}
function FT_1(s, x, y, z) {
    if (s === 0) {
        return ch32(x, y, z);
    }
    if (s === 1 || s === 3) {
        return p32(x, y, z);
    }
    if (s === 2) {
        return maj32(x, y, z);
    }
}
function ch32(x, y, z) {
    return (x & y) ^ ((~x) & z);
}
function maj32(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}
function p32(x, y, z) {
    return x ^ y ^ z;
}
function S0_256(x) {
    return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
}
function S1_256(x) {
    return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
}
function G0_256(x) {
    return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
}
function G1_256(x) {
    return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
}
const r = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
];
const rh = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];
const s = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];
const sh = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];
function f(j, x, y, z) {
    if (j <= 15) {
        return x ^ y ^ z;
    }
    else if (j <= 31) {
        return (x & y) | ((~x) & z);
    }
    else if (j <= 47) {
        return (x | (~y)) ^ z;
    }
    else if (j <= 63) {
        return (x & z) | (y & (~z));
    }
    else {
        return x ^ (y | (~z));
    }
}
function K(j) {
    if (j <= 15) {
        return 0x00000000;
    }
    else if (j <= 31) {
        return 0x5a827999;
    }
    else if (j <= 47) {
        return 0x6ed9eba1;
    }
    else if (j <= 63) {
        return 0x8f1bbcdc;
    }
    else {
        return 0xa953fd4e;
    }
}
function Kh(j) {
    if (j <= 15) {
        return 0x50a28be6;
    }
    else if (j <= 31) {
        return 0x5c4dd124;
    }
    else if (j <= 47) {
        return 0x6d703ef3;
    }
    else if (j <= 63) {
        return 0x7a6d76e9;
    }
    else {
        return 0x00000000;
    }
}
/**
 * An implementation of RIPEMD160 cryptographic hash function. Extends the BaseHash class.
 * It provides a way to compute a 'digest' for any kind of input data; transforming the data
 * into a unique output of fixed size. The output is deterministic; it will always be
 * the same for the same input.
 *
 * @class RIPEMD160
 * @param None
 *
 * @constructor
 * Use the RIPEMD160 constructor to create an instance of RIPEMD160 hash function.
 *
 * @example
 * const ripemd160 = new RIPEMD160();
 *
 * @property h - Array that is updated iteratively as part of hashing computation.
 */
export class RIPEMD160 extends BaseHash {
    h;
    constructor() {
        super(512, 160, 192, 64);
        this.endian = 'little';
        this.h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
        this.endian = 'little';
    }
    _update(msg, start) {
        let A = this.h[0];
        let B = this.h[1];
        let C = this.h[2];
        let D = this.h[3];
        let E = this.h[4];
        let Ah = A;
        let Bh = B;
        let Ch = C;
        let Dh = D;
        let Eh = E;
        let T;
        for (let j = 0; j < 80; j++) {
            T = sum32(rotl32(SUM32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E);
            A = E;
            E = D;
            D = rotl32(C, 10);
            C = B;
            B = T;
            T = sum32(rotl32(SUM32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh);
            Ah = Eh;
            Eh = Dh;
            Dh = rotl32(Ch, 10);
            Ch = Bh;
            Bh = T;
        }
        T = SUM32_3(this.h[1], C, Dh);
        this.h[1] = SUM32_3(this.h[2], D, Eh);
        this.h[2] = SUM32_3(this.h[3], E, Ah);
        this.h[3] = SUM32_3(this.h[4], A, Bh);
        this.h[4] = SUM32_3(this.h[0], B, Ch);
        this.h[0] = T;
    }
    _digest(enc) {
        if (enc === 'hex') {
            return toHex32(this.h, 'little');
        }
        else {
            return split32(this.h, 'little');
        }
    }
}
/**
 * An implementation of SHA256 cryptographic hash function. Extends the BaseHash class.
 * It provides a way to compute a 'digest' for any kind of input data; transforming the data
 * into a unique output of fixed size. The output is deterministic; it will always be
 * the same for the same input.
 *
 * @class SHA256
 * @param None
 *
 * @constructor
 * Use the SHA256 constructor to create an instance of SHA256 hash function.
 *
 * @example
 * const sha256 = new SHA256();
 *
 * @property h - The initial hash constants
 * @property W - Provides a way to recycle usage of the array memory.
 * @property k - The round constants used for each round of SHA-256
 */
export class SHA256 extends BaseHash {
    h;
    W;
    k;
    constructor() {
        super(512, 256, 192, 64);
        this.h = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
        this.k = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
            0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
            0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
            0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
            0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
            0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
            0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
            0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
            0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        this.W = new Array(64);
    }
    _update(msg, start) {
        const W = this.W;
        let i;
        for (i = 0; i < 16; i++) {
            W[i] = msg[start + i];
        }
        for (; i < W.length; i++) {
            W[i] = SUM32_4(G1_256(W[i - 2]), W[i - 7], G0_256(W[i - 15]), W[i - 16]);
        }
        let a = this.h[0];
        let b = this.h[1];
        let c = this.h[2];
        let d = this.h[3];
        let e = this.h[4];
        let f = this.h[5];
        let g = this.h[6];
        let h = this.h[7];
        assert(this.k.length === W.length);
        for (i = 0; i < W.length; i++) {
            const T1 = SUM32_5(h, S1_256(e), ch32(e, f, g), this.k[i], W[i]);
            const T2 = sum32(S0_256(a), maj32(a, b, c));
            h = g;
            g = f;
            f = e;
            e = sum32(d, T1);
            d = c;
            c = b;
            b = a;
            a = sum32(T1, T2);
        }
        this.h[0] = sum32(this.h[0], a);
        this.h[1] = sum32(this.h[1], b);
        this.h[2] = sum32(this.h[2], c);
        this.h[3] = sum32(this.h[3], d);
        this.h[4] = sum32(this.h[4], e);
        this.h[5] = sum32(this.h[5], f);
        this.h[6] = sum32(this.h[6], g);
        this.h[7] = sum32(this.h[7], h);
    }
    ;
    _digest(enc) {
        if (enc === 'hex') {
            return toHex32(this.h, 'big');
        }
        else {
            return split32(this.h, 'big');
        }
    }
}
/**
 * An implementation of SHA1 cryptographic hash function. Extends the BaseHash class.
 * It provides a way to compute a 'digest' for any kind of input data; transforming the data
 * into a unique output of fixed size. The output is deterministic; it will always be
 * the same for the same input.
 *
 * @class SHA1
 * @param None
 *
 * @constructor
 * Use the SHA1 constructor to create an instance of SHA1 hash function.
 *
 * @example
 * const sha1 = new SHA1();
 *
 * @property h - The initial hash constants.
 * @property W - Provides a way to recycle usage of the array memory.
 * @property k - The round constants used for each round of SHA-1.
 */
export class SHA1 extends BaseHash {
    h;
    W;
    k;
    constructor() {
        super(512, 160, 80, 64);
        this.k = [
            0x5A827999, 0x6ED9EBA1,
            0x8F1BBCDC, 0xCA62C1D6
        ];
        this.h = [
            0x67452301, 0xefcdab89, 0x98badcfe,
            0x10325476, 0xc3d2e1f0
        ];
        this.W = new Array(80);
    }
    _update(msg, start) {
        const W = this.W;
        let i;
        for (i = 0; i < 16; i++) {
            W[i] = msg[start + i];
        }
        for (; i < W.length; i++) {
            W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }
        let a = this.h[0];
        let b = this.h[1];
        let c = this.h[2];
        let d = this.h[3];
        let e = this.h[4];
        for (i = 0; i < W.length; i++) {
            const s = ~~(i / 20);
            const t = SUM32_5(rotl32(a, 5), FT_1(s, b, c, d), e, W[i], this.k[s]);
            e = d;
            d = c;
            c = rotl32(b, 30);
            b = a;
            a = t;
        }
        this.h[0] = sum32(this.h[0], a);
        this.h[1] = sum32(this.h[1], b);
        this.h[2] = sum32(this.h[2], c);
        this.h[3] = sum32(this.h[3], d);
        this.h[4] = sum32(this.h[4], e);
    }
    _digest(enc) {
        if (enc === 'hex') {
            return toHex32(this.h, 'big');
        }
        else {
            return split32(this.h, 'big');
        }
    }
}
/**
 * The `SHA256HMAC` class is used to create Hash-based Message Authentication Code (HMAC) using the SHA-256 cryptographic hash function.
 *
 * HMAC is a specific type of MAC involving a cryptographic hash function and a secret cryptographic key. It may be used to simultaneously verify both the data integrity and the authenticity of a message.
 *
 * This class also uses the SHA-256 cryptographic hash algorithm that produces a 256-bit (32-byte) hash value.
 *
 * @property inner - Represents the inner hash of SHA-256.
 * @property outer - Represents the outer hash of SHA-256.
 * @property blockSize - The block size for the SHA-256 hash function, in bytes. It's set to 64 bytes.
 * @property outSize - The output size of the SHA-256 hash function, in bytes. It's set to 32 bytes.
 */
export class SHA256HMAC {
    inner;
    outer;
    blockSize = 64;
    outSize = 32;
    /**
     * The constructor for the `SHA256HMAC` class.
     *
     * It initializes the `SHA256HMAC` object and sets up the inner and outer padded keys.
     * If the key size is larger than the blockSize, it is digested using SHA-256.
     * If the key size is less than the blockSize, it is padded with zeroes.
     *
     * @constructor
     * @param key - The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.
     *
     * @example
     * const myHMAC = new SHA256HMAC('deadbeef');
     */
    constructor(key) {
        key = toArray(key, 'hex');
        // Shorten key, if needed
        if (key.length > this.blockSize) {
            key = new SHA256().update(key).digest();
        }
        assert(key.length <= this.blockSize);
        // Add padding to key
        let i;
        for (i = key.length; i < this.blockSize; i++) {
            key.push(0);
        }
        for (i = 0; i < key.length; i++) {
            key[i] ^= 0x36;
        }
        this.inner = new SHA256().update(key);
        // 0x36 ^ 0x5c = 0x6a
        for (i = 0; i < key.length; i++) {
            key[i] ^= 0x6a;
        }
        this.outer = new SHA256().update(key);
    }
    /**
     * Updates the `SHA256HMAC` object with part of the message to be hashed.
     *
     * @method update
     * @param msg - Part of the message to hash. Can be a number array or a string.
     * @param enc - If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
     * @returns Returns the instance of `SHA256HMAC` for chaining calls.
     *
     * @example
     * myHMAC.update('deadbeef', 'hex');
     */
    update(msg, enc) {
        this.inner.update(msg, enc);
        return this;
    }
    /**
     * Finalizes the HMAC computation and returns the resultant hash.
     *
     * @method digest
     * @param enc - If 'hex', then the output is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
     * @returns Returns the digest of the hashed data. Can be a number array or a string.
     *
     * @example
     * let hashedMessage = myHMAC.digest('hex');
     */
    digest(enc) {
        this.outer.update(this.inner.digest());
        return this.outer.digest(enc);
    }
}
/**
 * Computes RIPEMD160 hash of a given message.
 * @function ripemd160
 * @param msg - The message to compute the hash for.
 * @param enc - The encoding of the message. If 'hex', the message is decoded from hexadecimal first.
 *
 * @returns the computed RIPEMD160 hash of the message.
 *
 * @example
 * const digest = ripemd160('Hello, world!');
 */
export const ripemd160 = (msg, enc) => {
    return new RIPEMD160().update(msg, enc).digest(enc);
};
/**
 * Computes SHA1 hash of a given message.
 * @function sha1
 * @param msg - The message to compute the hash for.
 * @param enc - The encoding of the message. If 'hex', the message is decoded from hexadecimal first.
 *
 * @returns the computed SHA1 hash of the message.
 *
 * @example
 * const digest = sha1('Hello, world!');
 */
export const sha1 = (msg, enc) => {
    return new SHA1().update(msg, enc).digest(enc);
};
/**
 * Computes SHA256 hash of a given message.
 * @function sha256
 * @param msg - The message to compute the hash for.
 * @param enc - The encoding of the message. If 'hex', the message is decoded from hexadecimal first.
 *
 * @returns the computed SHA256 hash of the message.
 *
 * @example
 * const digest = sha256('Hello, world!');
 */
export const sha256 = (msg, enc) => {
    return new SHA256().update(msg, enc).digest(enc);
};
/**
 * Performs a 'double hash' using SHA256. This means the data is hashed twice
 * with SHA256. First, the SHA256 hash of the message is computed, then the
 * SHA256 hash of the resulting hash is computed.
 * @function hash256
 * @param msg - The message to compute the hash for.
 * @param enc - Encoding of the message.If 'hex', the message is decoded from hexadecimal.
 *
 * @returns the double hashed SHA256 output.
 *
 * @example
 * const doubleHash = hash256('Hello, world!');
 */
export const hash256 = (msg, enc) => {
    const first = new SHA256().update(msg, enc).digest();
    return new SHA256().update(first).digest(enc);
};
/**
 * Computes SHA256 hash of a given message and then computes a RIPEMD160 hash of the result.
 *
 * @function hash160
 * @param msg - The message to compute the hash for.
 * @param enc - The encoding of the message. If 'hex', the message is decoded from hexadecimal.
 *
 * @returns the RIPEMD160 hash of the SHA256 hash of the input message.
 *
 * @example
 * const hash = hash160('Hello, world!');
 */
export const hash160 = (msg, enc) => {
    const first = new SHA256().update(msg, enc).digest();
    return new RIPEMD160().update(first).digest(enc);
};
/**
 * Computes SHA256 HMAC of a given message with a given key.
 * @function sha256hmac
 * @param key - The key used to compute the HMAC
 * @param msg - The message to compute the hash for.
 * @param enc - The encoding of the message. If 'hex', the message is decoded from hexadecimal first.
 *
 * @returns the computed HMAC of the message.
 *
 * @example
 * const digest = sha256hmac('deadbeef', 'ffff001d');
 */
export const sha256hmac = (key, msg, enc) => {
    return new SHA256HMAC(key).update(msg, enc).digest(enc);
};
//# sourceMappingURL=Hash.js.map