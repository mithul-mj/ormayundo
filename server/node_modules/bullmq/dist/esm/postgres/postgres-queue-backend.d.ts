import { EventEmitter } from 'events';
import { DependenciesOpts, IQueueBackend, JobJson, MinimalJob, MoveToDelayedOpts, MoveToWaitingChildrenOpts, ParentKeyOpts, QueueBaseOptions, RepeatableOptions, RetryJobOpts, RetryOptions, StreamReadRaw } from '../interfaces';
import { FinishedStatus, JobProgress, JobsOptions, JobState, JobType, KeepJobs } from '../types';
import { KeysMap } from '../classes/queue-keys';
import { PostgresConnection } from './postgres-connection';
/**
 * PostgreSQL implementation of {@link IQueueBackend}.
 *
 * Fulfils the same database-agnostic contract as {@link RedisQueueBackend}, but
 * backed by a PostgreSQL database: queue operations are expressed as SQL /
 * PL/pgSQL functions (created by the migrations), job state lives in a single
 * `job` table keyed by `(queue, id)` with a `state` column and partial
 * indexes, claiming uses `FOR UPDATE SKIP LOCKED`, and the blocking
 * "wait for job" primitive uses `LISTEN`/`NOTIFY`.
 *
 * The class owns its {@link PostgresConnection}; the high-level classes (Queue,
 * Worker, FlowProducer) depend only on {@link IQueueBackend} and never touch a
 * `pg` client directly.
 */
