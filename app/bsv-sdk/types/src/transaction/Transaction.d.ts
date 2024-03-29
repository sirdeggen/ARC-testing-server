import TransactionInput from './TransactionInput.js';
import TransactionOutput from './TransactionOutput.js';
import FeeModel from './FeeModel.js';
import { Broadcaster, BroadcastResponse, BroadcastFailure } from './Broadcaster.js';
import MerklePath from './MerklePath.js';
import ChainTracker from './ChainTracker.js';
/**
 * Represents a complete Bitcoin transaction. This class encapsulates all the details
 * required for creating, signing, and processing a Bitcoin transaction, including
 * inputs, outputs, and various transaction-related methods.
 *
 * @class Transaction
 * @property {number} version - The version number of the transaction. Used to specify
 *           which set of rules this transaction follows.
 * @property {TransactionInput[]} inputs - An array of TransactionInput objects, representing
 *           the inputs for the transaction. Each input references a previous transaction's output.
 * @property {TransactionOutput[]} outputs - An array of TransactionOutput objects, representing
 *           the outputs for the transaction. Each output specifies the amount of satoshis to be
 *           transferred and the conditions under which they can be spent.
 * @property {number} lockTime - The lock time of the transaction. If non-zero, it specifies the
 *           earliest time or block height at which the transaction can be added to the block chain.
 * @property {Record<string, any>} metadata - A key-value store for attaching additional data to
 *           the transaction object, not included in the transaction itself. Useful for adding descriptions, internal reference numbers, or other information.
 * @property {MerkleProof} [merkleProof] - Optional. A merkle proof demonstrating the transaction's
 *           inclusion in a block. Useful for transaction verification using SPV.
 *
 * @example
 * // Creating a new transaction
 * let tx = new Transaction();
 * tx.addInput(...);
 * tx.addOutput(...);
 * await tx.fee();
 * await tx.sign();
 * await tx.broadcast();
 *
 * @description
 * The Transaction class provides comprehensive
 * functionality to handle various aspects of transaction creation, including
 * adding inputs and outputs, computing fees, signing the transaction, and
 * generating its binary or hexadecimal representation.
 */
export default class Transaction {
    version: number;
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    lockTime: number;
    metadata: Record<string, any>;
    merklePath?: MerklePath;
    /**
     * Creates a new transaction, linked to its inputs and their associated merkle paths, from a BEEF (BRC-62) structure.
     * @param beef A binary representation of a transaction in BEEF format.
     * @returns An anchored transaction, linked to its associated inputs populated with merkle paths.
     */
    static fromBEEF(beef: number[]): Transaction;
    private static fromReader;
    /**
     * Creates a Transaction instance from a binary array.
     *
     * @static
     * @param {number[]} bin - The binary array representation of the transaction.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromBinary(bin: number[]): Transaction;
    /**
     * Creates a Transaction instance from a hexadecimal string.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the transaction.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromHex(hex: string): Transaction;
    /**
     * Creates a Transaction instance from a hexadecimal string encoded BEEF.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the transaction BEEF.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromHexBEEF(hex: string): Transaction;
    constructor(version?: number, inputs?: TransactionInput[], outputs?: TransactionOutput[], lockTime?: number, metadata?: Record<string, any>, merklePath?: MerklePath);
    /**
     * Adds a new input to the transaction.
     *
     * @param {TransactionInput} input - The TransactionInput object to add to the transaction.
     * @throws {Error} - If the input does not have a sourceTXID or sourceTransaction defined.
     */
    addInput(input: TransactionInput): void;
    /**
     * Adds a new output to the transaction.
     *
     * @param {TransactionOutput} output - The TransactionOutput object to add to the transaction.
     */
    addOutput(output: TransactionOutput): void;
    /**
     * Updates the transaction's metadata.
     *
     * @param {Record<string, any>} metadata - The metadata object to merge into the existing metadata.
     */
    updateMetadata(metadata: Record<string, any>): void;
    /**
     * Computes fees prior to signing.
     * If no fee model is provided, uses a SatoshisPerKilobyte fee model that pays 10 sat/kb.
     *
     * @param model - The initialized fee model to use
     * @param changeDistribution - Specifies how the change should be distributed
     * amongst the change outputs
     *
     * TODO: Benford's law change distribution.
     */
    fee(model?: FeeModel, changeDistribution?: 'equal' | 'random'): Promise<void>;
    /**
     * Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.
     */
    sign(): Promise<void>;
    /**
     * Broadcasts a transaction.
     *
     * @param broadcaster The Broadcaster instance wwhere the transaction will be sent
     * @returns A BroadcastResponse or BroadcastFailure from the Broadcaster
     */
    broadcast(broadcaster: Broadcaster): Promise<BroadcastResponse | BroadcastFailure>;
    /**
     * Converts the transaction to a binary array format.
     *
     * @returns {number[]} - The binary array representation of the transaction.
     */
    toBinary(): number[];
    /**
     * Converts the transaction to a BRC-30 EF format.
     *
     * @returns {number[]} - The BRC-30 EF representation of the transaction.
     */
    toEF(): number[];
    /**
     * Converts the transaction to a hexadecimal string EF.
     *
     * @returns {string} - The hexadecimal string representation of the transaction EF.
     */
    toHexEF(): string;
    /**
     * Converts the transaction to a hexadecimal string format.
     *
     * @returns {string} - The hexadecimal string representation of the transaction.
     */
    toHex(): string;
    /**
     * Converts the transaction to a hexadecimal string BEEF.
     *
     * @returns {string} - The hexadecimal string representation of the transaction BEEF.
     */
    toHexBEEF(): string;
    /**
     * Calculates the transaction's hash.
     *
     * @param {'hex' | undefined} enc - The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
     * @returns {string | number[]} - The hash of the transaction in the specified format.
     */
    hash(enc?: 'hex'): number[] | string;
    /**
     * Calculates the transaction's ID.
     *
     * @param {'hex' | undefined} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
     * @returns {string | number[]} - The ID of the transaction in the specified format.
     */
    id(enc?: 'hex'): number[] | string;
    /**
     * Verifies the legitimacy of the Bitcoin transaction according to the rules of SPV by ensuring all the input transactions link back to valid block headers, the chain of spends for all inputs are valid, and the sum of inputs is not less than the sum of outputs.
     *
     * @param chainTracker - An instance of ChainTracker, a Bitcoin block header tracker.
     *
     * @returns Whether the transaction is valid according to the rules of SPV.
     */
    verify(chainTracker: ChainTracker): Promise<boolean>;
    /**
     * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
     *
     * @returns The serialized BEEF structure
     */
    toBEEF(): number[];
}
//# sourceMappingURL=Transaction.d.ts.map