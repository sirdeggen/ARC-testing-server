"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const PublicKey_js_1 = require("../primitives/PublicKey.js");
const SymmetricKey_js_1 = require("../primitives/SymmetricKey.js");
const Random_js_1 = require("../primitives/Random.js");
const utils_js_1 = require("../primitives/utils.js");
const VERSION = '42421033';
/**
 * Encrypts a message from one party to another using the BRC-78 message encryption protocol.
 * @param message The message to encrypt
 * @param sender The private key of the sender
 * @param recipient The public key of the recipient
 *
 * @returns The encrypted message
 */
const encrypt = (message, sender, recipient) => {
    const keyID = (0, Random_js_1.default)(32);
    const keyIDBase64 = (0, utils_js_1.toBase64)(keyID);
    const invoiceNumber = `2-message encryption-${keyIDBase64}`;
    const signingPriv = sender.deriveChild(recipient, invoiceNumber);
    const recipientPub = recipient.deriveChild(sender, invoiceNumber);
    const sharedSecret = signingPriv.deriveSharedSecret(recipientPub);
    const symmetricKey = new SymmetricKey_js_1.default(sharedSecret.encode(true).slice(1));
    const encrypted = symmetricKey.encrypt(message);
    const senderPublicKey = sender.toPublicKey().encode(true);
    const version = (0, utils_js_1.toArray)(VERSION, 'hex');
    return [
        ...version,
        ...senderPublicKey,
        ...recipient.encode(true),
        ...keyID,
        ...encrypted
    ];
};
exports.encrypt = encrypt;
/**
 * Decrypts a message from one party to another using the BRC-78 message encryption protocol.
 * @param message The message to decrypt
 * @param sender The private key of the recipient
 *
 * @returns The decrypted message
 */
const decrypt = (message, recipient) => {
    const reader = new utils_js_1.Reader(message);
    const messageVersion = (0, utils_js_1.toHex)(reader.read(4));
    if (messageVersion !== VERSION) {
        throw new Error(`Message version mismatch: Expected ${VERSION}, received ${messageVersion}`);
    }
    const sender = PublicKey_js_1.default.fromString((0, utils_js_1.toHex)(reader.read(33)));
    const expectedRecipientDER = (0, utils_js_1.toHex)(reader.read(33));
    const actualRecipientDER = recipient.toPublicKey().encode(true, 'hex');
    if (expectedRecipientDER !== actualRecipientDER) {
        throw new Error(`The encrypted message expects a recipient public key of ${expectedRecipientDER}, but the provided key is ${actualRecipientDER}`);
    }
    const keyID = (0, utils_js_1.toBase64)(reader.read(32));
    const encrypted = reader.read(reader.bin.length - reader.pos);
    const invoiceNumber = `2-message encryption-${keyID}`;
    const signingPriv = sender.deriveChild(recipient, invoiceNumber);
    const recipientPub = recipient.deriveChild(sender, invoiceNumber);
    const sharedSecret = signingPriv.deriveSharedSecret(recipientPub);
    const symmetricKey = new SymmetricKey_js_1.default(sharedSecret.encode(true).slice(1));
    return symmetricKey.decrypt(encrypted);
};
exports.decrypt = decrypt;
//# sourceMappingURL=EncryptedMessage.js.map