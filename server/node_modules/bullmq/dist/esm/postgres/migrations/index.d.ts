/**
 * A single, ordered schema migration. The `.sql` file is the source of truth;
 * `version` is the monotonically increasing schema version recorded in the
 * `migration` ledger table once applied.
 */
export interface Migration {
    /** Monotonically increasing schema version (1, 2, 3, …). */
    version: number;
    /** Human-readable name (matches the `.sql` filename without extension). */
    name: string;
    /** Oldest BullMQ major version that can use the schema after this migration. */
    minClientVersion: number;
    /** Loads this migration's SQL from its `.sql` file. */
    load(): string;
}
/**
 * The ordered list of migrations bundled with this version of BullMQ. Append a
 * new entry (never edit or reorder existing ones) whenever the schema changes.
 */
export declare const MIGRATIONS: readonly Migration[];
/**
 * The highest schema version this BullMQ build knows how to produce. Explicit
 * migration applies older pending versions.
 */
export declare const LATEST_SCHEMA_VERSION: number;
