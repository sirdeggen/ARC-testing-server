"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Point_js_1 = require("./Point.js");
const Curve_js_1 = require("./Curve.js");
const ECDSA_js_1 = require("./ECDSA.js");
const BigNumber_js_1 = require("./BigNumber.js");
const Hash_js_1 = require("./Hash.js");
const utils_js_1 = require("./utils.js");
const Hash_js_2 = require("./Hash.js");
/**
 * The PublicKey class extends the Point class. It is used in public-key cryptography to derive shared secret, verify message signatures, and encode the public key in the DER format.
 * The class comes with static methods to generate PublicKey instances from private keys or from strings.
 *
 * @extends {Point}
 * @see {@link Point} for more information on Point.
 */
class PublicKey extends Point_js_1.default {
    /**
     * Static factory method to derive a public key from a private key.
     * It multiplies the generator point 'g' on the elliptic curve by the private key.
     *
     * @static
     * @method fromPrivateKey
     *
     * @param key - The private key from which to derive the public key.
     *
     * @returns Returns the PublicKey derived from the given PrivateKey.
     *
     * @example
     * const myPrivKey = new PrivateKey(...)
     * const myPubKey = PublicKey.fromPrivateKey(myPrivKey)
     */
    static fromPrivateKey(key) {
        const c = new Curve_js_1.default();
        const p = c.g.mul(key);
        return new PublicKey(p.x, p.y);
    }
    /**
     * Static factory method to create a PublicKey instance from a string.
     *
     * @param str - A string representing a public key.
     *
     * @returns Returns the PublicKey created from the string.
     *
     * @example
     * const myPubKey = PublicKey.fromString("03....")
     */
    static fromString(str) {
        const p = Point_js_1.default.fromString(str);
        return new PublicKey(p.x, p.y);
    }
    /**
     * Derive a shared secret from a public key and a private key for use in symmetric encryption.
     * This method multiplies the public key (an instance of Point) with a private key.
     *
     * @param priv - The private key to use in deriving the shared secret.
     *
     * @returns Returns the Point representing the shared secret.
     *
     * @throws Will throw an error if the public key is not valid for ECDH secret derivation.
     *
     * @example
     * const myPrivKey = new PrivateKey(...)
     * const sharedSecret = myPubKey.deriveSharedSecret(myPrivKey)
     */
    deriveSharedSecret(priv) {
        if (!this.validate()) {
            throw new Error('Public key not valid for ECDH secret derivation');
        }
        return this.mul(priv);
    }
    /**
     * Verify a signature of a message using this public key.
     *
     * @param msg - The message to verify. It can be a string or an array of numbers.
     * @param sig - The Signature of the message that needs verification.
     * @param enc - The encoding of the message. It defaults to 'hex'.
     *
     * @returns Returns true if the signature is verified successfully, otherwise false.
     *
     * @example
     * const myMessage = "Hello, world!"
     * const mySignature = new Signature(...)
     * const isVerified = myPubKey.verify(myMessage, mySignature)
     */
    verify(msg, sig, enc) {
        const msgHash = new BigNumber_js_1.default((0, Hash_js_1.sha256)(msg, enc), 16);
        return (0, ECDSA_js_1.verify)(msgHash, sig, this);
    }
    /**
     * Encode the public key to DER (Distinguished Encoding Rules) format.
     *
     * @returns Returns the DER-encoded string of this public key.
     *
     * @example
     * const derPublicKey = myPubKey.toDER()
     */
    toDER() {
        return this.encode(true, 'hex');
    }
    /**
     * Hash sha256 and ripemd160 of the public key.
     *
     * @returns Returns the hash of the public key.
     *
     * @example
     * const publicKeyHash = pubkey.toHash()
     */
    toHash(enc) {
        const pkh = (0, Hash_js_2.hash160)(this.encode(true));
        if (enc === 'hex') {
            return (0, utils_js_1.toHex)(pkh);
        }
        return pkh;
    }
    /**
     * Derives a child key with BRC-42.
     * @param privateKey The private key of the other party
     * @param invoiceNumber The invoice number used to derive the child key
     * @returns The derived child key.
     */
    deriveChild(privateKey, invoiceNumber) {
        const sharedSecret = this.deriveSharedSecret(privateKey);
        const invoiceNumberBin = (0, utils_js_1.toArray)(invoiceNumber, 'utf8');
        const hmac = (0, Hash_js_1.sha256hmac)(sharedSecret.encode(true), invoiceNumberBin);
        const curve = new Curve_js_1.default();
        const point = curve.g.mul(new BigNumber_js_1.default(hmac));
        const finalPoint = this.add(point);
        return new PublicKey(finalPoint.x, finalPoint.y);
    }
}
exports.default = PublicKey;
//# sourceMappingURL=PublicKey.js.map