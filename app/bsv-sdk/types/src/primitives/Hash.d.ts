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
declare abstract class BaseHash {
    pending: number[] | null;
    pendingTotal: number;
    blockSize: number;
    outSize: number;
    endian: 'big' | 'little';
    _delta8: number;
    _delta32: number;
    padLength: number;
    hmacStrength: number;
    constructor(blockSize: number, outSize: number, hmacStrength: number, padLength: number);
    _update(msg: number[], start: number): void;
    _digest(enc?: 'hex'): number[] | string;
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
    update(msg: number[] | string, enc?: 'hex'): this;
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
    digest(enc?: 'hex'): number[] | string;
    /**
     * [Private Method] Used internally to prepare the padding for the final stage of the hash computation.
     *
     * @method _pad
     * @private
     *
     * @returns Returns an array denoting the padding.
     */
    private _pad;
}
export declare function toArray(msg: number[] | string, enc?: 'hex'): number[];
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
export declare class RIPEMD160 extends BaseHash {
    h: number[];
    constructor();
    _update(msg: number[], start: number): void;
    _digest(enc?: 'hex'): string | number[];
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
export declare class SHA256 extends BaseHash {
    h: number[];
    W: number[];
    k: number[];
    constructor();
    _update(msg: number[], start?: number): void;
    _digest(enc?: 'hex'): number[] | string;
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
export declare class SHA1 extends BaseHash {
    h: number[];
    W: number[];
    k: number[];
    constructor();
    _update(msg: number[], start?: number): void;
    _digest(enc?: 'hex'): number[] | string;
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
export declare class SHA256HMAC {
    inner: SHA256;
    outer: SHA256;
    blockSize: number;
    outSize: number;
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
    constructor(key: number[] | string);
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
    update(msg: number[] | string, enc?: 'hex'): SHA256HMAC;
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
    digest(enc?: 'hex'): number[] | string;
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
export declare const ripemd160: (msg: number[] | string, enc?: 'hex') => number[] | string;
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
export declare const sha1: (msg: number[] | string, enc?: 'hex') => number[] | string;
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
export declare const sha256: (msg: number[] | string, enc?: 'hex') => number[] | string;
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
export declare const hash256: (msg: number[] | string, enc?: 'hex') => number[] | string;
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
export declare const hash160: (msg: number[] | string, enc?: 'hex') => number[] | string;
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
export declare const sha256hmac: (key: number[] | string, msg: number[] | string, enc?: 'hex') => number[] | string;
export {};
//# sourceMappingURL=Hash.d.ts.map