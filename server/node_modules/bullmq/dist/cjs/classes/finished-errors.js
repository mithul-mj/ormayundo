"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishedErrors = finishedErrors;
const enums_1 = require("../enums");
const unrecoverable_error_1 = require("./errors/unrecoverable-error");
/**
 * Builds the canonical `Error` for a negative status code returned by a backend
 * operation (Lua script, SQL function, …). Shared by every backend so that the
 * error messages a caller sees are identical regardless of the datastore.
 *
 * The resulting error carries the numeric `code` so callers can branch on it.
 */
function finishedErrors({ code, jobId, parentKey, command, state, }) {
    let error;
    switch (code) {
        case enums_1.ErrorCode.JobNotExist:
            error = new Error(`Missing key for job ${jobId}. ${command}`);
            break;
        case enums_1.ErrorCode.JobLockNotExist:
            error = new Error(`Missing lock for job ${jobId}. ${command}`);
            break;
        case enums_1.ErrorCode.JobNotInState:
            error = new Error(`Job ${jobId} is not in the ${state} state. ${command}`);
            break;
        case enums_1.ErrorCode.JobPendingChildren:
            error = new Error(`Job ${jobId} has pending dependencies. ${command}`);
            break;
        case enums_1.ErrorCode.ParentJobNotExist:
            error = new Error(`Missing key for parent job ${parentKey}. ${command}`);
            break;
        case enums_1.ErrorCode.JobLockMismatch:
            error = new Error(`Lock mismatch for job ${jobId}. Cmd ${command} from ${state}`);
            break;
        case enums_1.ErrorCode.ParentJobCannotBeReplaced:
            error = new Error(`The parent job ${parentKey} cannot be replaced. ${command}`);
            break;
        case enums_1.ErrorCode.JobBelongsToJobScheduler:
            error = new Error(`Job ${jobId} belongs to a job scheduler and cannot be removed directly. ${command}`);
            break;
        case enums_1.ErrorCode.JobHasFailedChildren:
            error = new unrecoverable_error_1.UnrecoverableError(`Cannot complete job ${jobId} because it has at least one failed child. ${command}`);
            break;
        case enums_1.ErrorCode.SchedulerJobIdCollision:
            error = new Error(`Cannot create job scheduler iteration - job ID already exists. ${command}`);
            break;
        case enums_1.ErrorCode.SchedulerJobSlotsBusy:
            error = new Error(`Cannot create job scheduler iteration - current and next time slots already have jobs. ${command}`);
            break;
        default:
            error = new Error(`Unknown code ${code} error for ${jobId}. ${command}`);
    }
    // Add the code property to the error object
    error.code = code;
    return error;
}
