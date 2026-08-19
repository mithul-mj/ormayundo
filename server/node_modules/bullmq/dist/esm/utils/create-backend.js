import { RedisQueueBackend } from '../classes/redis-queue-backend';
import { RedisConnection } from '../classes/redis-connection';
import { QueueKeys } from '../classes/queue-keys';
import { createIORedisClient, isIRedisClient } from '../classes/ioredis-client';
import { isRedisInstance } from './index';
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
    return new RedisConnection(isRedisInstance(opts.connection)
        ? (isIRedisClient(opts.connection)
            ? opts.connection
            : createIORedisClient(opts.connection)).duplicate({ connectionName })
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
export const createRedisBackend = (name, opts, { blocking = false, withBlockingConnection = false } = {}) => {
    const connection = new RedisConnection(opts.connection, {
        shared: isRedisInstance(opts.connection),
        blocking,
        skipVersionCheck: opts.skipVersionCheck,
        skipWaitingForReady: opts.skipWaitingForReady,
    });
    const blockingConnection = withBlockingConnection
        ? createBlockingConnection(name, opts)
        : undefined;
    const queueKeys = new QueueKeys(opts.prefix);
    const keys = queueKeys.getKeys(name);
    const toKey = (type) => queueKeys.toKey(name, type);
    return new RedisQueueBackend(connection, name, keys, toKey, opts, blockingConnection);
};
/**
 * The process-wide default {@link BackendFactory} used by the high-level
 * classes ({@link QueueBase}, {@link FlowProducer}) when the caller does not
 * pass an explicit `backendFactory`. Initialised to the Redis backend so the
 * default behaviour is unchanged.
 */
let defaultBackendFactory = createRedisBackend;
/**
 * Overrides the process-wide default {@link BackendFactory}. Useful to point
 * every Queue/Worker/FlowProducer at a different datastore (e.g. the PostgreSQL
 * backend) without threading a factory through every constructor — notably so
 * the existing test suite can run unchanged against another backend.
 *
 * Pass no argument (or `undefined`) to reset back to the Redis backend.
 */
export function setDefaultBackendFactory(factory) {
    defaultBackendFactory =
        factory !== null && factory !== void 0 ? factory : createRedisBackend;
}
/**
 * Returns the current process-wide default {@link BackendFactory}, typed as the
 * caller's concrete backend `B`.
 */
export function getDefaultBackendFactory() {
    return defaultBackendFactory;
}
