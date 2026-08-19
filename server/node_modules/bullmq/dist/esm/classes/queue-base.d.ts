import { EventEmitter } from 'events';
import { BackendFactory, IQueueBackend, MinimalQueue, QueueBaseOptions, Span } from '../interfaces';
import { Job } from './job';
import { KeysMap } from './queue-keys';
import { SpanKind } from '../enums';
/**
 * Base class for all classes that need to interact with queues.
 * This class is normally not used directly, but extended by the other classes.
 *
 */
export declare class QueueBase<B extends IQueueBackend = IQueueBackend> extends EventEmitter implements MinimalQueue {
    readonly name: string;
    opts: QueueBaseOptions;
    toKey: (type: string) => string;
    keys: KeysMap;
    closing: Promise<void> | undefined;
    protected closed: boolean;
    protected hasBlockingConnection: boolean;
    backend: B;
    protected readonly backendFactory: BackendFactory<B>;
    readonly qualifiedName: string;
    /**
     *
     * @param name - The name of the queue.
     * @param opts - Options for the queue.
     * @param backendFactory - Factory used to build the {@link IQueueBackend}.
     * Defaults to the Redis backend; inject a different factory to use another
     * datastore or a test mock.
     */
    constructor(name: string, opts?: QueueBaseOptions, backendFactory?: BackendFactory<B>, hasBlockingConnection?: boolean);
    /**
     * Resolves once the underlying backend (and its connection) is ready.
     */
    waitUntilReady(): Promise<void>;
    /**
     * Returns the datastore backend that powers this instance.
     *
     * The backend owns its connection(s) and exposes every datastore-agnostic
     * operation through {@link IQueueBackend}. Datastore-specific escape hatches
     * (e.g. the raw Redis client) live on the concrete backend implementation,
     * and are exposed here when the class is parameterized on that concrete
     * backend type (the default for the built-in, Redis-backed classes).
     */
    getBackend(): B;
    protected createBackend(): void;
    /**
     * Helper to easily extend Job class calls.
     */
    protected get Job(): typeof Job;
    /**
     * Emits an event. Normally used by subclasses to emit events.
     *
     * @param event - The emitted event.
     * @param args - The arguments to pass to the event listeners.
     * @returns True if the event had listeners, false otherwise.
     */
    emit(event: string | symbol, ...args: any[]): boolean;
    protected base64Name(): string;
    protected clientName(suffix?: string): string;
    /**
     *
     * Closes the connection and returns a promise that resolves when the connection is closed.
     */
    close(): Promise<void>;
    /**
     *
     * Force disconnects a connection.
     */
    disconnect(): Promise<void>;
    protected checkConnectionError<T>(fn: () => Promise<T>, delayInMs?: number): Promise<T | undefined>;
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
    trace<T>(spanKind: SpanKind, operation: string, destination: string, callback: (span?: Span, dstPropagationMetadata?: string) => Promise<T> | T, srcPropagationMetadata?: string): Promise<T | Promise<T>>;
}
