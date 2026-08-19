"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPgPool = isPgPool;
/**
 * Narrows whether a user-provided connection value is already an instantiated
 * `pg.Pool` (as opposed to a config object / connection string that we must use
 * to construct one).
 */
function isPgPool(value) {
    return (!!value &&
        typeof value.connect === 'function' &&
        typeof value.query === 'function' &&
        typeof value.end === 'function');
}
