import { EventEmitter } from 'events';
import { getParentKey, randomUUID, trace } from '../utils';
import { getDefaultBackendFactory } from '../utils/create-backend';
import { Job } from './job';
import { ErrorCode, SpanKind, TelemetryAttributes } from '../enums';
/**
 * This class allows to add jobs with dependencies between them in such
 * a way that it is possible to build complex flows.
 * Note: A flow is a tree-like structure of jobs that depend on each other.
 * Whenever the children of a given parent are completed, the parent
 * will be processed, being able to access the children's result data.
 * All Jobs can be in different queues, either children or parents,
 */
export class FlowProducer extends EventEmitter {
    constructor(opts = { connection: {} }, backendFactory = getDefaultBackendFactory()) {
        super();
        this.opts = opts;
        this.opts = Object.assign({}, opts);
        // The flow producer is not bound to a single queue: each flow entry carries
        // its own queue identity, so the backend is created with an empty name.
        this.backend = backendFactory('', this.opts);
        this.backend.on('error', (error) => {
            if (this.listenerCount('error') > 0) {
                this.emit('error', error);
            }
        });
        this.backend.on('close', () => {
            if (!this.closing) {
                this.emit('ioredis:close');
            }
        });
        if (opts === null || opts === void 0 ? void 0 : opts.telemetry) {
            this.telemetry = opts.telemetry;
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
     * Helper to easily extend Job class calls.
     */
    get Job() {
        return Job;
    }
    waitUntilReady() {
        return this.backend.waitUntilReady();
    }
    /**
     * Returns the datastore backend that powers this flow producer.
     *
     * The backend owns its connection and exposes every datastore-agnostic
     * operation through {@link IQueueBackend}. Datastore-specific escape hatches
     * (e.g. the raw Redis client) live on the concrete backend implementation,
     * and are exposed here when the flow producer is parameterized on that
     * concrete backend type (the default is the Redis backend).
     */
    getBackend() {
        return this.backend;
    }
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
    async add(flow, opts) {
        if (this.closing) {
            return;
        }
        this.validateFlowJobs([flow]);
        // Ensure the backend (and thus the connection) is ready before building
        // the per-node queue contexts used to create jobs.
        await this.backend.waitUntilReady();
        const flowOpts = flow === null || flow === void 0 ? void 0 : flow.opts;
        const parentOpts = flowOpts && 'parent' in flowOpts ? flowOpts.parent : undefined;
        const parentKey = getParentKey(parentOpts);
        const parentDependenciesKey = parentKey
            ? `${parentKey}:dependencies`
            : undefined;
        return trace(this.telemetry, SpanKind.PRODUCER, flow.queueName, 'addFlow', flow.queueName, async (span) => {
            span === null || span === void 0 ? void 0 : span.setAttributes({
                [TelemetryAttributes.FlowName]: flow.name,
            });
            const entries = [];
            const jobsTree = await this.addNode({
                entries,
                node: flow,
                queuesOpts: opts === null || opts === void 0 ? void 0 : opts.queuesOptions,
                parent: {
                    parentOpts,
                    parentDependenciesKey,
                },
            });
            const results = await this.backend.addFlow(entries);
            const [result] = results || [];
            if (result) {
                const [err, jobId] = result;
                if (err) {
                    throw err;
                }
                if (typeof jobId === 'number' && jobId < 0) {
                    throw this.toFlowError(jobId, parentKey);
                }
                if (typeof jobId === 'string') {
                    jobsTree.job.id = jobId;
                }
            }
            return jobsTree;
        });
    }
    /**
     * Get a flow.
     *
     * @param opts - an object with options for getting a JobNode.
     */
    async getFlow(opts) {
        if (this.closing) {
            return;
        }
        await this.backend.waitUntilReady();
        const updatedOpts = Object.assign({
            depth: 10,
            maxChildren: 20,
            prefix: this.opts.prefix,
        }, opts);
        const jobsTree = this.getNode(updatedOpts);
        return jobsTree;
    }
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
    async addBulk(flows) {
        if (this.closing) {
            return;
        }
        this.validateFlowJobs(flows);
        // Ensure the backend (and thus the connection) is ready before building
        // the per-node queue contexts used to create jobs.
        await this.backend.waitUntilReady();
        return trace(this.telemetry, SpanKind.PRODUCER, '', 'addBulkFlows', '', async (span) => {
            span === null || span === void 0 ? void 0 : span.setAttributes({
                [TelemetryAttributes.BulkCount]: flows.length,
                [TelemetryAttributes.BulkNames]: flows
                    .map(flow => flow.name)
                    .join(','),
            });
            const entries = [];
            const jobsTrees = await this.addNodes(entries, flows);
            const results = await this.backend.addFlow(entries);
            for (let index = 0; index < jobsTrees.length; ++index) {
                const result = results === null || results === void 0 ? void 0 : results[index];
                if (!result) {
                    continue;
                }
                const [err, jobId] = result;
                if (!err && typeof jobId === 'string') {
                    jobsTrees[index].job.id = jobId;
                }
            }
            return jobsTrees;
        });
    }
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
    async addNode({ entries, node, parent, queuesOpts, }) {
        var _a, _b;
        const prefix = node.prefix || this.opts.prefix;
        const queue = this.queueFromNode(node, prefix);
        const queueOpts = queuesOpts && queuesOpts[node.queueName];
        const jobsOpts = (_a = queueOpts === null || queueOpts === void 0 ? void 0 : queueOpts.defaultJobOptions) !== null && _a !== void 0 ? _a : {};
        const jobId = ((_b = node.opts) === null || _b === void 0 ? void 0 : _b.jobId) || randomUUID();
        return trace(this.telemetry, SpanKind.PRODUCER, node.queueName, 'addNode', node.queueName, async (span, srcPropagationMetadata) => {
            var _a, _b;
            span === null || span === void 0 ? void 0 : span.setAttributes({
                [TelemetryAttributes.JobName]: node.name,
                [TelemetryAttributes.JobId]: jobId,
            });
            const opts = node.opts;
            let telemetry = opts === null || opts === void 0 ? void 0 : opts.telemetry;
            if (srcPropagationMetadata && opts) {
                const omitContext = (_a = opts.telemetry) === null || _a === void 0 ? void 0 : _a.omitContext;
                const telemetryMetadata = ((_b = opts.telemetry) === null || _b === void 0 ? void 0 : _b.metadata) ||
                    (!omitContext && srcPropagationMetadata);
                if (telemetryMetadata || omitContext) {
                    telemetry = {
                        metadata: telemetryMetadata,
                        omitContext,
                    };
                }
            }
            const job = new this.Job(queue, node.name, node.data, Object.assign(Object.assign(Object.assign({}, jobsOpts), opts), { parent: parent === null || parent === void 0 ? void 0 : parent.parentOpts, telemetry }), jobId);
            const parentKey = getParentKey(parent === null || parent === void 0 ? void 0 : parent.parentOpts);
            if (node.children && node.children.length > 0) {
                // Create the parent job, it will be a job in status "waiting-children".
                const parentId = jobId;
                await this.collectFlowEntry(entries, job, {
                    parentDependenciesKey: parent === null || parent === void 0 ? void 0 : parent.parentDependenciesKey,
                    addToWaitingChildren: true,
                    parentKey,
                });
                // Queue identity is owned by the backend (the `queue` object above is
                // bound to this node's queue via the backend's `forQueue`).
                const parentDependenciesKey = `${queue.toKey(parentId)}:dependencies`;
                const children = await this.addChildren({
                    entries,
                    nodes: node.children,
                    parent: {
                        parentOpts: {
                            id: parentId,
                            queue: queue.qualifiedName,
                        },
                        parentDependenciesKey,
                    },
                    queuesOpts,
                });
                return { job, children };
            }
            else {
                await this.collectFlowEntry(entries, job, {
                    parentDependenciesKey: parent === null || parent === void 0 ? void 0 : parent.parentDependenciesKey,
                    parentKey,
                });
                return { job };
            }
        });
    }
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
    async collectFlowEntry(entries, job, parentOpts) {
        entries.push(job.toFlowEntry(parentOpts));
    }
    addNodes(entries, nodes) {
        return Promise.all(nodes.map(node => {
            const nodeOpts = node === null || node === void 0 ? void 0 : node.opts;
            const parentOpts = nodeOpts && 'parent' in nodeOpts ? nodeOpts.parent : undefined;
            const parentKey = getParentKey(parentOpts);
            const parentDependenciesKey = parentKey
                ? `${parentKey}:dependencies`
                : undefined;
            return this.addNode({
                entries,
                node,
                parent: {
                    parentOpts,
                    parentDependenciesKey,
                },
            });
        }));
    }
    async getNode(node) {
        const queue = this.queueFromNode(node, node.prefix);
        const job = await this.Job.fromId(queue, node.id);
        if (job) {
            const { processed = {}, unprocessed = [], failed = [], ignored = {}, } = await job.getDependencies({
                failed: {
                    count: node.maxChildren,
                },
                processed: {
                    count: node.maxChildren,
                },
                unprocessed: {
                    count: node.maxChildren,
                },
                ignored: {
                    count: node.maxChildren,
                },
            });
            const processedKeys = Object.keys(processed);
            const ignoredKeys = Object.keys(ignored);
            const childrenCount = processedKeys.length +
                unprocessed.length +
                ignoredKeys.length +
                failed.length;
            const newDepth = node.depth - 1;
            if (childrenCount > 0 && newDepth) {
                const children = await this.getChildren([...processedKeys, ...unprocessed, ...failed, ...ignoredKeys], newDepth, node.maxChildren);
                return { job, children };
            }
            else {
                return { job };
            }
        }
    }
    validateFlowJobs(nodes) {
        for (const node of nodes) {
            const children = node.children;
            if (children && children.length > 0) {
                const nodeOpts = node.opts;
                const hasDeduplication = nodeOpts && 'deduplication' in nodeOpts && nodeOpts.deduplication;
                if (hasDeduplication) {
                    throw new Error('Deduplication options cannot be used on flow nodes with children');
                }
                this.validateFlowJobs(children);
            }
        }
    }
    addChildren({ entries, nodes, parent, queuesOpts }) {
        return Promise.all(nodes.map(node => this.addNode({ entries, node, parent, queuesOpts })));
    }
    getChildren(childrenKeys, depth, maxChildren) {
        const getChild = (key) => {
            const { prefix, queueName, id } = this.backend.parseNodeKey(key);
            return this.getNode({
                id,
                queueName,
                prefix,
                depth,
                maxChildren,
            });
        };
        return Promise.all([...childrenKeys.map(getChild)]);
    }
    /**
     * Helper factory method that creates a queue-like object
     * required to create jobs in any queue.
     *
     * @param node - The flow node containing the queue name and other job options.
     * @param prefix - The key prefix for the queue (honored by the Redis backend only).
     * @returns A queue-like object with the keys, identity and backend needed to create jobs.
     */
    queueFromNode(node, prefix) {
        // Queue identity and key building are owned by the backend (the Redis
        // backend encodes the key `prefix`; other backends format their own
        // identity). The flow's own backend is queue-agnostic, so we ask it for a
        // sibling bound to this node's queue.
        const backend = this.backend.forQueue(node.queueName, prefix);
        return {
            name: node.queueName,
            keys: backend.keys,
            toKey: (type) => backend.toKey(type),
            opts: { prefix, connection: {} },
            qualifiedName: backend.qualifiedName,
            closing: this.closing,
            backend,
            waitUntilReady: async () => {
                await this.backend.waitUntilReady();
            },
            removeListener: this.removeListener.bind(this),
            emit: this.emit.bind(this),
            on: this.on.bind(this),
            trace: async () => { },
        };
    }
    /**
     * Translates numeric addJob Lua error codes returned by root flow exec.
     *
     * @param code - Numeric error code returned from Redis.
     * @param parentKey - Parent key for contextual error messages.
     */
    toFlowError(code, parentKey) {
        let error;
        switch (code) {
            case ErrorCode.ParentJobNotExist:
                error = new Error(`Missing key for parent job ${parentKey}. addJob`);
                break;
            case ErrorCode.ParentJobCannotBeReplaced:
                error = new Error(`The parent job ${parentKey} cannot be replaced. addJob`);
                break;
            default:
                error = new Error(`Unknown code ${code} error for addJob`);
        }
        error.code = code;
        return error;
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
    }
    /**
     *
     * Force disconnects a connection.
     */
    disconnect() {
        return this.backend.disconnect();
    }
}
