"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueBase = void 0;
const events_1 = require("events");
const utils_1 = require("../utils");
const create_backend_1 = require("../utils/create-backend");
const job_1 = require("./job");
/**
 * Base class for all classes that need to interact with queues.
 * This class is normally not used directly, but extended by the other classes.
 *
 */
class QueueBase extends events_1.EventEmitter {
    /**
     *
     * @param name - The name of the queue.
     * @param opts - Options for the queue.
     * @param backendFactory - Factory used to build the {@link IQueueBackend}.
     * Defaults to the Redis backend; inject a different factory to use another
     * datastore or a test mock.
     */
    constructor(name, opts = { connection: {} }, backendFactory = (0, create_backend_1.getDefaultBackendFactory)(), hasBlockingConnection = false) {
        super();
        this.name = name;
        this.opts = opts;
        this.closed = false;
        this.hasBlockingConnection = false;
        this.backendFactory = backendFactory;
        this.hasBlockingConnection = hasBlockingConnection;
        this.opts = Object.assign({}, opts);
        if (!name) {
            throw new Error('Queue name must be provided');
        }
        if (name.includes(':')) {
            throw new Error('Queue name cannot contain :');
        }
        this.createBackend();
        // Queue identity and key building are owned by the backend (a datastore
        // concern). The Redis backend encodes the key `prefix`
        // (`"<prefix>:<queue>"`); other backends format their own identity.
        this.qualifiedName = this.backend.qualifiedName;
        this.keys = this.backend.keys;
        this.toKey = (type) => this.backend.toKey(type);
        this.backend.on('error', (error) => this.emit('error', error));
        this.backend.on('close', () => {
            if (!this.closing) {
                this.emit('ioredis:close');
            }
        });
    }
    /**
     * Resolves once the underlying backend (and its connection) is ready.
     */
    waitUntilReady() {
        return this.backend.waitUntilReady();
    }
    /**
     * Returns the datastore backend that powers this instance.
     *
     * The backend owns its connection(s) and exposes every datastore-agnostic
     * operation through {@link IQueueBackend}. Datastore-specific escape hatches
     * (e.g. the raw Redis client) live on the concrete backend implementation,
     * and are exposed here when the class is parameterized on that concrete
     * backend type (the default for the built-in, Redis-backed classes).
     */
    getBackend() {
        return this.backend;
    }
    createBackend() {
        this.backend = this.backendFactory(this.name, this.opts, {
            blocking: this.hasBlockingConnection,
        });
    }
    /**
     * Helper to easily extend Job class calls.
     */
    get Job() {
        return job_1.Job;
    }
    /**
     * Emits an event. Normally used by subclasses to emit events.
     *
     * @param event - The emitted event.
     * @param args - The arguments to pass to the event listeners.
     * @returns True if the event had listeners, false otherwise.
     */
    emit(event, ...args) {
        try {
            return super.emit(event, ...args);
        }
        catch (err) {
            try {
                return super.emit('error', err);
            }
            catch (err) {
                // We give up if the error event also throws an exception.
                console.error(err);
                return false;
            }
        }
    }
    base64Name() {
        return Buffer.from(this.name).toString('base64');
    }
    clientName(suffix = '') {
        return this.backend.clientName(suffix);
    }
    /**
     *
     * Closes the connection and returns a promise that resolves when the connection is closed.
     */
    async close() {
        if (!this.closing) {
            this.closing = this.backend.close();
        }
        await this.closing;
        this.closed = true;
    }
    /**
     *
     * Force disconnects a connection.
     */
    disconnect() {
        return this.backend.disconnect();
    }
    async checkConnectionError(fn, delayInMs = utils_1.DELAY_TIME_5) {
        try {
            return await fn();
        }
        catch (error) {
            if ((0, utils_1.isNotConnectionError)(error)) {
                this.emit('error', error);
            }
            if (!this.closing && delayInMs) {
                await (0, utils_1.delay)(delayInMs);
            }
            else {
                return;
            }
        }
    }
    /**
     * Wraps the code with telemetry and provides a span for configuration.
     *
     * @param spanKind - kind of the span: Producer, Consumer, Internal
     * @param operation - operation name (such as add, process, etc)
     * @param destination - destination name (normally the queue name)
     * @param callback - code to wrap with telemetry
     * @param srcPropagationMetadata - The source propagation metadata for telemetry context.
     * @returns The result of the callback function.
     */
    trace(spanKind, operation, destination, callback, srcPropagationMetadata) {
        return (0, utils_1.trace)(this.opts.telemetry, spanKind, this.name, operation, destination, callback, srcPropagationMetadata);
    }
}
exports.QueueBase = QueueBase;
