"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisBackend = void 0;
exports.setDefaultBackendFactory = setDefaultBackendFactory;
exports.getDefaultBackendFactory = getDefaultBackendFactory;
const redis_queue_backend_1 = require("../classes/redis-queue-backend");
const redis_connection_1 = require("../classes/redis-connection");
const queue_keys_1 = require("../classes/queue-keys");
const ioredis_client_1 = require("../classes/ioredis-client");
const index_1 = require("./index");
/**
 * Builds the dedicated, blocking connection that a worker needs so its blocking
 * fetch (`BZPOPMIN`) does not stall regular operations. Reuses / duplicates the
 * provided connection options with its own name.
 */
const createBlockingConnection = (name, opts) => {
    var _a;
    const base64Name = Buffer.from(name).toString('base64');
    const workerName = opts.name;
    const connectionName = `${(_a = opts.prefix) !== null && _a !== void 0 ? _a : 'bull'}:${base64Name}${workerName ? `:w:${workerName}` : ''}`;
    return new redis_connection_1.RedisConnection((0, index_1.isRedisInstance)(opts.connection)
        ? ((0, ioredis_client_1.isIRedisClient)(opts.connection)
            ? opts.connection
            : (0, ioredis_client_1.createIORedisClient)(opts.connection)).duplicate({ connectionName })
        : Object.assign(Object.assign({}, opts.connection), { connectionName }), {
        shared: false,
        blocking: true,
        skipVersionCheck: opts.skipVersionCheck,
    });
};
/**
 * The default ({@link RedisConnection}-based) implementation of
 * {@link BackendFactory}. The returned backend owns its connection(s); the
 * high-level classes (Queue, Worker, FlowProducer, …) depend only on
 * {@link IQueueBackend} and never touch a Redis client directly.
 *
 * Other datastores can provide their own {@link BackendFactory} and inject it
 * into the queue classes.
 */
const createRedisBackend = (name, opts, { blocking = false, withBlockingConnection = false } = {}) => {
    const connection = new redis_connection_1.RedisConnection(opts.connection, {
        shared: (0, index_1.isRedisInstance)(opts.connection),
        blocking,
        skipVersionCheck: opts.skipVersionCheck,
        skipWaitingForReady: opts.skipWaitingForReady,
    });
    const blockingConnection = withBlockingConnection
        ? createBlockingConnection(name, opts)
        : undefined;
    const queueKeys = new queue_keys_1.QueueKeys(opts.prefix);
    const keys = queueKeys.getKeys(name);
    const toKey = (type) => queueKeys.toKey(name, type);
    return new redis_queue_backend_1.RedisQueueBackend(connection, name, keys, toKey, opts, blockingConnection);
};
exports.createRedisBackend = createRedisBackend;
/**
 * The process-wide default {@link BackendFactory} used by the high-level
 * classes ({@link QueueBase}, {@link FlowProducer}) when the caller does not
 * pass an explicit `backendFactory`. Initialised to the Redis backend so the
 * default behaviour is unchanged.
 */
let defaultBackendFactory = exports.createRedisBackend;
/**
 * Overrides the process-wide default {@link BackendFactory}. Useful to point
 * every Queue/Worker/FlowProducer at a different datastore (e.g. the PostgreSQL
 * backend) without threading a factory through every constructor — notably so
 * the existing test suite can run unchanged against another backend.
 *
 * Pass no argument (or `undefined`) to reset back to the Redis backend.
 */
function setDefaultBackendFactory(factory) {
    defaultBackendFactory =
        factory !== null && factory !== void 0 ? factory : exports.createRedisBackend;
}
/**
 * Returns the current process-wide default {@link BackendFactory}, typed as the
 * caller's concrete backend `B`.
 */
function getDefaultBackendFactory() {
    return defaultBackendFactory;
}
