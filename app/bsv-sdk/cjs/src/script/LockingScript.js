"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Script_js_1 = require("./Script.js");
/**
 * The LockingScript class represents a locking script in a Bitcoin SV transaction.
 * It extends the Script class and is used specifically for output scripts that lock funds.
 *
 * Inherits all properties and methods from the Script class.
 *
 * @extends {Script}
 * @see {@link Script} for more information on Script.
 */
class LockingScript extends Script_js_1.default {
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns {boolean} Always returns true for a LockingScript instance.
     */
    isLockingScript() {
        return true;
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns {boolean} Always returns false for a LockingScript instance.
     */
    isUnlockingScript() {
        return false;
    }
}
exports.default = LockingScript;
//# sourceMappingURL=LockingScript.js.map