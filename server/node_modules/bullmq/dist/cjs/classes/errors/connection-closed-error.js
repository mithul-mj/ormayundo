"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionClosedError = exports.CONNECTION_CLOSED_ERROR_MSG = void 0;
/**
 * Error message used when a connection is closed.
 *
 * This mirrors the constant exported by ioredis (`ioredis/built/utils`) but is
 * defined locally so that BullMQ can be used without ioredis installed (for
 * example, when using the PostgreSQL backend).
 */
exports.CONNECTION_CLOSED_ERROR_MSG = 'Connection is closed.';
/**
 * Thrown by any BullMQ Redis adapter (ioredis, node-redis, Bun, …) when a
 * command fails because the connection is already closed or was closed
 * mid-flight.
 *
 * Using a single well-known class lets {@link isNotConnectionError} do a
 * structural `instanceof` check rather than fragile message-substring matching.
 */
class ConnectionClosedError extends Error {
    constructor(message, cause) {
        super(message !== null && message !== void 0 ? message : exports.CONNECTION_CLOSED_ERROR_MSG);
        this.cause = cause;
        this.name = 'ConnectionClosedError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ConnectionClosedError = ConnectionClosedError;
