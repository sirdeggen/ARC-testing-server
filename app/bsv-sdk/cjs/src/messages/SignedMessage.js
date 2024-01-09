"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = void 0;
const PublicKey_js_1 = require("../primitives/PublicKey.js");
const PrivateKey_js_1 = require("../primitives/PrivateKey.js");
const Signature_js_1 = require("../primitives/Signature.js");
const Curve_js_1 = require("../primitives/Curve.js");
const Random_js_1 = require("../primitives/Random.js");
const utils_js_1 = require("../primitives/utils.js");
const VERSION = '42423301';
/**
 * Signs a message from one party to be verified by another, or for verification by anyone, using the BRC-77 message signing protocol.
 * @param message The message to sign
 * @param signer The private key of the message signer
 * @param [verifier] The public key of the person who can verify the message. If not provided, anyone will be able to verify the message signature.
 *
 * @returns The message signature.
 */
const sign = (message, signer, verifier) => {
    const recipientAnyone = typeof verifier !== 'object';
    if (recipientAnyone) {
        const curve = new Curve_js_1.default();
        const anyone = new PrivateKey_js_1.default(1);
        const anyonePoint = curve.g.mul(anyone);
        verifier = new PublicKey_js_1.default(anyonePoint.x, anyonePoint.y);
    }
    const keyID = (0, Random_js_1.default)(32);
    const keyIDBase64 = (0, utils_js_1.toBase64)(keyID);
    const invoiceNumber = `2-message signing-${keyIDBase64}`;
    const signingKey = signer.deriveChild(verifier, invoiceNumber);
    const signature = signingKey.sign(message).toDER();
    const senderPublicKey = signer.toPublicKey().encode(true);
    const version = (0, utils_js_1.toArray)(VERSION, 'hex');
    return [
        ...version,
        ...senderPublicKey,
        ...(recipientAnyone ? [0] : verifier.encode(true)),
        ...keyID,
        ...signature
    ];
};
exports.sign = sign;
/**
 * Verifies a message using the BRC-77 message signing protocol.
 * @param message The message to verify.
 * @param sig The message signature to be verified.
 * @param [recipient] The private key of the message verifier. This can be omitted if the message is verifiable by anyone.
 *
 * @returns True if the message is verified.
 */
const verify = (message, sig, recipient) => {
    const reader = new utils_js_1.Reader(sig);
    const messageVersion = (0, utils_js_1.toHex)(reader.read(4));
    if (messageVersion !== VERSION) {
        throw new Error(`Message version mismatch: Expected ${VERSION}, received ${messageVersion}`);
    }
    const signer = PublicKey_js_1.default.fromString((0, utils_js_1.toHex)(reader.read(33)));
    const [verifierFirst] = reader.read(1);
    if (verifierFirst === 0) {
        recipient = new PrivateKey_js_1.default(1);
    }
    else {
        const verifierRest = reader.read(32);
        const verifierDER = (0, utils_js_1.toHex)([verifierFirst, ...verifierRest]);
        if (typeof recipient !== 'object') {
            throw new Error(`This signature can only be verified with knowledge of a specific private key. The associated public key is: ${verifierDER}`);
        }
        const recipientDER = recipient.toPublicKey().encode(true, 'hex');
        if (verifierDER !== recipientDER) {
            throw new Error(`The recipient public key is ${recipientDER} but the signature requres the recipient to have public key ${verifierDER}`);
        }
    }
    const keyID = (0, utils_js_1.toBase64)(reader.read(32));
    const signatureDER = (0, utils_js_1.toHex)(reader.read(reader.bin.length - reader.pos));
    const signature = Signature_js_1.default.fromDER(signatureDER, 'hex');
    const invoiceNumber = `2-message signing-${keyID}`;
    const signingKey = signer.deriveChild(recipient, invoiceNumber);
    const verified = signingKey.verify(message, signature);
    return verified;
};
exports.verify = verify;
//# sourceMappingURL=SignedMessage.js.map