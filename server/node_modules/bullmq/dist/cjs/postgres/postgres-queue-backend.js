"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresQueueBackend = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const finished_errors_1 = require("../classes/finished-errors");
const sql_loader_1 = require("./sql-loader");
/** Parses a nullable `bigint`-as-string column into a number, or `undefined`. */
function bigintOrUndefined(value) {
    return value === null || value === undefined ? undefined : Number(value);
}
/** Max events fetched per readEvents round-trip. */
const EVENT_READ_BATCH = 100;
/** Strips `undefined` properties so the JSON shape matches the Redis backend. */
function removeUndefined(obj) {
    for (const key of Object.keys(obj)) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }
    return obj;
}
/**
 * Normalizes a `removeOnComplete`/`removeOnFail` option into the retention
 * params the move_to_completed/failed functions take:
 * - `true` → remove the job immediately
 * - `false`/`undefined` → keep forever
 * - number → keep at most that many (most recent)
 * - `{ age, count }` → keep within age (seconds) and/or count
 */
function normalizeKeep(opt) {
    var _a, _b;
    if (opt === true) {
        return { removeAll: true, keepAge: null, keepCount: null };
    }
    if (opt === false || opt === undefined || opt === null) {
        return { removeAll: false, keepAge: null, keepCount: null };
    }
    if (typeof opt === 'number') {
        return { removeAll: false, keepAge: null, keepCount: opt };
    }
    const keep = opt;
    return {
        removeAll: false,
        keepAge: (_a = keep.age) !== null && _a !== void 0 ? _a : null,
        keepCount: (_b = keep.count) !== null && _b !== void 0 ? _b : null,
    };
}
/**
 * Maps a `job` row to the public {@link JobJson} shape consumed by
 * `Job.fromJSON`. JSON-string fields (`data`, `returnvalue`, `stacktrace`) are
 * re-stringified; `opts` is returned as the stored object.
 */
function rowToJobJson(row) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    return removeUndefined({
        id: row.id,
        name: row.name,
        data: JSON.stringify((_a = row.data) !== null && _a !== void 0 ? _a : {}),
        opts: (_b = row.opts) !== null && _b !== void 0 ? _b : {},
        progress: (_c = row.progress) !== null && _c !== void 0 ? _c : 0,
        attemptsMade: (_d = row.attempts_made) !== null && _d !== void 0 ? _d : 0,
        attemptsStarted: (_e = row.attempts_started) !== null && _e !== void 0 ? _e : 0,
        finishedOn: bigintOrUndefined(row.finished_at_ms),
        processedOn: bigintOrUndefined(row.processed_at_ms),
        timestamp: Number(row.added_at_ms),
        delay: bigintOrUndefined(row.delay_ms),
        priority: (_f = row.priority) !== null && _f !== void 0 ? _f : undefined,
        failedReason: (_g = row.failed_reason) !== null && _g !== void 0 ? _g : undefined,
        stacktrace: JSON.stringify((_h = row.stacktrace) !== null && _h !== void 0 ? _h : []),
        returnvalue: JSON.stringify((_j = row.return_value) !== null && _j !== void 0 ? _j : null),
        parent: row.parent_id != null
            ? { id: row.parent_id, queueKey: (_k = row.parent_queue) !== null && _k !== void 0 ? _k : '' }
            : undefined,
        parentKey: (_l = row.parent_key) !== null && _l !== void 0 ? _l : undefined,
        repeatJobKey: (_m = row.scheduler_id) !== null && _m !== void 0 ? _m : undefined,
        deduplicationId: (_o = row.dedup_id) !== null && _o !== void 0 ? _o : undefined,
        deferredFailure: (_p = row.deferred_failure) !== null && _p !== void 0 ? _p : undefined,
        processedBy: (_q = row.processed_by) !== null && _q !== void 0 ? _q : undefined,
        stalledCounter: (_r = row.stalled_count) !== null && _r !== void 0 ? _r : 0,
    });
}
/**
 * Marks an {@link IQueueBackend} operation that the PostgreSQL backend does not
 * implement yet. The full operation set is being filled in incrementally
 * (vertical slice by vertical slice), so calling an unfinished operation fails
 * loudly rather than silently misbehaving.
 */
function notImplemented(op) {
    throw new Error(`PostgresQueueBackend: operation '${op}' is not implemented yet.`);
}
/**
 * Maps a scheduler row to the Redis-compatible metadata hash (string values,
 * absent fields omitted) plus the next-run score, matching the shape the
 * shared `JobScheduler` consumer expects.
 */
