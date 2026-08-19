import { __rest } from "tslib";
import { CronExpressionParser } from 'cron-parser';
import { Job } from './job';
import { QueueBase } from './queue-base';
import { SpanKind, TelemetryAttributes } from '../enums';
import { array2obj } from '../utils';
export const LEGACY_REPEATABLE_JOBS_MIGRATION_URL = 'https://docs.bullmq.io/guide/migrations/migrate-from-v5-to-v6';
/**
 * Legacy repeatable job keys use the format `name:id:endDate:tz:pattern`.
 * The suffix after `name:id:endDate:tz:` is either:
 * - a cron pattern (contains spaces), or
 * - an `every` interval (purely numeric).
 */
/**
 * Returns true when key[from..to) is composed only of ASCII digits.
 */
function isNumericSegment(key, from, to) {
    if (from >= to) {
        return false;
    }
    for (let i = from; i < to; i++) {
        const charCode = key.charCodeAt(i);
        if (charCode < 48 || charCode > 57) {
            return false;
        }
    }
    return true;
}
export function hasLegacyRepeatableKeyShape(key) {
    const firstColon = key.indexOf(':');
    if (firstColon === -1) {
        return false;
    }
    const secondColon = key.indexOf(':', firstColon + 1);
    if (secondColon === -1) {
        return false;
    }
    const thirdColon = key.indexOf(':', secondColon + 1);
    if (thirdColon === -1) {
        return false;
    }
    const fourthColon = key.indexOf(':', thirdColon + 1);
    if (fourthColon === -1) {
        return false;
    }
    // endDate can be empty or numeric in legacy keys.
    if (secondColon + 1 < thirdColon &&
        !isNumericSegment(key, secondColon + 1, thirdColon)) {
        return false;
    }
    const suffixStart = fourthColon + 1;
    if (suffixStart >= key.length) {
        return false;
    }
    if (key.indexOf(' ', suffixStart) !== -1) {
        return true;
    }
    return isNumericSegment(key, suffixStart, key.length);
}
export const isLegacyRepeatableJobKey = hasLegacyRepeatableKeyShape;
export function getLegacyRepeatableJobError(key) {
    return new Error(`Legacy repeatable job metadata is not supported in BullMQ v6 ` +
        `(key: "${key}"). Migrate legacy repeatable jobs to Job Schedulers ` +
        `before upgrading. See ${LEGACY_REPEATABLE_JOBS_MIGRATION_URL}`);
}
export class JobScheduler extends QueueBase {
    constructor(name, opts, backendFactory) {
        super(name, opts, backendFactory);
        this.repeatStrategy =
            (opts.settings && opts.settings.repeatStrategy) || defaultRepeatStrategy;
    }
    async upsertJobScheduler(jobSchedulerId, repeatOpts, jobName, jobData, opts, { override, producerId }) {
        const { every, limit, pattern, offset } = repeatOpts;
        if (pattern && every) {
            throw new Error('Both .pattern and .every options are defined for this repeatable job');
        }
        if (!pattern && !every) {
            throw new Error('Either .pattern or .every options must be defined for this repeatable job');
        }
        if (repeatOpts.immediately && repeatOpts.startDate) {
            throw new Error('Both .immediately and .startDate options are defined for this repeatable job');
        }
        if (repeatOpts.immediately && repeatOpts.every) {
            console.warn("Using option immediately with every does not affect the job's schedule. Job will run immediately anyway.");
        }
        if (Object.prototype.hasOwnProperty.call(opts, 'debounce')) {
            throw new Error('Debounce option has been removed. Use deduplication option instead');
        }
        // Check if we reached the limit of the repeatable job's iterations
        const iterationCount = repeatOpts.count ? repeatOpts.count + 1 : 1;
        if (typeof repeatOpts.limit !== 'undefined' &&
            iterationCount > repeatOpts.limit) {
            return;
        }
        // Check if we reached the end date of the repeatable job
        let now = Date.now();
        const { endDate } = repeatOpts;
        if (endDate && now > new Date(endDate).getTime()) {
            return;
        }
        const prevMillis = opts.prevMillis || 0;
        now = prevMillis < now ? now : prevMillis;
        // Check if we have a start date for the repeatable job
        const { immediately } = repeatOpts, filteredRepeatOpts = __rest(repeatOpts, ["immediately"]);
        let nextMillis;
        const newOffset = every && offset ? offset : null;
        if (pattern) {
            nextMillis = await this.repeatStrategy(now, repeatOpts, jobName);
            if (nextMillis < now) {
                nextMillis = now;
            }
        }
        if (nextMillis || every) {
            return this.trace(SpanKind.PRODUCER, 'add', `${this.name}.${jobName}`, async (span, srcPropagationMetadata) => {
                var _a, _b;
                let telemetry = opts.telemetry;
                if (srcPropagationMetadata) {
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
                const mergedOpts = this.getNextJobOpts(nextMillis, jobSchedulerId, Object.assign(Object.assign({}, opts), { repeat: filteredRepeatOpts, telemetry }), iterationCount, newOffset);
                if (override) {
                    // Clamp nextMillis to now if it's in the past
                    if (nextMillis < now) {
                        nextMillis = now;
                    }
                    const [jobId, delay] = await this.backend.addJobScheduler(jobSchedulerId, nextMillis, JSON.stringify(typeof jobData === 'undefined' ? {} : jobData), opts, {
                        name: jobName,
                        startDate: repeatOpts.startDate
                            ? new Date(repeatOpts.startDate).getTime()
                            : undefined,
                        endDate: endDate ? new Date(endDate).getTime() : undefined,
                        tz: repeatOpts.tz,
                        pattern,
                        every,
                        limit,
                        offset: newOffset,
                    }, mergedOpts, producerId);
                    // Ensure delay is a number (Dragonflydb may return it as a string)
                    const numericDelay = typeof delay === 'string' ? parseInt(delay, 10) : delay;
                    const job = new this.Job(this, jobName, jobData, Object.assign(Object.assign({}, mergedOpts), { delay: numericDelay }), jobId);
                    job.id = jobId;
                    span === null || span === void 0 ? void 0 : span.setAttributes({
                        [TelemetryAttributes.JobSchedulerId]: jobSchedulerId,
                        [TelemetryAttributes.JobId]: job.id,
                    });
                    return job;
                }
                else {
                    const jobId = await this.backend.updateJobSchedulerNextMillis(jobSchedulerId, nextMillis, JSON.stringify(typeof jobData === 'undefined' ? {} : jobData), mergedOpts, producerId);
                    if (jobId) {
                        const job = new this.Job(this, jobName, jobData, mergedOpts, jobId);
                        job.id = jobId;
                        span === null || span === void 0 ? void 0 : span.setAttributes({
                            [TelemetryAttributes.JobSchedulerId]: jobSchedulerId,
                            [TelemetryAttributes.JobId]: job.id,
                        });
                        return job;
                    }
                }
            });
        }
    }
    getNextJobOpts(nextMillis, jobSchedulerId, opts, currentCount, offset) {
        var _a, _b;
        //
        // Generate unique job id for this iteration.
        //
        const jobId = this.getSchedulerNextJobId({
            jobSchedulerId,
            nextMillis,
        });
        const now = Date.now();
        const delay = nextMillis + offset - now;
        const mergedOpts = Object.assign(Object.assign({}, opts), { jobId, delay: delay < 0 ? 0 : delay, timestamp: now, prevMillis: nextMillis, repeatJobKey: jobSchedulerId });
        mergedOpts.repeat = Object.assign(Object.assign({}, opts.repeat), { offset, count: currentCount, startDate: ((_a = opts.repeat) === null || _a === void 0 ? void 0 : _a.startDate)
                ? new Date(opts.repeat.startDate).getTime()
                : undefined, endDate: ((_b = opts.repeat) === null || _b === void 0 ? void 0 : _b.endDate)
                ? new Date(opts.repeat.endDate).getTime()
                : undefined });
        return mergedOpts;
    }
    async removeJobScheduler(jobSchedulerId) {
        return this.backend.removeJobScheduler(jobSchedulerId);
    }
    async getSchedulerData(key, next) {
        const jobData = await this.backend.getJobSchedulerData(key);
        const scheduler = this.transformSchedulerData(key, jobData, next);
        if (!scheduler) {
            await this.backend.removeJobScheduler(key);
        }
        return scheduler;
    }
    transformSchedulerData(key, jobData, next) {
        if (jobData && Object.keys(jobData).length > 0) {
            const jobSchedulerData = {
                key,
                name: jobData.name,
                next,
            };
            if (jobData.ic) {
                jobSchedulerData.iterationCount = parseInt(jobData.ic);
            }
            if (jobData.limit) {
                jobSchedulerData.limit = parseInt(jobData.limit);
            }
            if (jobData.startDate) {
                jobSchedulerData.startDate = parseInt(jobData.startDate);
            }
            if (jobData.endDate) {
                jobSchedulerData.endDate = parseInt(jobData.endDate);
            }
            if (jobData.tz) {
                jobSchedulerData.tz = jobData.tz;
            }
            if (jobData.pattern) {
                jobSchedulerData.pattern = jobData.pattern;
            }
            if (jobData.every) {
                jobSchedulerData.every = parseInt(jobData.every);
            }
            if (jobData.offset) {
                jobSchedulerData.offset = parseInt(jobData.offset);
            }
            if (jobData.data || jobData.opts) {
                jobSchedulerData.template = this.getTemplateFromJSON(jobData.data, jobData.opts);
            }
            return jobSchedulerData;
        }
        if (hasLegacyRepeatableKeyShape(key)) {
            throw getLegacyRepeatableJobError(key);
        }
        return undefined;
    }
    /**
     * Checks if a given id corresponds to a registered job scheduler.
     *
     * This is used to disambiguate between new job scheduler ids (which may
     * contain any number of colon segments) and legacy repeatable job keys
     * (which always contain 5+ colon segments). Relying purely on segment
     * count is not safe because a user-provided jobSchedulerId may itself
     * contain 5+ colon segments, which would otherwise be misclassified as
     * a legacy repeatable key.
     *
     * We cannot use ZSCORE on the shared `repeat` sorted set because legacy
     * repeatable jobs are stored in the same sorted set and would be reported
     * as schedulers. Instead, we probe the per-id metadata hash (`repeat:<id>`)
     * for the `ic` (iteration count) field, which is written exclusively by
     * `storeJobScheduler` and is never set by the legacy `addRepeatableJob`
     * flow.
     */
    async isJobScheduler(id) {
        return this.backend.isJobScheduler(id);
    }
    async getScheduler(id) {
        const [rawJobData, next] = await this.backend.getJobScheduler(id);
        return this.transformSchedulerData(id, rawJobData ? array2obj(rawJobData) : null, next ? parseInt(next) : null);
    }
    getTemplateFromJSON(rawData, rawOpts) {
        const template = {};
        if (rawData) {
            template.data = JSON.parse(rawData);
        }
        if (rawOpts) {
            template.opts = Job.optsFromJSON(rawOpts);
        }
        return template;
    }
    async getJobSchedulers(start = 0, end = -1, asc = false) {
        const result = await this.backend.getJobSchedulersRange(start, end, asc);
        const jobs = [];
        for (let i = 0; i < result.length; i += 2) {
            jobs.push(this.getSchedulerData(result[i], parseInt(result[i + 1])));
        }
        return (await Promise.all(jobs)).filter((job) => !!job);
    }
    async getSchedulersCount() {
        return this.backend.getJobSchedulersCount();
    }
    getSchedulerNextJobId({ nextMillis, jobSchedulerId, }) {
        return `repeat:${jobSchedulerId}:${nextMillis}`;
    }
}
export const defaultRepeatStrategy = (millis, opts) => {
    const { pattern } = opts;
    const dateFromMillis = new Date(millis);
    const startDate = opts.startDate && new Date(opts.startDate);
    const currentDate = startDate > dateFromMillis ? startDate : dateFromMillis;
    const interval = CronExpressionParser.parse(pattern, Object.assign(Object.assign({}, opts), { currentDate }));
    try {
        if (opts.immediately) {
            return new Date().getTime();
        }
        else {
            return interval.next().getTime();
        }
    }
    catch (e) {
        // Ignore error
    }
};
/**
 * Computes the next execution time (in ms since epoch) for the given repeat
 * options, supporting both `.every` (fixed interval) and `.pattern` (cron)
 * strategies. This is the default repeat strategy used to schedule the next
 * iteration of a job scheduler.
 */
export const getNextMillis = (millis, opts) => {
    const pattern = opts.pattern;
    if (pattern && opts.every) {
        throw new Error('Both .pattern and .every options are defined for this repeatable job');
    }
    if (opts.every) {
        return (Math.floor(millis / opts.every) * opts.every +
            (opts.immediately ? 0 : opts.every));
    }
    const currentDate = opts.startDate && new Date(opts.startDate) > new Date(millis)
        ? new Date(opts.startDate)
        : new Date(millis);
    const interval = CronExpressionParser.parse(pattern, Object.assign(Object.assign({}, opts), { currentDate }));
    try {
        if (opts.immediately) {
            return new Date().getTime();
        }
        else {
            return interval.next().getTime();
        }
    }
    catch (e) {
        // Ignore error
    }
};
