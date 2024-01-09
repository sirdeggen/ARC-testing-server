"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("../primitives/utils.js");
const Hash_js_1 = require("../primitives/Hash.js");
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
class MerklePath {
    /**
     * Creates a MerklePath instance from a hexadecimal string.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromHex(hex) {
        return MerklePath.fromBinary((0, utils_js_1.toArray)(hex, 'hex'));
    }
    static fromReader(reader) {
        const blockHeight = reader.readVarIntNum();
        const treeHeight = reader.readUInt8();
        const path = Array(treeHeight).fill(0).map(() => ([]));
        let flags, offset, nLeavesAtThisHeight;
        for (let level = 0; level < treeHeight; level++) {
            nLeavesAtThisHeight = reader.readVarIntNum();
            while (nLeavesAtThisHeight) {
                offset = reader.readVarIntNum();
                flags = reader.readUInt8();
                const leaf = { offset };
                if (flags & 1) {
                    leaf.duplicate = true;
                }
                else {
                    if (flags & 2) {
                        leaf.txid = true;
                    }
                    leaf.hash = (0, utils_js_1.toHex)(reader.read(32).reverse());
                }
                path[level].push(leaf);
                nLeavesAtThisHeight--;
            }
            path[level].sort((a, b) => a.offset - b.offset);
        }
        return new MerklePath(blockHeight, path);
    }
    /**
     * Creates a MerklePath instance from a binary array.
     *
     * @static
     * @param {number[]} bump - The binary array representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromBinary(bump) {
        const reader = new utils_js_1.Reader(bump);
        return MerklePath.fromReader(reader);
    }
    constructor(blockHeight, path) {
        this.blockHeight = blockHeight;
        this.path = path;
    }
    /**
     * Converts the MerklePath to a binary array format.
     *
     * @returns {number[]} - The binary array representation of the Merkle Path.
     */
    toBinary() {
        const writer = new utils_js_1.Writer();
        writer.writeVarIntNum(this.blockHeight);
        const treeHeight = this.path.length;
        writer.writeUInt8(treeHeight);
        for (let level = 0; level < treeHeight; level++) {
            const nLeaves = Object.keys(this.path[level]).length;
            writer.writeVarIntNum(nLeaves);
            for (const leaf of this.path[level]) {
                writer.writeVarIntNum(leaf.offset);
                let flags = 0;
                if (leaf === null || leaf === void 0 ? void 0 : leaf.duplicate) {
                    flags |= 1;
                }
                if (leaf === null || leaf === void 0 ? void 0 : leaf.txid) {
                    flags |= 2;
                }
                writer.writeUInt8(flags);
                if ((flags & 1) === 0) {
                    writer.write((0, utils_js_1.toArray)(leaf.hash, 'hex').reverse());
                }
            }
        }
        return writer.toArray();
    }
    /**
     * Converts the MerklePath to a hexadecimal string format.
     *
     * @returns {string} - The hexadecimal string representation of the Merkle Path.
     */
    toHex() {
        return (0, utils_js_1.toHex)(this.toBinary());
    }
    /**
     * Computes the Merkle root from the provided transaction ID.
     *
     * @param {string} txid - The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!
     * @returns {string} - The computed Merkle root as a hexadecimal string.
     * @throws {Error} - If the transaction ID is not part of the Merkle Path.
     */
    computeRoot(txid) {
        if (typeof txid !== 'string') {
            txid = this.path[0].find(leaf => Boolean(leaf === null || leaf === void 0 ? void 0 : leaf.hash)).hash;
        }
        // Find the index of the txid at the lowest level of the Merkle tree
        const index = this.path[0].find(l => l.hash === txid).offset;
        if (typeof index !== 'number') {
            throw Error(`This proof does not contain the txid: ${txid}`);
        }
        // Calculate the root using the index as a way to determine which direction to concatenate.
        const hash = (m) => (0, utils_js_1.toHex)((0, Hash_js_1.hash256)((0, utils_js_1.toArray)(m, 'hex').reverse()).reverse());
        let workingHash = txid;
        for (let height = 0; height < this.path.length; height++) {
            const leaves = this.path[height];
            const offset = index >> height ^ 1;
            const leaf = leaves.find(l => l.offset === offset);
            if (typeof leaf !== 'object') {
                throw new Error(`Missing hash for index ${index} at height ${height}`);
            }
            if (leaf.duplicate) {
                workingHash = hash(workingHash + workingHash);
            }
            else if (offset % 2 !== 0) {
                workingHash = hash(leaf.hash + workingHash);
            }
            else {
                workingHash = hash(workingHash + leaf.hash);
            }
        }
        return workingHash;
    }
    /**
     * Verifies if the given transaction ID is part of the Merkle tree at the specified block height.
     *
     * @param {string} txid - The transaction ID to verify.
     * @param {ChainTracker} chainTracker - The ChainTracker instance used to verify the Merkle root.
     * @returns {boolean} - True if the transaction ID is valid within the Merkle Path at the specified block height.
     */
    async verify(txid, chainTracker) {
        const root = this.computeRoot(txid);
        // Use the chain tracker to determine whether this is a valid merkle root at the given block height
        return await chainTracker.isValidRootForHeight(root, this.blockHeight);
    }
    /**
     * Combines this MerklePath with another to create a compound proof.
     *
     * @param {MerklePath} other - Another MerklePath to combine with this path.
     * @throws {Error} - If the paths have different block heights or roots.
     */
    combine(other) {
        var _a;
        if (this.blockHeight !== other.blockHeight) {
            throw Error('You cannot combine paths which do not have the same block height.');
        }
        const root1 = this.computeRoot();
        const root2 = other.computeRoot();
        if (root1 !== root2) {
            throw Error('You cannot combine paths which do not have the same root.');
        }
        const combinedPath = [];
        for (let h = 0; h < this.path.length; h++) {
            combinedPath.push([]);
            for (let l = 0; l < this.path[h].length; l++) {
                combinedPath[h].push(this.path[h][l]);
            }
            for (let l = 0; l < other.path[h].length; l++) {
                if (!combinedPath[h].find(leaf => leaf.offset === other.path[h][l].offset)) {
                    combinedPath[h].push(other.path[h][l]);
                }
                else {
                    // Ensure that any elements which appear in both are not downgraded to a non txid.
                    if ((_a = other.path[h][l]) === null || _a === void 0 ? void 0 : _a.txid) {
                        combinedPath[h].find(leaf => leaf.offset === other.path[h][l]).txid = true;
                    }
                }
            }
        }
        this.path = combinedPath;
    }
}
exports.default = MerklePath;
//# sourceMappingURL=MerklePath.js.map