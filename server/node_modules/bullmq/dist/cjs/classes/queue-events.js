"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEvents = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
const queue_base_1 = require("./queue-base");
const ioredis_client_1 = require("./ioredis-client");
/**
 * The QueueEvents class is used for listening to the global events
 * emitted by a given queue.
 *
 * This class requires a dedicated redis connection.
 *
 */
class QueueEvents extends queue_base_1.QueueBase {
    constructor(name, _a = {
        connection: {},
    }, backendFactory) {
        var { connection, autorun = true } = _a, opts = tslib_1.__rest(_a, ["connection", "autorun"]);
        super(name, Object.assign(Object.assign({}, opts), { connection: (0, utils_1.isRedisInstance)(connection)
                ? ((0, ioredis_client_1.isIRedisClient)(connection)
                    ? connection
                    : (0, ioredis_client_1.createIORedisClient)(connection)).duplicate()
                : connection }), backendFactory, true);
        this.running = false;
        this.blocking = false;
        this.opts = Object.assign({
            blockingTimeout: 10000,
        }, this.opts);
        if (autorun) {
            this.run().catch(error => this.emit('error', error));
        }
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    off(eventName, listener) {
        super.off(eventName, listener);
        return this;
    }
    on(event, listener) {
        super.on(event, listener);
        return this;
    }
    once(event, listener) {
        super.once(event, listener);
        return this;
    }
    /**
     * Manually starts running the event consumming loop. This shall be used if you do not
     * use the default "autorun" option on the constructor.
     */
    async run() {
        if (!this.running) {
            try {
                this.running = true;
                // TODO: Planned for deprecation as it really has no use case
                await this.backend.setName(this.clientName(utils_1.QUEUE_EVENT_SUFFIX));
                await this.consumeEvents();
            }
            catch (error) {
                this.running = false;
                throw error;
            }
        }
        else {
            throw new Error('Queue Events is already running.');
        }
    }
    async consumeEvents() {
        const opts = this.opts;
        let id = opts.lastEventId || '$';
        while (!this.closing) {
            this.blocking = true;
            // Cast to actual return type, see: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/44301
            const data = await this.checkConnectionError(() => this.backend.readEvents(id, opts.blockingTimeout));
            this.blocking = false;
            if (data) {
                const stream = data[0];
                const events = stream[1];
                for (let i = 0; i < events.length; i++) {
                    id = events[i][0];
                    const args = (0, utils_1.array2obj)(events[i][1]);
                    //
                    // TODO: we may need to have a separate stream for progress data
                    // to avoid this hack.
                    switch (args.event) {
                        case 'progress':
                            args.data = JSON.parse(args.data);
                            break;
                        case 'completed':
                            args.returnvalue = JSON.parse(args.returnvalue);
                            break;
                        case 'delayed':
                            args.delay = Number(args.delay);
                            break;
                    }
                    const { event } = args, restArgs = tslib_1.__rest(args, ["event"]);
                    if (event === 'drained') {
                        this.emit(event, id);
                    }
                    else {
                        this.emit(event, restArgs, id);
                        if (restArgs.jobId) {
                            this.emit(`${event}:${restArgs.jobId}`, restArgs, id);
                        }
                    }
                }
            }
        }
    }
    /**
     * Stops consuming events and close the underlying Redis connection if necessary.
     *
     * @returns
     */
    async close() {
        if (!this.closing) {
            this.closing = (async () => {
                try {
                    // Force a disconnect first to interrupt the blocking XREAD, then
                    // close the underlying connection.
                    await this.backend.disconnect();
                    await this.backend.close();
                }
                finally {
                    this.closed = true;
                }
            })();
        }
        return this.closing;
    }
}
exports.QueueEvents = QueueEvents;
