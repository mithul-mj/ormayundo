import { EventEmitter } from 'events';
import { BackendFactory, FlowJob, FlowProducerOptions, FlowQueuesOpts, FlowOpts, IoredisListener, IQueueBackend, JobJson, ParentKeyOpts, ParentOptions, Tracer, ContextManager } from '../interfaces';
import { Job } from './job';
import { RedisQueueBackend } from './redis-queue-backend';
import { KeysMap } from './queue-keys';
/**
 * A single job insert collected while walking a flow tree, ready to be handed
 * to the backend's atomic {@link IQueueBackend.addFlow} operation.
 */
export interface FlowJobEntry {
    jobData: JobJson;
    jobId: string;
    parentKeyOpts: ParentKeyOpts;
    prefix: string;
    queueName: string;
}
export interface AddNodeOpts {
    entries: FlowJobEntry[];
    node: FlowJob;
    parent?: {
        parentOpts: ParentOptions;
        parentDependenciesKey: string;
    };
    /**
     * Queues options that will be applied in each node depending on queue name presence.
     */
    queuesOpts?: FlowQueuesOpts;
}
export interface AddChildrenOpts {
    entries: FlowJobEntry[];
    nodes: FlowJob[];
    parent: {
        parentOpts: ParentOptions;
        parentDependenciesKey: string;
    };
    queuesOpts?: FlowQueuesOpts;
}
export interface NodeOpts {
    /**
     * Root job queue name.
     */
    queueName: string;
    /**
     * Prefix included in job key.
     */
    prefix?: string;
    /**
     * Root job id.
     */
    id: string;
    /**
     * Maximum depth or levels to visit in the tree.
     */
    depth?: number;
    /**
     * Maximum quantity of children per type (processed, unprocessed).
     */
    maxChildren?: number;
}
export interface JobNode {
    job: Job;
    children?: JobNode[];
}
export interface FlowProducerListener extends IoredisListener {
    /**
     * Listen to 'error' event.
     *
     * This event is triggered when an error is throw.
     */
    error: (failedReason: Error) => void;
}
/**
 * This class allows to add jobs with dependencies between them in such
 * a way that it is possible to build complex flows.
 * Note: A flow is a tree-like structure of jobs that depend on each other.
 * Whenever the children of a given parent are completed, the parent
 * will be processed, being able to access the children's result data.
 * All Jobs can be in different queues, either children or parents,
 */
export declare class FlowProducer<B extends IQueueBackend = RedisQueueBackend> extends EventEmitter {
    opts: FlowProducerOptions;
    toKey: (name: string, type: string) => string;
    keys: KeysMap;
    closing: Promise<void> | undefined;
    protected backend: B;
    protected telemetry: {
        tracer: Tracer | undefined;
        contextManager: ContextManager | undefined;
    };
    constructor(opts?: FlowProducerOptions, backendFactory?: BackendFactory<B>);
    emit<U extends keyof FlowProducerListener>(event: U, ...args: Parameters<FlowProducerListener[U]>): boolean;
    off<U extends keyof FlowProducerListener>(eventName: U, listener: FlowProducerListener[U]): this;
    on<U extends keyof FlowProducerListener>(event: U, listener: FlowProducerListener[U]): this;
    once<U extends keyof FlowProducerListener>(event: U, listener: FlowProducerListener[U]): this;
    /**
     * Helper to easily extend Job class calls.
     */
    protected get Job(): typeof Job;
    waitUntilReady(): Promise<void>;
    /**
     * Returns the datastore backend that powers this flow producer.
     *
     * The backend owns its connection and exposes every datastore-agnostic
     * operation through {@link IQueueBackend}. Datastore-specific escape hatches
     * (e.g. the raw Redis client) live on the concrete backend implementation,
     * and are exposed here when the flow producer is parameterized on that
     * concrete backend type (the default is the Redis backend).
     */
    getBackend(): B;
    /**
     * Adds a flow.
     *
     * This call would be atomic, either it fails and no jobs will
     * be added to the queues, or it succeeds and all jobs will be added.
     *
     * @param flow - an object with a tree-like structure where children jobs
     * will be processed before their parents.
     * @param opts - options that will be applied to the flow object.
     */
    add(flow: FlowJob, opts?: FlowOpts): Promise<JobNode>;
    /**
     * Get a flow.
     *
     * @param opts - an object with options for getting a JobNode.
     */
    getFlow(opts: NodeOpts): Promise<JobNode>;
    /**
     * Adds multiple flows.
     *
     * A flow is a tree-like structure of jobs that depend on each other.
     * Whenever the children of a given parent are completed, the parent
     * will be processed, being able to access the children's result data.
     *
     * All Jobs can be in different queues, either children or parents,
     * however this call would be atomic, either it fails and no jobs will
     * be added to the queues, or it succeeds and all jobs will be added.
     *
     * @param flows - an array of objects with a tree-like structure where children jobs
     * will be processed before their parents.
     */
    addBulk(flows: FlowJob[]): Promise<JobNode[]>;
    /**
     * Add a node (job) of a flow to the queue. This method will recursively
     * add all its children as well. Note that a given job can potentially be
     * a parent and a child job at the same time depending on where it is located
     * in the tree hierarchy.
     *
     * @param multi - IRedisTransaction
     * @param node - the node representing a job to be added to some queue
     * @param parent - parent data sent to children to create the "links" to their parent
     * @returns
     */
    protected addNode({ entries, node, parent, queuesOpts, }: AddNodeOpts): Promise<JobNode>;
    /**
     * Adds nodes (jobs) of multiple flows to the queue. This method will recursively
     * add all its children as well. Note that a given job can potentially be
     * a parent and a child job at the same time depending on where it is located
     * in the tree hierarchy.
     *
     * @param multi - IRedisTransaction
     * @param nodes - the nodes representing jobs to be added to some queue
     * @returns
     */
    /**
     * Collects a single job insert for a flow, preserving the same await point
     * as the previous transaction-based insert so that the relative order of
     * entries (in particular, roots before their descendants) is unchanged.
     */
    private collectFlowEntry;
    protected addNodes(entries: FlowJobEntry[], nodes: FlowJob[]): Promise<JobNode[]>;
    private getNode;
    private validateFlowJobs;
    private addChildren;
    private getChildren;
    /**
     * Helper factory method that creates a queue-like object
     * required to create jobs in any queue.
     *
     * @param node - The flow node containing the queue name and other job options.
     * @param prefix - The key prefix for the queue (honored by the Redis backend only).
     * @returns A queue-like object with the keys, identity and backend needed to create jobs.
     */
    private queueFromNode;
    /**
     * Translates numeric addJob Lua error codes returned by root flow exec.
     *
     * @param code - Numeric error code returned from Redis.
     * @param parentKey - Parent key for contextual error messages.
     */
    private toFlowError;
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
}
