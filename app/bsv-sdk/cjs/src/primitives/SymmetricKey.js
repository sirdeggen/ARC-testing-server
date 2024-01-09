"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber_js_1 = require("./BigNumber.js");
const AESGCM_js_1 = require("./AESGCM.js");
const Random_js_1 = require("./Random.js");
const utils_js_1 = require("./utils.js");
/**
 * `SymmetricKey` is a class that extends the `BigNumber` class and implements symmetric encryption and decryption methods.
 * Symmetric-Key encryption is a form of encryption where the same key is used to encrypt and decrypt the message.
 * It leverages the Advanced Encryption Standard Galois/Counter Mode (AES-GCM) for encryption and decryption of messages.
 *
 * @class SymmetricKey
 * @extends {BigNumber}
 */
class SymmetricKey extends BigNumber_js_1.default {
    /**
    * Encrypts a given message using AES-GCM encryption.
    * The generated Initialization Vector (IV) is attached to the encrypted message for decryption purposes.
    * The OpenSSL format of |IV|encryptedContent|authTag| is used.
    *
    * @method encrypt
    * @param msg - The message to be encrypted. It can be a string or an array of numbers.
    * @param enc - optional. The encoding of the message. If hex, the string is assumed to be hex, UTF-8 otherwise.
    * @returns Returns the encrypted message as a string or an array of numbers, depending on `enc` argument.
    *
    * @example
    * const key = new SymmetricKey(1234);
    * const encryptedMessage = key.encrypt('plainText', 'utf8');
    */
    encrypt(msg, enc) {
        const iv = (0, Random_js_1.default)(32);
        msg = (0, utils_js_1.toArray)(msg, enc);
        const { result, authenticationTag } = (0, AESGCM_js_1.AESGCM)(msg, [], iv, this.toArray());
        return (0, utils_js_1.encode)([...iv, ...result, ...authenticationTag], enc);
    }
    /**
     * Decrypts a given AES-GCM encrypted message using the same key that was used for encryption.
     * The method extracts the IV and the authentication tag from the encrypted message, then attempts to decrypt it.
     * If the decryption fails (e.g., due to message tampering), an error is thrown.
     *
     * @method decrypt
     * @param msg - The encrypted message to be decrypted. It can be a string or an array of numbers.
     * @param enc - optional. The encoding of the message (if no encoding is provided, uses utf8 for strings, unless specified as hex).
     * @returns Returns the decrypted message as a string or an array of numbers, depending on `enc` argument. If absent, an array of numbers is returned.
     *
     * @example
     * const key = new SymmetricKey(1234);
     * const decryptedMessage = key.decrypt(encryptedMessage, 'utf8');
     *
     * @throws {Error} Will throw an error if the decryption fails, likely due to message tampering or incorrect decryption key.
     */
    decrypt(msg, enc) {
        msg = (0, utils_js_1.toArray)(msg, enc);
        const iv = msg.slice(0, 32);
        const ciphertextWithTag = msg.slice(32);
        const messageTag = ciphertextWithTag.slice(-16);
        const ciphertext = ciphertextWithTag.slice(0, -16);
        const result = (0, AESGCM_js_1.AESGCMDecrypt)(ciphertext, [], iv, messageTag, this.toArray());
        if (result === null) {
            throw new Error('Decryption failed!');
        }
        return (0, utils_js_1.encode)(result, enc);
    }
}
exports.default = SymmetricKey;
//# sourceMappingURL=SymmetricKey.js.map