export declare class PostgresQueueBackend extends EventEmitter implements IQueueBackend {
    connection: PostgresConnection;
    protected readonly queueName: string;
    protected readonly opts: QueueBaseOptions;
    protected readonly ownsConnection: boolean;
    /**
     * When set, the name applied to this backend's dedicated connection (its
     * `application_name`) so getWorkers can discover it — the PostgreSQL
     * analogue of the Redis worker's named blocking connection. Only workers
     * pass it; QueueEvents name themselves via {@link setName}.
     */
    private readonly listenClientName?;
    closing: Promise<void> | undefined;
    /**
     * The PostgreSQL schema (namespace) this backend's queue lives in, taken from
     * the connection. All runtime SQL is qualified with it. BullMQ's per-queue
     * `prefix` is a Redis keyspace concern and is intentionally not part of the
     * SQL data model.
     */
    protected readonly schema: string;
    /** Whether the dedicated LISTEN client is subscribed to the jobs channel. */
    private listening;
    /** Whether the dedicated LISTEN client is subscribed to the events channel. */
    private listeningEvents;
    /**
     * Memoizes {@link PostgresQueueBackend.waitUntilReady} so every caller awaits
     * the same readiness — including the one-time connection naming it performs.
     */
    private readyPromise;
    /** Cancels the in-flight {@link waitForJob}, if any (used by close/interrupt). */
    private cancelWait;
    /**
     * Set by {@link disconnectBlocking} to interrupt the blocking wait. Unlike
     * {@link cancelWait} (which only fires the *current* wait), this flag also
     * short-circuits a {@link waitForJob} that starts during/after the disconnect
     * — closing the race where the worker re-enters `waitForJob` (still awaiting
     * `ensureListening`) just as `close()` interrupts it, leaving it blocked on a
     * timer that, under faked timers, never fires. Cleared by
     * {@link reconnectBlocking}. (The Redis backend gets this for free: tearing
     * down the blocking socket interrupts even a freshly-issued `BZPOPMIN`.)
     */
    private blockingDisconnected;
    /** Cancels the in-flight {@link readEvents} wait, if any. */
    private cancelEventWait;
    constructor(connection: PostgresConnection, queueName: string, opts: QueueBaseOptions, ownsConnection?: boolean, 
    /**
     * When set, the name applied to this backend's dedicated connection (its
     * `application_name`) so getWorkers can discover it — the PostgreSQL
     * analogue of the Redis worker's named blocking connection. Only workers
     * pass it; QueueEvents name themselves via {@link setName}.
     */
    listenClientName?: string);
    waitUntilReady(): Promise<void>;
    close(force?: boolean): Promise<void>;
    disconnect(): Promise<void>;
    setName(name: string): Promise<void>;
    /**
     * PostgreSQL `LISTEN`/`NOTIFY` has no minimum block granularity, so any
     * positive timeout is fine; we mirror the Redis backend's smallest unit.
     */
    get minimumBlockTimeout(): number;
    forQueue(queueName: string, _prefix?: string): IQueueBackend;
    /**
     * The queue's qualified name. With a schema-based namespace there is no
     * prefix, so the qualified name is simply the queue name.
     */
    get qualifiedName(): string;
    /**
     * Backends that don't address jobs by key return an empty map; PostgreSQL
     * addresses rows by `(queue, id)` columns instead.
     */
    get keys(): KeysMap;
    /**
     * Builds a namespaced identifier of the given `type` (`"<queue>:<type>"`),
     * used e.g. for flow dependency identifiers. No prefix is involved.
     */
    toKey(type: string): string;
    /**
     * Parses a PostgreSQL flow child key (`"<queue>:<id>"`) into its components.
     * There is no keyspace prefix, so `prefix` is always empty. Inverse of
     * {@link toKey}.
     */
    parseNodeKey(key: string): {
        prefix: string;
        queueName: string;
        id: string;
    };
    /**
     * Returns a backend identifier used by the generic API; PostgreSQL discovery
     * relies on {@link setName} setting `application_name` on the dedicated
     * LISTEN client.
     */
    clientName(suffix?: string): string;
    /**
     * Runs a query on the connection's pool, first awaiting the connection's
     * (memoized) readiness so the schema/functions exist. This mirrors how the
     * ioredis client buffers commands until connected, letting callers (e.g. a
     * Worker's autorun loop) issue operations before `waitUntilReady` resolves.
     */
    private query;
    /**
     * Loads a named `.sql` command file and runs it. The files contain no
     * schema/namespace references — the connection's `search_path` selects the
     * namespace — so they are portable verbatim to the other language ports.
     */
    private run;
    /**
     * The processing worker's name (when this backend belongs to a Worker), used
     * to stamp `processedBy` on the next job fetched during a finish op.
     */
    private get workerName();
    /**
     * Re-throws a finish-op error (SQLSTATE `BM001`, whose DETAIL carries the
     * numeric `ErrorCode`) as the shared canonical error; passes anything else
     * through unchanged.
     */
    private mapFinishError;
    addJob(job: JobJson, jobId: string, parentKeyOpts?: ParentKeyOpts): Promise<string>;
    addJobs(entries: {
        job: JobJson;
        jobId: string;
        parentKeyOpts?: ParentKeyOpts;
    }[]): Promise<string[]>;
    /** Builds one entry of the JSONB batch consumed by `add_flow`. */
    private toBatchEntry;
    addFlow(entries: {
        jobData: JobJson;
        jobId: string;
        parentKeyOpts: ParentKeyOpts;
        prefix: string;
        queueName: string;
    }[]): Promise<[Error | null, string | number][]>;
    addJobScheduler(jobSchedulerId: string, nextMillis: number, templateData: string, templateOpts: JobsOptions, opts: RepeatableOptions, delayedJobOpts: JobsOptions, producerId?: string): Promise<[string, number]>;
    moveToActive(token: string, name?: string): Promise<any[]>;
    /**
     * Shapes a job-claim result (from `move_to_active` or the fused finish+fetch)
     * into the worker's `[jobData, id, rateLimitDelay, delayUntil]` tuple. When no
     * job was claimed, a follow-up `next_signal` reports the rate-limit ttl or the
     * next delayed wake-up so the worker can block until then.
     */
    private buildNextJobResult;
    moveToCompleted<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, returnValue: R, removeOnComplete: boolean | number | KeepJobs, token: string, fetchNext: boolean): Promise<{
        result: void | any[];
        finishedOn: number;
    }>;
    moveToFailed<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, failedReason: string, removeOnFail: boolean | number | KeepJobs, token: string, fetchNext: boolean, fieldsToUpdate?: Record<string, any>): Promise<{
        result: void | any[];
        finishedOn: number;
    }>;
    moveToDelayed(jobId: string, timestamp: number, delay: number, token?: string, opts?: MoveToDelayedOpts): Promise<void | any[]>;
    moveToWaitingChildren(jobId: string, token: string, _opts?: MoveToWaitingChildrenOpts): Promise<boolean>;
    moveJobFromActiveToWait(jobId: string, token?: string): Promise<number>;
    retryJob(jobId: string, lifo: boolean, token?: string, opts?: RetryJobOpts): Promise<void>;
    retryFinishedJob<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, state: 'failed' | 'completed', opts?: RetryOptions): Promise<void>;
    promote(jobId: string): Promise<void>;
    moveStalledJobsToWait(): Promise<string[]>;
    retryFinishedJobs(state?: FinishedStatus, count?: number, timestamp?: number): Promise<number>;
    promoteJobs(count?: number): Promise<number>;
    pause(pause: boolean): Promise<void>;
    drain(delayed: boolean): Promise<void>;
    cleanJobsByState(state: string, timestamp: number, limit?: number): Promise<string[]>;
    obliterate(opts: {
        force: boolean;
        count: number;
    }): Promise<number>;
    /**
     * Removes orphaned job hashes (job data present but not referenced by any
     * state set). This is a Redis keyspace-maintenance concern: on PostgreSQL a
     * job is a single relational row inserted transactionally with its state, so
     * orphans cannot exist and there is nothing to remove. Always returns 0.
     */
    removeOrphanedJobs(_count?: number, _limit?: number): Promise<number>;
    extendLock(jobId: string, token: string, duration: number): Promise<number>;
    extendLocks(jobIds: string[], tokens: string[], duration: number): Promise<string[]>;
    updateData<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, data: T): Promise<void>;
    updateProgress(jobId: string, progress: JobProgress): Promise<void>;
    addLog(jobId: string, logRow: string, keepLogs?: number): Promise<number>;
    clearLogs(jobId: string, keepLogs?: number): Promise<void>;
    changeDelay(jobId: string, delay: number): Promise<void>;
    changePriority(jobId: string, priority?: number, lifo?: boolean): Promise<void>;
    remove(jobId: string, removeChildren: boolean): Promise<number>;
    removeUnprocessedChildren(jobId: string): Promise<void>;
    removeChildDependency(jobId: string, parentKey: string): Promise<boolean>;
    removeDeduplicationKey(deduplicationId: string, jobId: string): Promise<number>;
    deleteDeduplicationKey(deduplicationId: string): Promise<number>;
    updateJobSchedulerNextMillis(jobSchedulerId: string, nextMillis: number, templateData: string, delayedJobOpts: JobsOptions, producerId?: string): Promise<string | null>;
    removeJobScheduler(jobSchedulerId: string): Promise<number>;
    getJobScheduler(id: string): Promise<[any, string | null]>;
    isJobScheduler(id: string): Promise<boolean>;
    getJobSchedulerData(key: string): Promise<Record<string, string>>;
    getJobSchedulersRange(start: number, end: number, asc: boolean): Promise<string[]>;
    getJobSchedulersCount(): Promise<number>;
    getState(jobId: string): Promise<JobState | 'unknown'>;
    isFinished(jobId: string, returnValue?: boolean): Promise<number | [number, string]>;
    isMaxed(): Promise<boolean>;
    isJobInState(state: string, jobId: string): Promise<boolean>;
    getJobData(jobId: string): Promise<JobJson | undefined>;
    getDeduplicationJobId(deduplicationId: string): Promise<string | null>;
    getJobLogs(jobId: string, start: number, end: number, asc: boolean): Promise<{
        logs: string[];
        count: number;
    }>;
    getRateLimitTtl(maxJobs?: number): Promise<number>;
    getCounts(types: JobType[]): Promise<number[]>;
    getCountsPerPriority(priorities: number[]): Promise<number[]>;
    getRanges(types: JobType[], start?: number, end?: number, asc?: boolean): Promise<[string][]>;
    getDependencyCounts(jobId: string, types: string[]): Promise<number[]>;
    getDependencies(jobId: string, opts: DependenciesOpts): Promise<{
        nextFailedCursor?: number;
        failed?: string[];
        nextIgnoredCursor?: number;
        ignored?: Record<string, any>;
        nextProcessedCursor?: number;
        processed?: Record<string, any>;
        nextUnprocessedCursor?: number;
        unprocessed?: string[];
    }>;
    getProcessedChildrenValues(jobId: string): Promise<Record<string, string>>;
    getIgnoredChildrenFailures(jobId: string): Promise<Record<string, string>>;
    /**
     * Records one finished job into the per-minute metrics for the given `kind`,
     * when the worker was created with a `metrics.maxDataPoints`. Mirrors the
     * `collectMetrics` step of Redis's moveToFinished; kept as a separate query
     * (metrics are best-effort, so strict atomicity with the finish is not
     * required).
     */
    private collectMetrics;
    getMetrics(type: 'completed' | 'failed', start?: number, end?: number): Promise<[string[], string[], number]>;
    getClientList(): Promise<string[]>;
    paginate(key: string, opts: {
        start: number;
        end: number;
        fetchJobs?: boolean;
    }): Promise<{
        cursor: string;
        items: {
            id: string;
            v?: any;
            err?: string;
        }[];
        total: number;
        jobs?: JobJson[];
    }>;
    setQueueMeta(values: Record<string, string | number>): Promise<number>;
    getQueueMetaField(field: string): Promise<string | null>;
    getQueueMetaFields(fields: string[]): Promise<(string | null)[]>;
    getQueueMeta(): Promise<Record<string, string>>;
    removeQueueMetaFields(fields: string[]): Promise<number>;
    hasQueueMetaField(field: string): Promise<boolean>;
    setRateLimit(expireTimeMs: number): Promise<void>;
    removeRateLimitKey(): Promise<number>;
    removeDeprecatedPriorityKey(): Promise<number>;
    trimEvents(_maxLength: number): Promise<number>;
    publishEvent(fields: Record<string, string | number>, _maxEvents: number): Promise<string>;
    readEvents(id: string, blockTimeout: number): Promise<StreamReadRaw>;
    private fetchEvents;
    /** The shared notify channel all producers post to (see `add_job`). */
    private static readonly NOTIFY_CHANNEL;
    /** The shared event-stream channel (see `publish_event`). */
    private static readonly EVENTS_CHANNEL;
    /** Subscribes the dedicated client to the shared jobs channel (once). */
    private ensureListening;
    /** Subscribes the dedicated client to the shared events channel (once). */
    private ensureListeningEvents;
    /**
     * Blocks (up to `blockTimeout` ms) until a new event is published for this
     * queue (via `LISTEN`/`NOTIFY` on the events channel), or the timeout
     * elapses. Used by {@link readEvents} between polls.
     */
    private waitForEvent;
    /**
     * Blocks (up to `blockTimeout` seconds) until a job for this queue may be
     * available, via `LISTEN`/`NOTIFY`. Producers notify the shared `bullmq_jobs`
     * channel with the queue name as payload (in `add_job`), so a producer
     * in any process wakes a blocked worker immediately. Returns a marker
     * (`score` 0 = "check now") or `null` on timeout. The Redis backend
     * implements this with `BZPOPMIN`.
     */
    waitForJob(blockTimeout: number): Promise<{
        member: string;
        score: number;
    } | null>;
    disconnectBlocking(_wait?: boolean): Promise<void>;
    reconnectBlocking(): Promise<void>;
}
