"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Script_js_1 = require("./Script.js");
/**
 * The UnlockingScript class represents an unlocking script in a Bitcoin SV transaction.
 * It extends the Script class and is used specifically for input scripts that unlock funds.
 *
 * Inherits all properties and methods from the Script class.
 *
 * @extends {Script}
 * @see {@link Script} for more information on Script.
 */
class UnlockingScript extends Script_js_1.default {
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns {boolean} Always returns false for an UnlockingScript instance.
     */
    isLockingScript() {
        return false;
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns {boolean} Always returns true for an UnlockingScript instance.
     */
    isUnlockingScript() {
        return true;
    }
}
exports.default = UnlockingScript;
//# sourceMappingURL=UnlockingScript.js.map