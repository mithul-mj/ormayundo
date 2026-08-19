/**
 * Includes all the scripts needed by the queue and jobs.
 */
import { EventEmitter } from 'events';
import { DependenciesOpts, IQueueBackend, JobJson, MinimalJob, MoveToWaitingChildrenOpts, ParentKeyOpts, RedisClient, MoveToDelayedOpts, RepeatableOptions, RetryJobOpts, RetryOptions, ScriptQueueContext, StreamReadRaw } from '../interfaces';
import { JobsOptions, JobState, JobType, FinishedStatus, FinishedPropValAttribute, KeepJobs, JobProgress } from '../types';
import { IRedisTransaction } from '../interfaces';
import { QueueBaseOptions } from '../interfaces';
import { KeysMap } from './queue-keys';
import { RedisConnection } from './redis-connection';
export type JobData = [JobJson | number, string?];
export declare class RedisQueueBackend extends EventEmitter implements IQueueBackend {
    connection: RedisConnection;
    protected readonly name: string;
    blockingConnection?: RedisConnection;
    protected ownsConnection: boolean;
    protected version: string;
    moveToFinishedKeys: (string | undefined)[];
    /**
     * Resolves once a close has been initiated. Owned by the backend (it owns the
     * underlying connection(s)).
     */
    closing: Promise<void> | undefined;
    /**
     * Internal Redis access context (client, version, keys, …). Built from the
     * owned connection(s); kept private to this adapter.
     */
    protected queue: ScriptQueueContext;
    /**
     * The resolved key prefix (defaults to `bull`). A Redis-specific concept used
     * to namespace this queue's keys, qualified name and client name.
     */
    protected readonly redisPrefix: string;
    constructor(connection: RedisConnection, name: string, keys: KeysMap, toKey: (type: string) => string, opts: QueueBaseOptions, blockingConnection?: RedisConnection, ownsConnection?: boolean);
    /**
     * Returns a sibling backend bound to a different queue that shares this
     * backend's connection(s). Used by {@link FlowProducer} to operate on the
     * many queues that a flow may span over a single connection. The sibling
     * does not own the connection, so its `close`/`disconnect` are no-ops.
     */
    forQueue(queueName: string, prefix?: string): IQueueBackend;
    /**
     * The queue's fully-qualified name (`"<prefix>:<queue>"`). This is the
     * cross-backend logical identifier (e.g. used as a flow parent reference).
     */
    get qualifiedName(): string;
    /**
     * The concrete Redis keys for this queue (wait, active, events, …).
     */
    get keys(): KeysMap;
    /**
     * Builds a namespaced Redis sub-key of the given `type`
     * (`"<prefix>:<queue>:<type>"`).
     */
    toKey(type: string): string;
    /**
     * Parses a Redis flow child key (`"<prefix>:<queue>:<id>"`) into its
     * components. Inverse of {@link toKey}.
     */
    parseNodeKey(key: string): {
        prefix: string;
        queueName: string;
        id: string;
    };
    /**
     * Builds the Redis client name (`"<prefix>:<base64(queue)><suffix>"`), used
     * for `CLIENT SETNAME` and worker/queue discovery via `CLIENT LIST`.
     */
    clientName(suffix?: string): string;
    /**
     * Normalizes the events of the owned connection(s) into the backend's own
     * `'ready' | 'error' | 'close'` events.
     */
    private forwardConnectionEvents;
    /**
     * Resolves once the backend's underlying connection(s) are ready.
     */
    waitUntilReady(): Promise<void>;
    /**
     * Closes the backend and its underlying connection(s).
     *
     * The dedicated blocking connection (if any) is closed first so that an
     * in-flight blocking command (e.g. `bzpopmin`) is interrupted before the
     * main connection is closed.
     */
    close(force?: boolean): Promise<void>;
    /**
     * Forcibly disconnects the backend's underlying connection(s).
     */
    disconnect(): Promise<void>;
    /**
     * Sets a human-readable name on the underlying connection (CLIENT SETNAME).
     * Unsupported-command and shutdown errors are swallowed.
     */
    setName(name: string): Promise<void>;
    /**
     * The raw Redis client. Redis-specific escape hatch (used e.g. by
     * `Queue.client`); not part of {@link IQueueBackend}.
     */
    get client(): Promise<RedisClient>;
    /**
     * The raw blocking Redis client (a dedicated connection used for the
     * blocking `waitForJob` primitive), if this backend was created with one.
     * Redis-specific escape hatch; not part of {@link IQueueBackend}.
     */
    get blockingClient(): Promise<RedisClient> | undefined;
    /**
     * The detected Redis server version. Redis-specific escape hatch; not part
     * of {@link IQueueBackend}.
     */
    get redisVersion(): string;
    /**
     * The detected datastore flavour (`redis`, `dragonfly`, `valkey`, …).
     * Redis-specific escape hatch; not part of {@link IQueueBackend}.
     */
    get databaseType(): string;
    /**
     * Smallest meaningful block timeout (seconds) given the blocking
     * connection's capabilities.
     */
    get minimumBlockTimeout(): number;
    /**
     * Interrupts the in-flight blocking wait by disconnecting the dedicated
     * blocking connection. No-op if there is none.
     */
    disconnectBlocking(wait?: boolean): Promise<void>;
    /**
     * Re-establishes the dedicated blocking connection after an interrupt.
     */
    reconnectBlocking(): Promise<void>;
    /**
     * Executes a registered Lua script on the given Redis client, resolving the
     * versioned command name (e.g. `addJob:<packageVersion>`) so the script
     * belonging to the current BullMQ version is invoked.
     *
     * @param client - The Redis client or pipeline/transaction on which to run the command.
     * @param commandName - The base name of the Lua script (without version suffix).
     * @param args - Positional arguments forwarded to the Lua script (keys followed by argv).
     * @returns The raw result produced by the Lua script.
     *
     * @private
     */
    execCommand(client: RedisClient | IRedisTransaction, commandName: string, args: any[]): any;
    /**
     * Checks whether a job with the given id is present in the provided queue
     * state.
     */
    isJobInState(state: string, jobId: string): Promise<boolean>;
    protected addDelayedJobArgs(job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keysMap?: KeysMap): (string | Buffer)[];
    protected addDelayedJob(client: RedisClient | IRedisTransaction, job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keys?: KeysMap): Promise<string | number>;
    protected addPrioritizedJobArgs(job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keysMap?: KeysMap): (string | Buffer)[];
    protected addPrioritizedJob(client: RedisClient | IRedisTransaction, job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keys?: KeysMap): Promise<string | number>;
    protected addParentJobArgs(job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keysMap?: KeysMap): (string | Buffer)[];
    protected addParentJob(client: RedisClient | IRedisTransaction, job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keys?: KeysMap): Promise<string | number>;
    protected addStandardJobArgs(job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keysMap?: KeysMap): (string | Buffer)[];
    protected addStandardJob(client: RedisClient | IRedisTransaction, job: JobJson, encodedOpts: any, args: (string | number | Record<string, any>)[], keys?: KeysMap): Promise<string | number>;
    /**
     * Low-level Redis adapter helper: queues/executes a single job insert on the
     * provided client or transaction (pipeline/multi). This is the only place
     * that needs a connection handle; the public {@link addJob} / {@link addJobs}
     * operations obtain it from the backend itself.
     *
     * Kept public (but outside {@link IQueueBackend}) so that flow producers can
     * batch inserts across queues onto a shared transaction.
     */
    addJobToTransaction(client: RedisClient | IRedisTransaction, job: JobJson, jobId: string, parentKeyOpts?: ParentKeyOpts, keys?: KeysMap): Promise<string>;
    addJob(job: JobJson, jobId: string, parentKeyOpts?: ParentKeyOpts): Promise<string>;
    addJobs(entries: {
        job: JobJson;
        jobId: string;
        parentKeyOpts?: ParentKeyOpts;
    }[]): Promise<string[]>;
    /**
     * Atomically inserts a whole flow (tree) of jobs that may span multiple
     * queues, returning one `[error, idOrCode]` tuple per entry in the same
     * order they were provided. For the Redis adapter this is a single `MULTI`
     * transaction; another backend would use a single SQL transaction.
     *
     * Each entry is self-describing (it carries its own queue `prefix` and
     * `queueName`), so the operation does not need to be bound to a single
     * queue's key map.
     */
    addFlow(entries: {
        jobData: JobJson;
        jobId: string;
        parentKeyOpts: ParentKeyOpts;
        prefix: string;
        queueName: string;
    }[]): Promise<[Error | null, string | number][]>;
    protected pauseArgs(pause: boolean, emitEvent?: boolean): (string | number)[];
    pause(pause: boolean): Promise<void>;
    /**
     * Removes a deduplication key from Redis so that a new job with the same
     * deduplication id can be enqueued again. The key is only removed if it
     * currently maps to the provided `jobId`, preventing races between
     * producers and finishing jobs.
     *
     * @param deduplicationId - The deduplication id whose key should be cleared.
     * @param jobId - The id of the job that currently owns the dedup key.
     * @returns `1` if the key was removed, `0` otherwise.
     *
     * @private
     */
    removeDeduplicationKey(deduplicationId: string, jobId: string): Promise<number>;
    /**
     * Registers a job scheduler and enqueues its next delayed iteration.
     * The scheduler stores the template data/options so subsequent iterations
     * can be produced automatically based on the repeat options.
     *
     * @param jobSchedulerId - The id that uniquely identifies this scheduler.
     * @param nextMillis - Timestamp (ms since epoch) for the next iteration.
     * @param templateData - Serialized template data reused for every iteration.
     * @param templateOpts - Redis-encoded job options applied to every iteration.
     * @param opts - Repeat options describing the scheduling pattern.
     * @param delayedJobOpts - Options applied to the next delayed job that is produced.
     * @param producerId - Optional id of the job that produced this iteration, used to prevent duplicates.
     * @returns A tuple of `[jobId, delay]`, where `delay` is the computed delay in milliseconds
     * for the next iteration. When `delay` is `0`, the job is enqueued immediately.
     * @throws An error resolved from `finishedErrors` when the Lua script returns a negative status code.
     *
     * @private
     */
    addJobScheduler(jobSchedulerId: string, nextMillis: number, templateData: string, templateOpts: JobsOptions, opts: RepeatableOptions, delayedJobOpts: JobsOptions, producerId?: string): Promise<[string, number]>;
    updateJobSchedulerNextMillis(jobSchedulerId: string, nextMillis: number, templateData: string, delayedJobOpts: JobsOptions, producerId?: string): Promise<string | null>;
    removeJobScheduler(jobSchedulerId: string): Promise<number>;
    protected removeArgs(jobId: string, removeChildren: boolean): (string | number)[];
    remove(jobId: string, removeChildren: boolean): Promise<number>;
    removeUnprocessedChildren(jobId: string): Promise<void>;
    extendLock(jobId: string, token: string, duration: number, client?: RedisClient | IRedisTransaction): Promise<number>;
    extendLocks(jobIds: string[], tokens: string[], duration: number): Promise<string[]>;
    updateData<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, data: T): Promise<void>;
    updateProgress(jobId: string, progress: JobProgress): Promise<void>;
    addLog(jobId: string, logRow: string, keepLogs?: number): Promise<number>;
    protected moveToFinishedArgs<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, val: any, propVal: FinishedPropValAttribute, shouldRemove: undefined | boolean | number | KeepJobs, target: FinishedStatus, token: string, timestamp: number, fetchNext?: boolean, fieldsToUpdate?: Record<string, any>): (string | number | boolean | Buffer)[];
    protected getKeepJobs(shouldRemove: undefined | boolean | number | KeepJobs, workerKeepJobs: undefined | KeepJobs): KeepJobs;
    moveToFinished(jobId: string, args: (string | number | boolean | Buffer)[]): Promise<any[]>;
    private drainArgs;
    drain(delayed: boolean): Promise<void>;
    private removeChildDependencyArgs;
    removeChildDependency(jobId: string, parentKey: string): Promise<boolean>;
    private getRangesArgs;
    getRanges(types: JobType[], start?: number, end?: number, asc?: boolean): Promise<[string][]>;
    private getJobsArgs;
    /**
     * Fetches job ids and their job hashes for the provided states in a single
     * script, skipping ids whose job hash is missing (for example the deprecated
     * wait list marker or jobs removed after their id was read). Each returned
     * entry is a `[jobId, jobHashFields]` tuple grouped per requested type.
     */
    getJobs(types: JobType[], start?: number, end?: number, asc?: boolean): Promise<[string, string[]][][]>;
    private getCountsArgs;
    getCounts(types: JobType[]): Promise<number[]>;
    protected getCountsPerPriorityArgs(priorities: number[]): (string | number)[];
    getCountsPerPriority(priorities: number[]): Promise<number[]>;
    protected getDependencyCountsArgs(jobId: string, types: string[]): (string | number)[];
    getDependencyCounts(jobId: string, types: string[]): Promise<number[]>;
    moveToCompletedArgs<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, returnvalue: R, removeOnComplete: boolean | number | KeepJobs, token: string, fetchNext?: boolean): (string | number | boolean | Buffer)[];
    moveToFailedArgs<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, failedReason: string, removeOnFailed: boolean | number | KeepJobs, token: string, fetchNext?: boolean, fieldsToUpdate?: Record<string, any>): (string | number | boolean | Buffer)[];
    isFinished(jobId: string, returnValue?: boolean): Promise<number | [number, string]>;
    getState(jobId: string): Promise<JobState | 'unknown'>;
    /**
     * Change delay of a delayed job.
     *
     * Reschedules a delayed job by setting a new delay from the current time.
     * For example, calling changeDelay(5000) will reschedule the job to execute
     * 5000 milliseconds (5 seconds) from now, regardless of the original delay.
     *
     * @param jobId - the ID of the job to change the delay for.
     * @param delay - milliseconds from now when the job should be processed.
     * @returns delay in milliseconds.
     * @throws JobNotExist
     * This exception is thrown if jobId is missing.
     * @throws JobNotInState
     * This exception is thrown if job is not in delayed state.
     */
    changeDelay(jobId: string, delay: number): Promise<void>;
    private changeDelayArgs;
    changePriority(jobId: string, priority?: number, lifo?: boolean): Promise<void>;
    protected changePriorityArgs(jobId: string, priority?: number, lifo?: boolean): (string | number)[];
    moveToDelayedArgs(jobId: string, timestamp: number, token: string, delay: number, opts?: MoveToDelayedOpts): (string | number | Buffer)[];
    moveToWaitingChildrenArgs(jobId: string, token: string, opts?: MoveToWaitingChildrenOpts): (string | number)[];
    isMaxedArgs(): string[];
    isMaxed(): Promise<boolean>;
    moveToDelayed(jobId: string, timestamp: number, delay: number, token?: string, opts?: MoveToDelayedOpts): Promise<void | any[]>;
    /**
     * Move parent job to waiting-children state.
     *
     * @returns true if job is successfully moved, false if there are pending dependencies.
     * @throws JobNotExist
     * This exception is thrown if jobId is missing.
     * @throws JobLockNotExist
     * This exception is thrown if job lock is missing.
     * @throws JobNotInState
     * This exception is thrown if job is not in active state.
     */
    moveToWaitingChildren(jobId: string, token: string, opts?: MoveToWaitingChildrenOpts): Promise<boolean>;
    getRateLimitTtlArgs(maxJobs?: number): (string | number)[];
    getRateLimitTtl(maxJobs?: number): Promise<number>;
    /**
     * Remove jobs in a specific state.
     *
     * @returns Id jobs from the deleted records.
     */
    cleanJobsByState(state: string, timestamp: number, limit?: number): Promise<string[]>;
    getJobSchedulerArgs(id: string): string[];
    getJobScheduler(id: string): Promise<[any, string | null]>;
    isJobScheduler(id: string): Promise<boolean>;
    getJobSchedulerData(key: string): Promise<Record<string, string>>;
    getJobSchedulersRange(start: number, end: number, asc: boolean): Promise<string[]>;
    getJobSchedulersCount(): Promise<number>;
    retryJobArgs(jobId: string, lifo: boolean, token: string, opts?: MoveToDelayedOpts): (string | number | Buffer)[];
    retryJob(jobId: string, lifo: boolean, token?: string, opts?: RetryJobOpts): Promise<void>;
    protected moveJobsToWaitArgs(state: FinishedStatus | 'delayed', count: number, timestamp: number): (string | number)[];
    retryFinishedJobs(state?: FinishedStatus, count?: number, timestamp?: number): Promise<number>;
    promoteJobs(count?: number): Promise<number>;
    /**
     * Attempts to reprocess a job
     *
     * @param job - The job to reprocess
     * @param state - The expected job state. If the job is not found
     * on the provided state, then it's not reprocessed. Supported states: 'failed', 'completed'
     *
     * @returns A promise that resolves when the job has been successfully moved to the wait queue.
     * @throws Will throw an error with a code property indicating the failure reason:
     *   - code 0: Job does not exist
     *   - code -1: Job is currently locked and can't be retried
     *   - code -2: Job was not found in the expected set
     */
    retryFinishedJob<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, state: 'failed' | 'completed', opts?: RetryOptions): Promise<void>;
    getMetrics(type: 'completed' | 'failed', start?: number, end?: number): Promise<[string[], string[], number]>;
    getClientList(): Promise<string[]>;
    moveToActive(token: string, name?: string): Promise<any[]>;
    promote(jobId: string): Promise<void>;
    protected moveStalledJobsToWaitArgs(): (string | number)[];
    /**
     * Looks for unlocked jobs in the active queue.
     *
     * The job was being worked on, but the worker process died and it failed to renew the lock.
     * We call these jobs 'stalled'. This is the most common case. We resolve these by moving them
     * back to wait to be re-processed. To prevent jobs from cycling endlessly between active and wait,
     * (e.g. if the job handler keeps crashing),
     * we limit the number stalled job recoveries to settings.maxStalledCount.
     */
    moveStalledJobsToWait(): Promise<string[]>;
    /**
     * Moves a job back from Active to Wait.
     * This script is used when a job has been manually rate limited and needs
     * to be moved back to wait from active status.
     *
     * @param client - Redis client
     * @param jobId - Job id
     * @returns
     */
    moveJobFromActiveToWait(jobId: string, token?: string): Promise<any>;
    obliterate(opts: {
        force: boolean;
        count: number;
    }): Promise<number>;
    /**
     * Paginate a set or hash keys.
     * @param opts - options to define the pagination behaviour
     *
     */
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
    finishedErrors({ code, jobId, parentKey, command, state, }: {
        code: number;
        jobId?: string;
        parentKey?: string;
        command: string;
        state?: string;
    }): Error;
    /**
     * Low-level Redis adapter helper: atomically check-and-delete a single batch
     * of candidate orphaned jobs. Driven by {@link removeOrphanedJobs}.
     */
    protected removeOrphanedJobsBatch(candidateJobIds: string[], stateKeySuffixes: string[], jobSubKeySuffixes: string[]): Promise<number>;
    removeOrphanedJobs(count?: number, limit?: number): Promise<number>;
    moveToCompleted<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, returnValue: R, removeOnComplete: boolean | number | KeepJobs, token: string, fetchNext: boolean): Promise<{
        result: void | any[];
        finishedOn: number;
    }>;
    moveToFailed<T = any, R = any, N extends string = string>(job: MinimalJob<T, R, N>, failedReason: string, removeOnFail: boolean | number | KeepJobs, token: string, fetchNext: boolean, fieldsToUpdate?: Record<string, any>): Promise<{
        result: void | any[];
        finishedOn: number;
    }>;
    getJobData(jobId: string): Promise<JobJson | undefined>;
    getDeduplicationJobId(deduplicationId: string): Promise<string | null>;
    getJobLogs(jobId: string, start: number, end: number, asc: boolean): Promise<{
        logs: string[];
        count: number;
    }>;
    clearLogs(jobId: string, keepLogs?: number): Promise<void>;
    getProcessedChildrenValues(jobId: string): Promise<Record<string, string>>;
    getIgnoredChildrenFailures(jobId: string): Promise<Record<string, string>>;
    getDependencies(jobId: string, opts?: DependenciesOpts): Promise<{
        nextFailedCursor?: number;
        failed?: string[];
        nextIgnoredCursor?: number;
        ignored?: Record<string, any>;
        nextProcessedCursor?: number;
        processed?: Record<string, any>;
        nextUnprocessedCursor?: number;
        unprocessed?: string[];
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
    deleteDeduplicationKey(deduplicationId: string): Promise<number>;
    trimEvents(maxLength: number): Promise<number>;
    waitForJob(blockTimeout: number): Promise<{
        member: string;
        score: number;
    } | null>;
    publishEvent(fields: Record<string, string | number>, maxEvents: number): Promise<string>;
    readEvents(id: string, blockTimeout: number): Promise<StreamReadRaw>;
}
export declare function raw2NextJobData(raw: any[]): any[];
