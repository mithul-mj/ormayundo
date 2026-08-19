/**
 * Narrows whether a user-provided connection value is already an instantiated
 * `pg.Pool` (as opposed to a config object / connection string that we must use
 * to construct one).
 */
export function isPgPool(value) {
    return (!!value &&
        typeof value.connect === 'function' &&
        typeof value.query === 'function' &&
        typeof value.end === 'function');
}
