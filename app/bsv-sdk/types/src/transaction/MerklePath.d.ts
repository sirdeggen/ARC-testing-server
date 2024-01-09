import { Reader } from '../primitives/utils.js';
import ChainTracker from './ChainTracker.js';
/**
 * Represents a Merkle Path, which is used to provide a compact proof of inclusion for a
 * transaction in a block. This class encapsulates all the details required for creating
 * and verifying Merkle Proofs.
 *
 * @class MerklePath
 * @property {number} blockHeight - The height of the block in which the transaction is included.
 * @property {Array<Array<{offset: number, hash?: string, txid?: boolean, duplicate?: boolean}>>} path -
 *           A tree structure representing the Merkle Path, with each level containing information
 *           about the nodes involved in constructing the proof.
 *
 * @example
 * // Creating and verifying a Merkle Path
 * const merklePath = MerklePath.fromHex('...');
 * const isValid = merklePath.verify(txid, chainTracker);
 *
 * @description
 * The MerklePath class is useful for verifying transactions in a lightweight and efficient manner without
 * needing the entire block data. This class offers functionalities for creating, converting,
 * and verifying these proofs.
 */
export default class MerklePath {
    blockHeight: number;
    path: Array<Array<{
        offset: number;
        hash?: string;
        txid?: boolean;
        duplicate?: boolean;
    }>>;
    /**
     * Creates a MerklePath instance from a hexadecimal string.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromHex(hex: string): MerklePath;
    static fromReader(reader: Reader): MerklePath;
    /**
     * Creates a MerklePath instance from a binary array.
     *
     * @static
     * @param {number[]} bump - The binary array representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromBinary(bump: number[]): MerklePath;
    constructor(blockHeight: number, path: Array<Array<{
        offset: number;
        hash?: string;
        txid?: boolean;
        duplicate?: boolean;
    }>>);
    /**
     * Converts the MerklePath to a binary array format.
     *
     * @returns {number[]} - The binary array representation of the Merkle Path.
     */
    toBinary(): number[];
    /**
     * Converts the MerklePath to a hexadecimal string format.
     *
     * @returns {string} - The hexadecimal string representation of the Merkle Path.
     */
    toHex(): string;
    /**
     * Computes the Merkle root from the provided transaction ID.
     *
     * @param {string} txid - The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!
     * @returns {string} - The computed Merkle root as a hexadecimal string.
     * @throws {Error} - If the transaction ID is not part of the Merkle Path.
     */
    computeRoot(txid?: string): string;
    /**
     * Verifies if the given transaction ID is part of the Merkle tree at the specified block height.
     *
     * @param {string} txid - The transaction ID to verify.
     * @param {ChainTracker} chainTracker - The ChainTracker instance used to verify the Merkle root.
     * @returns {boolean} - True if the transaction ID is valid within the Merkle Path at the specified block height.
     */
    verify(txid: string, chainTracker: ChainTracker): Promise<boolean>;
    /**
     * Combines this MerklePath with another to create a compound proof.
     *
     * @param {MerklePath} other - Another MerklePath to combine with this path.
     * @throws {Error} - If the paths have different block heights or roots.
     */
    combine(other: MerklePath): void;
}
//# sourceMappingURL=MerklePath.d.ts.map