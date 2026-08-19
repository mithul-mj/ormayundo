import { BackendFactory, IQueueBackend } from '../interfaces';
import { RedisQueueBackend } from '../classes/redis-queue-backend';
/**
 * The default ({@link RedisConnection}-based) implementation of
 * {@link BackendFactory}. The returned backend owns its connection(s); the
 * high-level classes (Queue, Worker, FlowProducer, …) depend only on
 * {@link IQueueBackend} and never touch a Redis client directly.
 *
 * Other datastores can provide their own {@link BackendFactory} and inject it
 * into the queue classes.
 */
export declare const createRedisBackend: BackendFactory<RedisQueueBackend>;
/**
 * Overrides the process-wide default {@link BackendFactory}. Useful to point
 * every Queue/Worker/FlowProducer at a different datastore (e.g. the PostgreSQL
 * backend) without threading a factory through every constructor — notably so
 * the existing test suite can run unchanged against another backend.
 *
 * Pass no argument (or `undefined`) to reset back to the Redis backend.
 */
export declare function setDefaultBackendFactory(factory?: BackendFactory<IQueueBackend>): void;
/**
 * Returns the current process-wide default {@link BackendFactory}, typed as the
 * caller's concrete backend `B`.
 */
export declare function getDefaultBackendFactory<B extends IQueueBackend = IQueueBackend>(): BackendFactory<B>;
