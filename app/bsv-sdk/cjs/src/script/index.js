"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spend = exports.UnlockingScript = exports.LockingScript = exports.Script = exports.OP = void 0;
var OP_js_1 = require("./OP.js");
Object.defineProperty(exports, "OP", { enumerable: true, get: function () { return OP_js_1.default; } });
var Script_js_1 = require("./Script.js");
Object.defineProperty(exports, "Script", { enumerable: true, get: function () { return Script_js_1.default; } });
var LockingScript_js_1 = require("./LockingScript.js");
Object.defineProperty(exports, "LockingScript", { enumerable: true, get: function () { return LockingScript_js_1.default; } });
var UnlockingScript_js_1 = require("./UnlockingScript.js");
Object.defineProperty(exports, "UnlockingScript", { enumerable: true, get: function () { return UnlockingScript_js_1.default; } });
var Spend_js_1 = require("./Spend.js");
Object.defineProperty(exports, "Spend", { enumerable: true, get: function () { return Spend_js_1.default; } });
__exportStar(require("./templates/index.js"), exports);
//# sourceMappingURL=index.js.map