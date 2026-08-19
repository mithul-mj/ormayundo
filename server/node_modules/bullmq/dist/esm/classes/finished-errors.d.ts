/**
 * Builds the canonical `Error` for a negative status code returned by a backend
 * operation (Lua script, SQL function, …). Shared by every backend so that the
 * error messages a caller sees are identical regardless of the datastore.
 *
 * The resulting error carries the numeric `code` so callers can branch on it.
 */
export declare function finishedErrors({ code, jobId, parentKey, command, state, }: {
    code: number;
    jobId?: string;
    parentKey?: string;
    command: string;
    state?: string;
}): Error;
