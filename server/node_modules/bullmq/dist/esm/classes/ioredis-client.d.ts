import { IRedisClient } from '../interfaces/redis-client';
/**
 * Wraps an ioredis `Redis` / `Cluster` instance with a `Proxy` so it conforms
 * to {@link IRedisClient}.
 *
 * For backwards compatibility BullMQ continues to accept a raw `IORedis`
 * instance through tehe `connection` option, even though internally it relies
 * on the `IRedisClient` adapter interface. The returned proxy:
 *
 *   - exposes `runCommand` (Lua script dispatch by name)
 *   - exposes structured-options variants of `hset`, `set`, `zrange`,
 *     `zrevrange`, `xadd`, `xread`, `xtrim`, `scan` (backward-compatible:
 *     they still accept native ioredis varargs if called that way)
 *   - returns augmented {@link IRedisTransaction}s from `pipeline()` / `multi()`
 *   - wraps the result of `duplicate()` in a new proxy
 *
 * The underlying ioredis instance is **not** mutated. Properties and methods
 * not in the override table are forwarded to the raw client via the proxy
 * traps, with `this === target` so EventEmitter / Commander internals work
 * normally.
 */
export declare function createIORedisClient<TClient extends {
    isCluster?: boolean;
    options?: any;
    pipeline(...args: any[]): {
        hset(...args: any[]): any;
        hscan(...args: any[]): any;
        sscan(...args: any[]): any;
        [key: string]: any;
    };
    multi(...args: any[]): {
        hset(...args: any[]): any;
        hscan(...args: any[]): any;
        sscan(...args: any[]): any;
        [key: string]: any;
    };
    duplicate(...args: any[]): any;
    [key: string]: any;
}>(client: TClient): TClient & IRedisClient;
/**
 * Check if an object already implements {@link IRedisClient}.
 */
export declare function isIRedisClient(obj: any): obj is IRedisClient;
