"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Curve_js_1 = require("./Curve.js");
/**
 * Base class for Point (affine coordinates) and JacobianPoint classes,
 * defining their curve and type.
 */
class BasePoint {
    constructor(type) {
        this.curve = new Curve_js_1.default();
        this.type = type;
        this.precomputed = null;
    }
}
exports.default = BasePoint;
//# sourceMappingURL=BasePoint.js.map