function mapSchedulerRow(row) {
    const hash = {};
    if (row.name != null) {
        hash.name = String(row.name);
    }
    if (row.iteration_count != null) {
        hash.ic = String(row.iteration_count);
    }
    if (row.limit_count != null) {
        hash.limit = String(row.limit_count);
    }
    if (row.start_date_ms != null) {
        hash.startDate = String(row.start_date_ms);
    }
    if (row.end_date_ms != null) {
        hash.endDate = String(row.end_date_ms);
    }
    if (row.tz != null) {
        hash.tz = String(row.tz);
    }
    if (row.pattern != null) {
        hash.pattern = String(row.pattern);
    }
    if (row.every_ms != null) {
        hash.every = String(row.every_ms);
    }
    if (row.offset_ms != null) {
        hash.offset = String(row.offset_ms);
    }
    if (row.template_data != null) {
        const data = JSON.stringify(row.template_data);
        if (data !== '{}') {
            hash.data = data;
        }
    }
    if (row.template_opts != null) {
        const opts = JSON.stringify(row.template_opts);
        if (opts !== '{}') {
            hash.opts = opts;
        }
    }
    return {
        hash,
        next: row.next_run_ms == null ? null : String(row.next_run_ms),
    };
}
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
class PostgresQueueBackend extends events_1.EventEmitter {
    constructor(connection, queueName, opts, ownsConnection = true, 
    /**
     * When set, the name applied to this backend's dedicated connection (its
     * `application_name`) so getWorkers can discover it — the PostgreSQL
     * analogue of the Redis worker's named blocking connection. Only workers
     * pass it; QueueEvents name themselves via {@link setName}.
     */
    listenClientName) {
        super();
        this.connection = connection;
        this.queueName = queueName;
        this.opts = opts;
        this.ownsConnection = ownsConnection;
        this.listenClientName = listenClientName;
        /** Whether the dedicated LISTEN client is subscribed to the jobs channel. */
        this.listening = false;
        /** Whether the dedicated LISTEN client is subscribed to the events channel. */
        this.listeningEvents = false;
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
        this.blockingDisconnected = false;
        this.schema = connection.schema;
        if (this.ownsConnection) {
            this.connection.on('error', err => this.emit('error', err));
            this.connection.on('ready', () => this.emit('ready'));
            this.connection.on('close', () => this.emit('close'));
        }
    }
    // ============================================================
    // Connection lifecycle
    // ============================================================
    async waitUntilReady() {
        // Memoized so every caller (the Worker's constructor 'ready' hook AND an
        // explicit waitUntilReady()) awaits the SAME readiness — including the
        // connection naming below. Without this a second caller could observe the
        // naming as "already started" and return before the first caller's setName
        // had actually completed, racing discovery (getWorkers/getQueueEvents).
        if (!this.readyPromise) {
            this.readyPromise = (async () => {
                await this.connection.waitUntilReady();
                // Name this backend's dedicated connection so it is discoverable via
                // getClientList (and thus getWorkers) — even an `autorun: false`
                // worker that never fetches is listed, matching the Redis backend
                // which names its blocking connection on creation. Best-effort: a
                // naming failure must never block readiness.
                if (this.listenClientName) {
                    try {
                        await this.setName(this.listenClientName);
                    }
                    catch (_a) {
                        // Discovery is best-effort; leave the connection unnamed.
                    }
                }
            })();
        }
        return this.readyPromise;
    }
    async close(force = false) {
        void force;
        if (!this.ownsConnection) {
            return;
        }
        if (!this.closing) {
            this.closing = this.connection.close();
        }
        return this.closing;
    }
    async disconnect() {
        var _a, _b;
        // Interrupt any in-flight blocking wait so a blocked readEvents/waitForJob
        // returns and the caller (e.g. QueueEvents.close) can proceed.
        (_a = this.cancelWait) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.cancelEventWait) === null || _b === void 0 ? void 0 : _b.call(this);
        if (!this.ownsConnection) {
            return;
        }
        await this.connection.disconnect();
    }
    async setName(name) {
        // Name the dedicated LISTEN connection via `application_name` — the
        // PostgreSQL analogue of Redis `CLIENT SETNAME`. This is the long-lived
        // connection a worker / QueueEvents holds, so it appears (under this name)
        // in pg_stat_activity and is therefore discoverable by getWorkers /
        // getQueueEvents via getClientList.
        await this.connection.waitUntilReady();
        const client = await this.connection.getListenClient();
        await client.query(`SELECT set_config('application_name', $1, false)`, [
            name,
        ]);
    }
    /**
     * PostgreSQL `LISTEN`/`NOTIFY` has no minimum block granularity, so any
     * positive timeout is fine; we mirror the Redis backend's smallest unit.
     */
    get minimumBlockTimeout() {
        return 0.001;
    }
    forQueue(queueName, _prefix) {
        // The namespace is the connection's schema, shared by all queues, so a
        // sibling backend only needs a different queue name. BullMQ's per-queue
        // `prefix` (a Redis keyspace concern) is ignored here.
        return new PostgresQueueBackend(this.connection, queueName, this.opts, false);
    }
    /**
     * The queue's qualified name. With a schema-based namespace there is no
     * prefix, so the qualified name is simply the queue name.
     */
    get qualifiedName() {
        return this.queueName;
    }
    /**
     * Backends that don't address jobs by key return an empty map; PostgreSQL
     * addresses rows by `(queue, id)` columns instead.
     */
    get keys() {
        return {};
    }
    /**
     * Builds a namespaced identifier of the given `type` (`"<queue>:<type>"`),
     * used e.g. for flow dependency identifiers. No prefix is involved.
     */
    toKey(type) {
        return `${this.queueName}:${type}`;
    }
    /**
     * Parses a PostgreSQL flow child key (`"<queue>:<id>"`) into its components.
     * There is no keyspace prefix, so `prefix` is always empty. Inverse of
     * {@link toKey}.
     */
    parseNodeKey(key) {
        const idx = key.lastIndexOf(':');
        return {
            prefix: '',
            queueName: key.slice(0, idx),
            id: key.slice(idx + 1),
        };
    }
    /**
     * Returns a backend identifier used by the generic API; PostgreSQL discovery
     * relies on {@link setName} setting `application_name` on the dedicated
     * LISTEN client.
     */
    clientName(suffix = '') {
        return `${this.queueName}${suffix}`;
    }
    // ============================================================
    // SQL helpers
    // ============================================================
    /**
     * Runs a query on the connection's pool, first awaiting the connection's
     * (memoized) readiness so the schema/functions exist. This mirrors how the
     * ioredis client buffers commands until connected, letting callers (e.g. a
     * Worker's autorun loop) issue operations before `waitUntilReady` resolves.
     */
    async query(text, params) {
        await this.connection.waitUntilReady();
        // The owning connection may be shutting down (or already have ended its
        // pool). Issuing the query then throws a raw "Cannot use a pool after
        // calling end on the pool", which — for a fire-and-forget operation raced
        // in during teardown (e.g. an event handler still scheduling work after
        // close) — surfaces as an unhandled rejection. Mirror ioredis, whose
        // offline queue simply never settles a command issued against a closing
        // connection: return a promise that never resolves so such stragglers
        // neither crash nor pollute the run. This only triggers once close() has
        // begun, so no legitimate in-flight operation is affected.
        if (this.connection.isClosing) {
            return new Promise(() => undefined);
        }
        try {
            return await this.connection.pool.query(text, params);
        }
        catch (err) {
            // Close the race where the pool is ended between the check above and the
            // query dispatch.
            if (this.connection.isClosing &&
                err instanceof Error &&
                err.message.includes('after calling end on the pool')) {
                return new Promise(() => undefined);
            }
            throw err;
        }
    }
    /**
     * Loads a named `.sql` command file and runs it. The files contain no
     * schema/namespace references — the connection's `search_path` selects the
     * namespace — so they are portable verbatim to the other language ports.
     */
    run(command, params) {
        return this.query((0, sql_loader_1.loadCommandSql)(command), params);
    }
    /**
     * The processing worker's name (when this backend belongs to a Worker), used
     * to stamp `processedBy` on the next job fetched during a finish op.
     */
    get workerName() {
        return this.opts.name;
    }
    /**
     * Re-throws a finish-op error (SQLSTATE `BM001`, whose DETAIL carries the
     * numeric `ErrorCode`) as the shared canonical error; passes anything else
     * through unchanged.
     */
    mapFinishError(err, jobId, command) {
        if (err && err.code === 'BM001') {
            throw (0, finished_errors_1.finishedErrors)({
                code: Number(err.detail),
                jobId,
                command,
                state: 'active',
            });
        }
        throw err;
    }
    // ============================================================
    // Adding jobs
    // ============================================================
    async addJob(job, jobId, parentKeyOpts = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const opts = ((_a = job.opts) !== null && _a !== void 0 ? _a : {});
        const parentKey = (_c = (_b = parentKeyOpts.parentKey) !== null && _b !== void 0 ? _b : job.parentKey) !== null && _c !== void 0 ? _c : null;
        let rows;
        try {
            ({ rows } = await this.run('add_job', [
                this.queueName,
                jobId || job.id || '',
                job.name,
                (_d = job.data) !== null && _d !== void 0 ? _d : '{}',
                JSON.stringify(opts !== null && opts !== void 0 ? opts : {}),
                (_f = (_e = job.priority) !== null && _e !== void 0 ? _e : opts.priority) !== null && _f !== void 0 ? _f : 0,
                (_h = (_g = job.delay) !== null && _g !== void 0 ? _g : opts.delay) !== null && _h !== void 0 ? _h : 0,
                (_j = job.timestamp) !== null && _j !== void 0 ? _j : Date.now(),
                (_k = opts.attempts) !== null && _k !== void 0 ? _k : 1,
                (_m = (_l = job.parent) === null || _l === void 0 ? void 0 : _l.queueKey) !== null && _m !== void 0 ? _m : null,
                (_p = (_o = job.parent) === null || _o === void 0 ? void 0 : _o.id) !== null && _p !== void 0 ? _p : null,
                parentKey,
                (_q = job.deduplicationId) !== null && _q !== void 0 ? _q : null,
                (_r = job.repeatJobKey) !== null && _r !== void 0 ? _r : null,
                (_s = opts.lifo) !== null && _s !== void 0 ? _s : false,
            ]));
        }
        catch (err) {
            if (err && err.code === 'BM001') {
                throw (0, finished_errors_1.finishedErrors)({
                    code: Number(err.detail),
                    jobId,
                    parentKey: parentKey !== null && parentKey !== void 0 ? parentKey : undefined,
                    command: 'addJob',
                });
            }
            throw err;
        }
        return rows[0].id;
    }
    async addJobs(entries) {
        // Insert the whole batch in a single atomic statement so they all become
        // visible together (FIFO/priority ordering otherwise breaks: a worker could
        // claim an earlier-inserted lower-priority job before the rest land).
        const payload = entries.map(entry => this.toBatchEntry(this.queueName, entry.job, entry.jobId, entry.parentKeyOpts));
        // Fast path: when every job is independent (no parent, no deduplication),
        // use the set-based `add_jobs_bulk` (one INSERT + one event INSERT) instead
        // of the row-by-row flow engine — several times faster for plain addBulk.
        const independent = payload.every(e => e.parentId == null && e.parentQueue == null && e.dedupId == null);
        if (independent) {
            const { rows } = await this.run('add_jobs_bulk', [
                this.queueName,
                JSON.stringify(payload),
            ]);
            return rows.map(r => r.id);
        }
        const { rows } = await this.run('add_flow', [
            JSON.stringify(payload),
        ]);
        return rows.map(r => r.id);
    }
    /** Builds one entry of the JSONB batch consumed by `add_flow`. */
    toBatchEntry(queueName, data, jobId, parentKeyOpts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const opts = ((_a = data.opts) !== null && _a !== void 0 ? _a : {});
        return {
            queue: queueName,
            id: jobId || data.id || '',
            name: data.name,
            data: (_b = data.data) !== null && _b !== void 0 ? _b : '{}',
            opts,
            priority: (_d = (_c = data.priority) !== null && _c !== void 0 ? _c : opts.priority) !== null && _d !== void 0 ? _d : 0,
            delay: (_f = (_e = data.delay) !== null && _e !== void 0 ? _e : opts.delay) !== null && _f !== void 0 ? _f : 0,
            timestamp: (_g = data.timestamp) !== null && _g !== void 0 ? _g : Date.now(),
            attempts: (_h = opts.attempts) !== null && _h !== void 0 ? _h : 1,
            parentQueue: (_k = (_j = data.parent) === null || _j === void 0 ? void 0 : _j.queueKey) !== null && _k !== void 0 ? _k : null,
            parentId: (_m = (_l = data.parent) === null || _l === void 0 ? void 0 : _l.id) !== null && _m !== void 0 ? _m : null,
            parentKey: (_p = (_o = parentKeyOpts === null || parentKeyOpts === void 0 ? void 0 : parentKeyOpts.parentKey) !== null && _o !== void 0 ? _o : data.parentKey) !== null && _p !== void 0 ? _p : null,
            dedupId: (_q = data.deduplicationId) !== null && _q !== void 0 ? _q : null,
            schedulerId: (_r = data.repeatJobKey) !== null && _r !== void 0 ? _r : null,
            lifo: (_s = opts.lifo) !== null && _s !== void 0 ? _s : false,
            addToWaitingChildren: (_t = parentKeyOpts === null || parentKeyOpts === void 0 ? void 0 : parentKeyOpts.addToWaitingChildren) !== null && _t !== void 0 ? _t : false,
        };
    }
    async addFlow(entries) {
        // Build an ordered (roots-first) JSON array; the SQL function inserts the
        // whole tree in a single atomic statement. Each entry is self-describing
        // (carries its own queue), so the flow can span multiple queues.
        const payload = entries.map(entry => this.toBatchEntry(entry.queueName, entry.jobData, entry.jobId, entry.parentKeyOpts));
        try {
            const { rows } = await this.run('add_flow', [
                JSON.stringify(payload),
            ]);
            // A negative-integer id is an error/skip code (e.g. -5 = missing parent),
            // mirroring the Redis addFlow `[err, idOrCode]` convention; a real job id
            // is a positive counter or a custom string.
            return rows.map(r => {
                const code = Number(r.id);
                return Number.isInteger(code) && code < 0
                    ? [null, code]
                    : [null, r.id];
            });
        }
        catch (err) {
            // The single-statement function is atomic: on failure nothing was
            // inserted, so report the same error for every entry.
            return entries.map(() => [err, 0]);
        }
    }
    async addJobScheduler(jobSchedulerId, nextMillis, templateData, templateOpts, opts, delayedJobOpts, producerId) {
        let rows;
        try {
            ({ rows } = await this.run('add_job_scheduler', [
                this.queueName,
                jobSchedulerId,
                nextMillis !== null && nextMillis !== void 0 ? nextMillis : null,
                templateData || '{}',
                JSON.stringify(templateOpts !== null && templateOpts !== void 0 ? templateOpts : {}),
                JSON.stringify(opts !== null && opts !== void 0 ? opts : {}),
                JSON.stringify(delayedJobOpts !== null && delayedJobOpts !== void 0 ? delayedJobOpts : {}),
                Date.now(),
                producerId !== null && producerId !== void 0 ? producerId : null,
            ]));
        }
        catch (err) {
            if (err && err.code === 'BM001') {
                throw (0, finished_errors_1.finishedErrors)({
                    code: Number(err.detail),
                    command: 'addJobScheduler',
                });
            }
            throw err;
        }
        const row = rows[0];
        return [row.job_id, Number(row.delay)];
    }
    // ============================================================
    // Job state transitions
    // ============================================================
    async moveToActive(token, name) {
        var _a, _b, _c, _d, _e;
        const opts = this.opts;
        const lockDuration = (_a = opts.lockDuration) !== null && _a !== void 0 ? _a : 30000;
        const limiterMax = (_c = (_b = opts.limiter) === null || _b === void 0 ? void 0 : _b.max) !== null && _c !== void 0 ? _c : null;
        const limiterDuration = (_e = (_d = opts.limiter) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : null;
        const now = Date.now();
        const { rows } = await this.run('move_to_active', [
            this.queueName,
            token,
            lockDuration,
            now,
            name !== null && name !== void 0 ? name : null,
            limiterMax,
            limiterDuration,
        ]);
        return this.buildNextJobResult(rows, limiterMax, now);
    }
    /**
     * Shapes a job-claim result (from `move_to_active` or the fused finish+fetch)
     * into the worker's `[jobData, id, rateLimitDelay, delayUntil]` tuple. When no
     * job was claimed, a follow-up `next_signal` reports the rate-limit ttl or the
     * next delayed wake-up so the worker can block until then.
     */
    async buildNextJobResult(rows, limiterMax, now) {
        var _a, _b, _c, _d, _e;
        if (rows.length > 0) {
            const row = rows[0];
            // [jobData, id, rateLimitDelay, delayUntil]
            return [rowToJobJson(row), row.id, 0, 0];
        }
        // No job claimed: report the rate-limit ttl (if rate limited) or the next
        // delayed wake-up so the worker can block until then.
        const { rows: sigRows } = await this.run('next_signal', [this.queueName, limiterMax, now]);
        const rateLimitTtl = Number((_b = (_a = sigRows[0]) === null || _a === void 0 ? void 0 : _a.rate_limit_ttl) !== null && _b !== void 0 ? _b : 0);
        if (rateLimitTtl > 0) {
            return [null, '', rateLimitTtl, 0];
        }
        const delayUntil = (_e = bigintOrUndefined((_d = (_c = sigRows[0]) === null || _c === void 0 ? void 0 : _c.next_delay) !== null && _d !== void 0 ? _d : null)) !== null && _e !== void 0 ? _e : 0;
        return [null, '', 0, delayUntil];
    }
    async moveToCompleted(job, returnValue, removeOnComplete, token, fetchNext) {
        var _a, _b, _c, _d, _e, _f;
        const finishedOn = Date.now();
        const keep = normalizeKeep(removeOnComplete !== null && removeOnComplete !== void 0 ? removeOnComplete : this.opts.removeOnComplete);
        const opts = this.opts;
        // Fast path: fuse the completion and the next-job claim into a single
        // transaction (one commit), the Redis moveToFinished shape. Processing is
        // commit/fsync-bound, so collapsing two commits per job into one is the
        // dominant throughput win.
        if (fetchNext && !this.closing) {
            const lockDuration = (_a = opts.lockDuration) !== null && _a !== void 0 ? _a : 30000;
            const limiterMax = (_c = (_b = opts.limiter) === null || _b === void 0 ? void 0 : _b.max) !== null && _c !== void 0 ? _c : null;
            const limiterDuration = (_e = (_d = opts.limiter) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : null;
            const now = Date.now();
            let rows = [];
            try {
                ({ rows } = await this.run('move_to_completed_fetch', [
                    this.queueName,
                    job.id,
                    token,
                    JSON.stringify(returnValue !== null && returnValue !== void 0 ? returnValue : null),
                    finishedOn,
                    keep.removeAll,
                    keep.keepAge,
                    keep.keepCount,
                    lockDuration,
                    now,
                    (_f = this.workerName) !== null && _f !== void 0 ? _f : null,
                    limiterMax,
                    limiterDuration,
                ]));
            }
            catch (err) {
                this.mapFinishError(err, job.id, 'moveToFinished');
            }
            await this.collectMetrics('completed', finishedOn);
            const result = await this.buildNextJobResult(rows, limiterMax, now);
            return { result, finishedOn };
        }
        try {
            await this.run('move_to_completed', [
                this.queueName,
                job.id,
                token,
                JSON.stringify(returnValue !== null && returnValue !== void 0 ? returnValue : null),
                finishedOn,
                keep.removeAll,
                keep.keepAge,
                keep.keepCount,
            ]);
        }
        catch (err) {
            this.mapFinishError(err, job.id, 'moveToFinished');
        }
        await this.collectMetrics('completed', finishedOn);
        return { result: undefined, finishedOn };
    }
    async moveToFailed(job, failedReason, removeOnFail, token, fetchNext, fieldsToUpdate) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const finishedOn = Date.now();
        const keep = normalizeKeep(removeOnFail !== null && removeOnFail !== void 0 ? removeOnFail : this.opts.removeOnFail);
        const opts = this.opts;
        // Fast path: fuse the failure (or retry re-queue) and the next-job claim
        // into a single transaction (one commit), the Redis moveToFinished shape.
        if (fetchNext && !this.closing) {
            const lockDuration = (_a = opts.lockDuration) !== null && _a !== void 0 ? _a : 30000;
            const limiterMax = (_c = (_b = opts.limiter) === null || _b === void 0 ? void 0 : _b.max) !== null && _c !== void 0 ? _c : null;
            const limiterDuration = (_e = (_d = opts.limiter) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : null;
            const now = Date.now();
            let rows = [];
            try {
                ({ rows } = await this.run('move_to_failed_fetch', [
                    this.queueName,
                    job.id,
                    token,
                    failedReason,
                    (_f = fieldsToUpdate === null || fieldsToUpdate === void 0 ? void 0 : fieldsToUpdate.stacktrace) !== null && _f !== void 0 ? _f : null,
                    finishedOn,
                    keep.removeAll,
                    keep.keepAge,
                    keep.keepCount,
                    lockDuration,
                    now,
                    (_g = this.workerName) !== null && _g !== void 0 ? _g : null,
                    limiterMax,
                    limiterDuration,
                ]));
            }
            catch (err) {
                this.mapFinishError(err, job.id, 'moveToFinished');
            }
            await this.collectMetrics('failed', finishedOn);
            const result = await this.buildNextJobResult(rows, limiterMax, now);
            return { result, finishedOn };
        }
        try {
            await this.run('move_to_failed', [
                this.queueName,
                job.id,
                token,
                failedReason,
                (_h = fieldsToUpdate === null || fieldsToUpdate === void 0 ? void 0 : fieldsToUpdate.stacktrace) !== null && _h !== void 0 ? _h : null,
                finishedOn,
                keep.removeAll,
                keep.keepAge,
                keep.keepCount,
            ]);
        }
        catch (err) {
            this.mapFinishError(err, job.id, 'moveToFinished');
        }
        await this.collectMetrics('failed', finishedOn);
        return { result: undefined, finishedOn };
    }
    async moveToDelayed(jobId, timestamp, delay, token, opts) {
        var _a, _b, _c, _d;
        const fields = (_a = opts === null || opts === void 0 ? void 0 : opts.fieldsToUpdate) !== null && _a !== void 0 ? _a : {};
        try {
            await this.run('move_to_delayed', [
                this.queueName,
                jobId,
                token !== null && token !== void 0 ? token : '',
                timestamp + delay,
                delay,
                (_b = opts === null || opts === void 0 ? void 0 : opts.skipAttempt) !== null && _b !== void 0 ? _b : false,
                (_c = fields.failedReason) !== null && _c !== void 0 ? _c : null,
                (_d = fields.stacktrace) !== null && _d !== void 0 ? _d : null,
            ]);
        }
        catch (err) {
            this.mapFinishError(err, jobId, 'moveToDelayed');
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.fetchNext) && !this.closing && token) {
            const next = await this.moveToActive(token, this.workerName);
            // Return the next job tuple only when a job was actually claimed;
            // otherwise an empty array (a delay hint is not "next job data").
            return next && next[0] ? next : [];
        }
        return [];
    }
    async moveToWaitingChildren(jobId, token, _opts) {
        let rows;
        try {
            ({ rows } = await this.run('move_to_waiting_children', [
                this.queueName,
                jobId,
                token,
            ]));
        }
        catch (err) {
            this.mapFinishError(err, jobId, 'moveToWaitingChildren');
        }
        const code = rows[0].code;
        if (code < 0) {
            throw (0, finished_errors_1.finishedErrors)({
                code,
                jobId,
                command: 'moveToWaitingChildren',
                state: 'active',
            });
        }
        // 1 = moved to waiting-children (should wait); 0 = no pending, proceed.
        return code === 1;
    }
    async moveJobFromActiveToWait(jobId, token = '0') {
        const { rows } = await this.run('move_active_to_wait', [
            this.queueName,
            jobId,
            token,
            Date.now(),
        ]);
        const n = Number(rows[0].n);
        if (n < 0) {
            throw (0, finished_errors_1.finishedErrors)({
                code: n,
                jobId,
                command: 'moveJobFromActiveToWait',
            });
        }
        return n;
    }
    async retryJob(jobId, lifo, token, opts) {
        var _a, _b, _c;
        const fields = (_a = opts === null || opts === void 0 ? void 0 : opts.fieldsToUpdate) !== null && _a !== void 0 ? _a : {};
        try {
            await this.run('retry_job', [
                this.queueName,
                jobId,
                token !== null && token !== void 0 ? token : '',
                lifo,
                (_b = fields.failedReason) !== null && _b !== void 0 ? _b : null,
                (_c = fields.stacktrace) !== null && _c !== void 0 ? _c : null,
            ]);
        }
        catch (err) {
            this.mapFinishError(err, jobId, 'retryJob');
        }
    }
    async retryFinishedJob(job, state, opts = {}) {
        var _a, _b, _c, _d;
        const { rows } = await this.run('reprocess_job', [
            this.queueName,
            job.id,
            state,
            (_b = (_a = job.opts) === null || _a === void 0 ? void 0 : _a.lifo) !== null && _b !== void 0 ? _b : false,
            (_c = opts.resetAttemptsMade) !== null && _c !== void 0 ? _c : false,
            (_d = opts.resetAttemptsStarted) !== null && _d !== void 0 ? _d : false,
        ]);
        const code = rows[0].code;
        if (code !== 1) {
            throw (0, finished_errors_1.finishedErrors)({
                code,
                jobId: job.id,
                command: 'reprocessJob',
                state,
            });
        }
    }
    async promote(jobId) {
        const { rows } = await this.run('promote', [
            this.queueName,
            jobId,
        ]);
        const code = rows[0].code;
        if (code < 0) {
            throw (0, finished_errors_1.finishedErrors)({
                code,
                jobId,
                command: 'promote',
                state: 'delayed',
            });
        }
    }
    async moveStalledJobsToWait() {
        var _a, _b;
        // Recover active jobs whose lock expired: push them back to waiting so a
        // worker can re-claim them. Returns the recovered job ids. Uses a two-phase
        // mark/sweep so a freshly-claimed job is never reclaimed mid-processing.
        const opts = this.opts;
        const { rows } = await this.run('move_stalled_jobs_to_wait', [
            this.queueName,
            (_a = opts.maxStalledCount) !== null && _a !== void 0 ? _a : 1,
            Date.now(),
            (_b = opts.stalledInterval) !== null && _b !== void 0 ? _b : 30000,
        ]);
        return rows.map(r => r.id);
    }
    // ============================================================
    // Bulk admin transitions
    // ============================================================
    async retryFinishedJobs(state, count, timestamp) {
        const { rows } = await this.run('retry_jobs', [
            this.queueName,
            state !== null && state !== void 0 ? state : 'failed',
            count !== null && count !== void 0 ? count : null,
            timestamp !== null && timestamp !== void 0 ? timestamp : null,
        ]);
        return Number(rows[0].n);
    }
    async promoteJobs(count) {
        const { rows } = await this.run('promote_jobs', [
            this.queueName,
            count !== null && count !== void 0 ? count : null,
        ]);
        return Number(rows[0].n);
    }
    async pause(pause) {
        await this.run('pause', [this.queueName, pause]);
    }
    async drain(delayed) {
        await this.run('drain', [this.queueName, delayed]);
    }
    async cleanJobsByState(state, timestamp, limit = 0) {
        const { rows } = await this.run('clean', [
            this.queueName,
            state,
            timestamp,
            limit,
        ]);
        return rows.map(r => r.id);
    }
    async obliterate(opts) {
        const { rows } = await this.run('obliterate', [
            this.queueName,
            opts.count,
            opts.force,
        ]);
        const cursor = Number(rows[0].cursor);
        if (cursor < 0) {
            switch (cursor) {
                case -1:
                    throw new Error('Cannot obliterate non-paused queue');
                case -2:
                    throw new Error('Cannot obliterate queue with active jobs');
            }
        }
        return cursor;
    }
    /**
     * Removes orphaned job hashes (job data present but not referenced by any
     * state set). This is a Redis keyspace-maintenance concern: on PostgreSQL a
     * job is a single relational row inserted transactionally with its state, so
     * orphans cannot exist and there is nothing to remove. Always returns 0.
     */
    removeOrphanedJobs(_count, _limit) {
        return Promise.resolve(0);
    }
    // ============================================================
    // Locks
    // ============================================================
    async extendLock(jobId, token, duration) {
        const { rows } = await this.run('extend_lock', [
            this.queueName,
            jobId,
            token,
            duration,
            Date.now(),
        ]);
        return rows[0].n;
    }
    async extendLocks(jobIds, tokens, duration) {
        const { rows } = await this.run('extend_locks', [
            this.queueName,
            jobIds,
            tokens,
            duration,
            Date.now(),
        ]);
        // The SQL command returns the ids whose locks could not be renewed.
        return rows.map(({ id }) => id);
    }
    // ============================================================
    // Job mutations
    // ============================================================
    async updateData(job, data) {
        const { rows } = await this.run('update_data', [
            this.queueName,
            job.id,
            JSON.stringify(data !== null && data !== void 0 ? data : {}),
        ]);
        if (rows.length === 0) {
            throw (0, finished_errors_1.finishedErrors)({
                code: -1,
                jobId: job.id,
                command: 'updateData',
            });
        }
    }
    async updateProgress(jobId, progress) {
        const { rows } = await this.run('update_progress', [
            this.queueName,
            jobId,
            JSON.stringify(progress !== null && progress !== void 0 ? progress : null),
        ]);
        if (!rows[0].updated) {
            throw (0, finished_errors_1.finishedErrors)({
                code: -1,
                jobId,
                command: 'updateProgress',
            });
        }
    }
    async addLog(jobId, logRow, keepLogs) {
        let rows;
        try {
            ({ rows } = await this.run('add_log', [
                this.queueName,
                jobId,
                logRow,
            ]));
        }
        catch (err) {
            // 23503 = foreign_key_violation: the job no longer exists.
            if (err && err.code === '23503') {
                throw (0, finished_errors_1.finishedErrors)({ code: -1, jobId, command: 'addLog' });
            }
            throw err;
        }
        const count = Number(rows[0].idx) + 1;
        if (keepLogs && count > keepLogs) {
            await this.run('trim_logs', [this.queueName, jobId, count - keepLogs]);
            return keepLogs;
        }
        return count;
    }
    async clearLogs(jobId, keepLogs) {
        await this.run('clear_logs', [this.queueName, jobId, keepLogs !== null && keepLogs !== void 0 ? keepLogs : null]);
    }
    async changeDelay(jobId, delay) {
        const { rows } = await this.run('change_delay', [
            this.queueName,
            jobId,
            delay,
            Date.now(),
        ]);
        const code = rows[0].code;
        if (code < 0) {
            throw (0, finished_errors_1.finishedErrors)({
                code,
                jobId,
                command: 'changeDelay',
                state: 'delayed',
            });
        }
    }
    async changePriority(jobId, priority = 0, lifo = false) {
        const { rows } = await this.run('change_priority', [
            this.queueName,
            jobId,
            priority,
            lifo,
        ]);
        const code = rows[0].code;
        if (code < 0) {
            throw (0, finished_errors_1.finishedErrors)({ code, jobId, command: 'changePriority' });
        }
    }
    async remove(jobId, removeChildren) {
        let rows;
        try {
            ({ rows } = await this.run('remove', [
                this.queueName,
                jobId,
                removeChildren,
            ]));
        }
        catch (err) {
            if (err && err.code === 'BM001') {
                throw (0, finished_errors_1.finishedErrors)({
                    code: Number(err.detail),
                    jobId,
                    command: 'remove',
                });
            }
            throw err;
        }
        return rows[0].n;
    }
    async removeUnprocessedChildren(jobId) {
        await this.run('remove_unprocessed_children', [this.queueName, jobId]);
    }
    async removeChildDependency(jobId, parentKey) {
        try {
            const { rows } = await this.run('remove_child_dependency', [this.queueName, jobId, parentKey, Date.now()]);
            return rows[0].n === 0;
        }
        catch (err) {
            if (err && err.code === 'BM001') {
                throw (0, finished_errors_1.finishedErrors)({
                    code: Number(err.detail),
                    jobId,
                    parentKey,
                    command: 'removeChildDependency',
                });
            }
            throw err;
        }
    }
    async removeDeduplicationKey(deduplicationId, jobId) {
        const { rows } = await this.run('remove_deduplication_key', [this.queueName, deduplicationId, jobId, Date.now()]);
        return rows.length;
    }
    async deleteDeduplicationKey(deduplicationId) {
        const { rows } = await this.run('delete_deduplication_key', [this.queueName, deduplicationId]);
        return rows.length;
    }
    // ============================================================
    // Job schedulers
    // ============================================================
    async updateJobSchedulerNextMillis(jobSchedulerId, nextMillis, templateData, delayedJobOpts, producerId) {
        var _a, _b;
        const { rows } = await this.run('update_job_scheduler', [
            this.queueName,
            jobSchedulerId,
            nextMillis !== null && nextMillis !== void 0 ? nextMillis : null,
            templateData || '{}',
            JSON.stringify(delayedJobOpts !== null && delayedJobOpts !== void 0 ? delayedJobOpts : {}),
            Date.now(),
            producerId !== null && producerId !== void 0 ? producerId : null,
        ]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.job_id) !== null && _b !== void 0 ? _b : null;
    }
    async removeJobScheduler(jobSchedulerId) {
        var _a, _b;
        const { rows } = await this.run('remove_job_scheduler', [this.queueName, jobSchedulerId]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.removed) !== null && _b !== void 0 ? _b : 0;
    }
    async getJobScheduler(id) {
        const { rows } = await this.run('get_job_scheduler', [
            this.queueName,
            id,
        ]);
        if (rows.length === 0) {
            return [null, null];
        }
        const { hash, next } = mapSchedulerRow(rows[0]);
        const flat = [];
        for (const [k, v] of Object.entries(hash)) {
            flat.push(k, v);
        }
        return [flat, next];
    }
    async isJobScheduler(id) {
        var _a, _b;
        const { rows } = await this.run('is_job_scheduler', [
            this.queueName,
            id,
        ]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.exists) !== null && _b !== void 0 ? _b : false;
    }
    async getJobSchedulerData(key) {
        const { rows } = await this.run('get_job_scheduler', [
            this.queueName,
            key,
        ]);
        if (rows.length === 0) {
            return {};
        }
        return mapSchedulerRow(rows[0]).hash;
    }
    async getJobSchedulersRange(start, end, asc) {
        const count = end < 0 ? null : end - start + 1;
        const { rows } = await this.run('get_job_schedulers_range', [this.queueName, asc, start, count]);
        const flat = [];
        for (const r of rows) {
            flat.push(r.scheduler_id, String(r.next_run_ms));
        }
        return flat;
    }
    async getJobSchedulersCount() {
        var _a, _b;
        const { rows } = await this.run('get_job_schedulers_count', [this.queueName]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
    }
    // ============================================================
    // Queue / job queries
    // ============================================================
    async getState(jobId) {
        const { rows } = await this.run('get_state', [this.queueName, jobId]);
        if (!rows[0]) {
            return 'unknown';
        }
        // A prioritized job is a waiting job with priority > 0.
        if (rows[0].state === 'waiting' && rows[0].priority > 0) {
            return 'prioritized';
        }
        return rows[0].state;
    }
    async isFinished(jobId, returnValue) {
        var _a, _b;
        const { rows } = await this.run('is_finished', [this.queueName, jobId]);
        const row = rows[0];
        // status: 0 = not finished, 1 = completed, 2 = failed, -1 = missing job.
        let status = 0;
        let value = '';
        if (!row) {
            status = -1;
            value = `Missing key for job ${this.toKey(jobId)}. isFinished`;
        }
        else if (row.state === 'completed') {
            status = 1;
            value = JSON.stringify((_a = row.return_value) !== null && _a !== void 0 ? _a : null);
        }
        else if (row.state === 'failed') {
            status = 2;
            value = (_b = row.failed_reason) !== null && _b !== void 0 ? _b : '';
        }
        return returnValue ? [status, value] : status;
    }
    async isMaxed() {
        const { rows } = await this.run('is_maxed', [
            this.queueName,
        ]);
        return rows[0].maxed;
    }
    async isJobInState(state, jobId) {
        if (state === 'active') {
            const { rows } = await this.run('is_job_in_state', [
                this.queueName,
                jobId,
                'active',
            ]);
            return rows[0].present;
        }
        else if (state === 'wait' || state === 'paused') {
            // 'wait' or 'paused' — distinguished by the queue's paused flag.
            const { rows } = await this.run('is_job_in_wait', [
                this.queueName,
                jobId,
                state === 'paused',
            ]);
            return rows[0].present;
        }
        else if (state === 'waiting') {
            return ((await this.isJobInState('wait', jobId)) ||
                (await this.isJobInState('paused', jobId)));
        }
        else if (state === 'prioritized') {
            const { rows } = await this.run('is_job_prioritized', [this.queueName, jobId]);
            return rows[0].present;
        }
        else if (state === 'completed' ||
            state === 'failed' ||
            state === 'delayed' ||
            state === 'waiting-children') {
            const { rows } = await this.run('is_job_in_state', [
                this.queueName,
                jobId,
                state,
            ]);
            return rows[0].present;
        }
        throw new Error(`Unknown job state: ${state}`);
    }
    async getJobData(jobId) {
        const { rows } = await this.run('get_job_data', [
            this.queueName,
            jobId,
        ]);
        return rows[0] ? rowToJobJson(rows[0]) : undefined;
    }
    async getDeduplicationJobId(deduplicationId) {
        var _a, _b;
        const { rows } = await this.run('get_deduplication_job_id', [this.queueName, deduplicationId, Date.now()]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.job_id) !== null && _b !== void 0 ? _b : null;
    }
    async getJobLogs(jobId, start, end, asc) {
        const { rows: countRows } = await this.run('get_job_logs_count', [this.queueName, jobId]);
        const count = Number(countRows[0].count);
        // start/end are inclusive zero-based indexes (Redis LRANGE semantics).
        const from = start < 0 ? Math.max(count + start, 0) : start;
        const to = end < 0 ? count + end : end;
        const limit = to - from + 1;
        if (limit <= 0) {
            return { logs: [], count };
        }
        const { rows } = await this.run(asc ? 'get_job_logs_asc' : 'get_job_logs_desc', [this.queueName, jobId, from, limit]);
        return { logs: rows.map(r => r.row), count };
    }
    async getRateLimitTtl(maxJobs) {
        // Mirrors getRateLimitTtl-2.lua: explicit maxJobs → check against it; else
        // the global meta `max`; else the raw window ttl (-2 when none).
        const { rows } = await this.run('get_rate_limit_ttl', [
            this.queueName,
            maxJobs !== null && maxJobs !== void 0 ? maxJobs : 0,
            Date.now(),
        ]);
        return Number(rows[0].ttl);
    }
    async getCounts(types) {
        const { rows } = await this.run('get_counts', [
            this.queueName,
        ]);
        const counts = rows[0];
        const waiting = Number(counts.waiting);
        const prioritized = Number(counts.prioritized);
        const isPaused = counts.paused === '1';
        const lookup = {
            active: Number(counts.active),
            completed: Number(counts.completed),
            failed: Number(counts.failed),
            delayed: Number(counts.delayed),
            // When paused, waiting jobs are reported as paused (the queue isn't
            // physically moving them — see the O(1) pause flag).
            wait: isPaused ? 0 : waiting,
            waiting: isPaused ? 0 : waiting,
            prioritized,
            'waiting-children': Number(counts['waiting-children']),
            paused: isPaused ? waiting : 0,
        };
        return types.map(type => { var _a; return (_a = lookup[type]) !== null && _a !== void 0 ? _a : 0; });
    }
    async getCountsPerPriority(priorities) {
        const { rows } = await this.run('get_counts_per_priority', [this.queueName, priorities]);
        return rows.map(r => Number(r.cnt));
    }
    async getRanges(types, start = 0, end = -1, asc = false) {
        const result = [];
        for (const type of types) {
            const { rows } = await this.run('get_range', [
                this.queueName,
                type,
                start,
                end,
                asc,
            ]);
            result.push(rows.map(r => r.id));
        }
        return result;
    }
    async getDependencyCounts(jobId, types) {
        const { rows } = await this.run('get_dependency_counts', [this.queueName, jobId]);
        const c = rows[0];
        const map = {
            processed: Number(c.processed),
            unprocessed: Number(c.unprocessed),
            ignored: Number(c.ignored),
            failed: Number(c.failed),
        };
        return types.map(t => { var _a; return (_a = map[t]) !== null && _a !== void 0 ? _a : 0; });
    }
    async getDependencies(jobId, opts) {
        // No category requested: return all four in full (mirrors the Redis
        // hgetall/smembers path). `value` for processed/ignored comes back as a
        // parsed JSON value from jsonb.
        if (!opts.processed && !opts.unprocessed && !opts.ignored && !opts.failed) {
            const { rows } = await this.run('get_dependencies', [this.queueName, jobId]);
            const processed = {};
            const unprocessed = [];
            const ignored = {};
            const failed = [];
            for (const r of rows) {
                switch (r.status) {
                    case 'processed':
                        processed[r.child_key] = r.value;
                        break;
                    case 'pending':
                        unprocessed.push(r.child_key);
                        break;
                    case 'ignored':
                        ignored[r.child_key] = r.value;
                        break;
                    case 'failed':
                        failed.push(r.child_key);
                        break;
                }
            }
            return { processed, unprocessed, ignored, failed };
        }
        // Paginated per requested category (cursor is a plain offset here).
        const result = {};
        const page = async (status, cursor = 0, count = 20) => {
            const { rows } = await this.run('get_dependencies_page', [this.queueName, jobId, status, cursor, count]);
            return { rows, next: rows.length < count ? 0 : cursor + count };
        };
        if (opts.processed) {
            const { rows, next } = await page('processed', opts.processed.cursor, opts.processed.count);
            const processed = {};
            for (const r of rows) {
                processed[r.child_key] = r.value;
            }
            result.processed = processed;
            result.nextProcessedCursor = next;
        }
        if (opts.unprocessed) {
            const { rows, next } = await page('pending', opts.unprocessed.cursor, opts.unprocessed.count);
            result.unprocessed = rows.map(r => r.child_key);
            result.nextUnprocessedCursor = next;
        }
        if (opts.ignored) {
            const { rows, next } = await page('ignored', opts.ignored.cursor, opts.ignored.count);
            const ignored = {};
            for (const r of rows) {
                ignored[r.child_key] = r.value;
            }
            result.ignored = ignored;
            result.nextIgnoredCursor = next;
        }
        if (opts.failed) {
            const { rows, next } = await page('failed', opts.failed.cursor, opts.failed.count);
            result.failed = rows.map(r => r.child_key);
            result.nextFailedCursor = next;
        }
        return result;
    }
    async getProcessedChildrenValues(jobId) {
        const { rows } = await this.run('get_processed_children_values', [this.queueName, jobId]);
        const result = {};
        for (const r of rows) {
            result[r.child_key] = r.value;
        }
        return result;
    }
    async getIgnoredChildrenFailures(jobId) {
        const { rows } = await this.run('get_ignored_children_failures', [this.queueName, jobId]);
        const result = {};
        for (const r of rows) {
            result[r.child_key] = r.reason;
        }
        return result;
    }
    /**
     * Records one finished job into the per-minute metrics for the given `kind`,
     * when the worker was created with a `metrics.maxDataPoints`. Mirrors the
     * `collectMetrics` step of Redis's moveToFinished; kept as a separate query
     * (metrics are best-effort, so strict atomicity with the finish is not
     * required).
     */
    async collectMetrics(kind, finishedOn) {
        var _a;
        const maxDataPoints = (_a = this.opts.metrics) === null || _a === void 0 ? void 0 : _a.maxDataPoints;
        if (maxDataPoints) {
            await this.run('collect_metrics', [
                this.queueName,
                kind,
                maxDataPoints,
                finishedOn,
            ]);
        }
    }
    async getMetrics(type, start = 0, end = -1) {
        var _a, _b, _c, _d;
        const { rows } = await this.run('get_metrics', [this.queueName, type, start, end]);
        const total = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : '0';
        const data = ((_d = (_c = rows[0]) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : []).map(String);
        // [meta, data, count] mirrors getMetrics-1.lua: meta = [count, prevTS,
        // prevCount] (only the cumulative count is tracked here), data = the sliced
        // per-minute points, count = number of points returned.
        return [[total, '0', '0'], data, data.length];
    }
    async getClientList() {
        // Mirror Redis CLIENT LIST using pg_stat_activity: each named session
        // (workers / QueueEvents set their `application_name`) becomes a
        // `name=<application_name>` line, which the shared client-list parser then
        // matches against the queue's client name. Returned as a single-element
        // array since PostgreSQL has no cluster-node fan-out.
        const { rows } = await this.run('get_client_list');
        return [rows.map(r => `name=${r.application_name}`).join('\n')];
    }
    async paginate(key, opts) {
        var _a;
        // The dependency getters page over a parent's children: the key is
        // `<queue>:<parentId>:dependencies` (pending children) or
        // `<queue>:<parentId>:processed` (resolved children, carrying their value).
        const prefix = `${this.queueName}:`;
        const inner = key.startsWith(prefix) ? key.slice(prefix.length) : key;
        let status;
        let parentId;
        let withValue = false;
        if (inner.endsWith(':processed')) {
            status = 'processed';
            withValue = true;
            parentId = inner.slice(0, -':processed'.length);
        }
        else if (inner.endsWith(':dependencies')) {
            status = 'pending';
            parentId = inner.slice(0, -':dependencies'.length);
        }
        else {
            // Only the dependency / processed pagination keys are supported.
            return notImplemented('paginate');
        }
        const offset = Math.max((_a = opts.start) !== null && _a !== void 0 ? _a : 0, 0);
        const limit = opts.end != null && opts.end >= 0 ? opts.end - offset + 1 : null;
        const { rows } = await this.run('paginate_dependencies', [
            this.queueName,
            parentId,
            status,
            offset,
            limit,
        ]);
        const total = rows.length ? Number(rows[0].total) : 0;
        const items = rows.map(r => withValue ? { id: r.child_key, v: r.dep_value } : { id: r.child_key });
        const jobs = opts.fetchJobs
            ? rows.filter(r => r.id != null).map(r => rowToJobJson(r))
            : undefined;
        return { cursor: '0', items, total, jobs };
    }
    // ============================================================
    // Queue metadata & maintenance keys
    // ============================================================
    async setQueueMeta(values) {
        const fields = Object.keys(values);
        if (fields.length === 0) {
            return 0;
        }
        const vals = fields.map(f => String(values[f]));
        const { rowCount } = await this.run('set_queue_meta', [
            this.queueName,
            fields,
            vals,
        ]);
        return rowCount !== null && rowCount !== void 0 ? rowCount : fields.length;
    }
    async getQueueMetaField(field) {
        var _a, _b;
        const { rows } = await this.run('get_queue_meta_field', [this.queueName, field]);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
    }
    async getQueueMetaFields(fields) {
        if (fields.length === 0) {
            return [];
        }
        const { rows } = await this.run('get_queue_meta_fields', [this.queueName, fields]);
        const map = new Map(rows.map(r => [r.field, r.value]));
        return fields.map(f => { var _a; return (_a = map.get(f)) !== null && _a !== void 0 ? _a : null; });
    }
    async getQueueMeta() {
        const { rows } = await this.run('get_queue_meta', [this.queueName]);
        const meta = {};
        for (const r of rows) {
            meta[r.field] = r.value;
        }
        return meta;
    }
    async removeQueueMetaFields(fields) {
        if (fields.length === 0) {
            return 0;
        }
        const { rowCount } = await this.run('remove_queue_meta_fields', [
            this.queueName,
            fields,
        ]);
        return rowCount !== null && rowCount !== void 0 ? rowCount : 0;
    }
    async hasQueueMetaField(field) {
        const { rows } = await this.run('has_queue_meta_field', [this.queueName, field]);
        return rows[0].exists;
    }
    async setRateLimit(expireTimeMs) {
        // Force the limiter window (mirrors Redis SET limiter=MAX PX expireTimeMs).
        await this.run('set_rate_limit', [
            this.queueName,
            expireTimeMs,
            Date.now(),
        ]);
    }
    async removeRateLimitKey() {
        const { rows } = await this.run('remove_rate_limit', [
            this.queueName,
        ]);
        return rows[0].n;
    }
    removeDeprecatedPriorityKey() {
        return notImplemented('removeDeprecatedPriorityKey');
    }
    trimEvents(_maxLength) {
        return notImplemented('trimEvents');
    }
    // ============================================================
    // Event stream
    // ============================================================
    async publishEvent(fields, _maxEvents) {
        const { event } = fields, rest = tslib_1.__rest(fields, ["event"]);
        const { rows } = await this.run('publish_event', [
            this.queueName,
            String(event),
            JSON.stringify(rest),
        ]);
        return String(rows[0].id);
    }
    async readEvents(id, blockTimeout) {
        if (this.closing || this.connection.isClosing) {
            return null;
        }
        // Resolve the cursor: '$' means "only events from now on".
        let cursor;
        if (id === '$') {
            const { rows } = await this.run('read_events_max', [
                this.queueName,
            ]);
            cursor = rows[0].max;
        }
        else {
            cursor = id;
        }
        let events = await this.fetchEvents(cursor);
        if (events.length === 0) {
            await this.waitForEvent(blockTimeout);
            if (this.closing || this.connection.isClosing) {
                return null;
            }
            events = await this.fetchEvents(cursor);
        }
        if (events.length === 0) {
            return null;
        }
        // Redis XREAD shape: [[streamKey, [[id, [k1,v1,...]], ...]]].
        return [
            ['events', events.map(e => [e.id, e.fields])],
        ];
    }
    async fetchEvents(cursor) {
        const { rows } = await this.run('read_events', [this.queueName, cursor, EVENT_READ_BATCH]);
        return rows.map(r => {
            var _a;
            const fields = ['event', r.event];
            for (const [k, v] of Object.entries((_a = r.data) !== null && _a !== void 0 ? _a : {})) {
                fields.push(k, typeof v === 'string' ? v : String(v));
            }
            return { id: String(r.id), fields };
        });
    }
    /** Subscribes the dedicated client to the shared jobs channel (once). */
    async ensureListening() {
        const client = await this.connection.getListenClient();
        if (!this.listening) {
            await client.query((0, sql_loader_1.loadCommandSql)('listen_jobs'));
            this.listening = true;
        }
        return client;
    }
    /** Subscribes the dedicated client to the shared events channel (once). */
    async ensureListeningEvents() {
        const client = await this.connection.getListenClient();
        if (!this.listeningEvents) {
            await client.query((0, sql_loader_1.loadCommandSql)('listen_events'));
            this.listeningEvents = true;
        }
        return client;
    }
    /**
     * Blocks (up to `blockTimeout` ms) until a new event is published for this
     * queue (via `LISTEN`/`NOTIFY` on the events channel), or the timeout
     * elapses. Used by {@link readEvents} between polls.
     */
    async waitForEvent(blockTimeout) {
        if (this.closing || this.connection.isClosing) {
            return;
        }
        const client = await this.ensureListeningEvents();
        return new Promise(resolve => {
            let settled = false;
            const finish = () => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(timer);
                client.removeListener('notification', onNotify);
                this.cancelEventWait = undefined;
                resolve();
            };
            const onNotify = (msg) => {
                if (msg.channel === PostgresQueueBackend.EVENTS_CHANNEL &&
                    msg.payload === this.queueName) {
                    finish();
                }
            };
            const timer = setTimeout(finish, Math.max(blockTimeout || 5000, 1));
            this.cancelEventWait = finish;
            client.on('notification', onNotify);
        });
    }
    /**
     * Blocks (up to `blockTimeout` seconds) until a job for this queue may be
     * available, via `LISTEN`/`NOTIFY`. Producers notify the shared `bullmq_jobs`
     * channel with the queue name as payload (in `add_job`), so a producer
     * in any process wakes a blocked worker immediately. Returns a marker
     * (`score` 0 = "check now") or `null` on timeout. The Redis backend
     * implements this with `BZPOPMIN`.
     */
    async waitForJob(blockTimeout) {
        if (this.closing || this.blockingDisconnected) {
            return null;
        }
        const client = await this.ensureListening();
        // The blocking connection may have been torn down while we were awaiting
        // `ensureListening`; bail rather than registering a wait that only a
        // (possibly faked) timer could end.
        if (this.closing || this.blockingDisconnected) {
            return null;
        }
        return new Promise(resolve => {
            let settled = false;
            const finish = (value) => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(timer);
                client.removeListener('notification', onNotify);
                this.cancelWait = undefined;
                resolve(value);
            };
            const onNotify = (msg) => {
                var _a;
                // Filter for this queue (the shared channel carries every queue).
                if (msg.channel === PostgresQueueBackend.NOTIFY_CHANNEL &&
                    msg.payload === this.queueName) {
                    finish({ member: (_a = msg.payload) !== null && _a !== void 0 ? _a : '', score: 0 });
                }
            };
            let timer = setTimeout(() => finish(null), Math.max(blockTimeout, 0) * 1000);
            this.cancelWait = () => finish(null);
            client.on('notification', onNotify);
            // Final race guard: if `disconnectBlocking` ran between the check above
            // and installing `cancelWait`, end the wait now instead of blocking on a
            // timer (which never fires under faked timers).
            if (this.blockingDisconnected) {
                finish(null);
                return;
            }
            // Close the race (and survive a NOTIFY that fired before we subscribed):
            // with the listener already registered above, check whether a claimable
            // job is already waiting and, if so, wake immediately. This mirrors the
            // check-and-block atomicity of Redis's blocking pop and avoids relying on
            // a (possibly faked) timeout to recover a missed notification.
            this.run('has_waiting_job', [this.queueName])
                .then(({ rows }) => {
                var _a;
                if ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.present) {
                    finish({ member: this.queueName, score: 0 });
                }
            })
                .catch(() => {
                // Ignore: a failed probe just falls back to the notify/timeout wait.
            });
            // Shorten the wait to the next due delayed job: a delayed job's promotion
            // is not announced by a NOTIFY at its due time, so without this the worker
            // would sleep the full `blockTimeout` (drainDelay) before re-checking.
            this.run('next_delay', [this.queueName])
                .then(({ rows }) => {
                var _a, _b;
                const next = bigintOrUndefined((_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.next_delay) !== null && _b !== void 0 ? _b : null);
                if (next === undefined || settled) {
                    return;
                }
                const dueIn = next - Date.now();
                if (dueIn <= 0) {
                    // The delayed job is already due (its due time passed while this
                    // probe was in flight — e.g. the clock advanced meanwhile). Wake
                    // now instead of arming a 0ms timer: under faked timers a 0ms
                    // timeout never fires unless the clock is advanced again, which
                    // would only happen once a job is processed — a deadlock.
                    finish(null);
                }
                else if (dueIn < Math.max(blockTimeout, 0) * 1000) {
                    clearTimeout(timer);
                    timer = setTimeout(() => finish(null), dueIn);
                }
            })
                .catch(() => {
                // Ignore: fall back to the notify/timeout wait.
            });
        });
    }
    async disconnectBlocking(_wait = true) {
        var _a;
        this.blockingDisconnected = true;
        (_a = this.cancelWait) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    async reconnectBlocking() {
        // Allow the blocking wait to run again and force a fresh LISTEN on the next
        // waitForJob (e.g. after a reconnect).
        this.blockingDisconnected = false;
        this.listening = false;
    }
}
exports.PostgresQueueBackend = PostgresQueueBackend;
// ============================================================
// Worker blocking primitive
// ============================================================
/** The shared notify channel all producers post to (see `add_job`). */
PostgresQueueBackend.NOTIFY_CHANNEL = 'bullmq_jobs';
/** The shared event-stream channel (see `publish_event`). */
PostgresQueueBackend.EVENTS_CHANNEL = 'bullmq_events';
