import { PgQueryable } from './pg-types';
/**
 * Default PostgreSQL schema (namespace) the backend lives in. The schema is the
 * connection-level namespace for *all* queues — the SQL-native replacement for
 * Redis's per-queue key `prefix`.
 */
export declare const DEFAULT_SCHEMA = "bullmq";
/**
 * Stable key for the transaction-scoped advisory lock that serializes
 * migrations across processes. The integer spells `BULL` (0x42554c4c) and is
 * documented here so other runtimes (the Elixir/Python ports) use the exact
 * same lock. The lock is namespaced per schema (via `hashtext(schema)`) so
 * migrating one namespace never blocks another.
 */
export declare const MIGRATION_ADVISORY_LOCK_KEY = 1112886348;
/**
 * Lowest PostgreSQL *major* version the backend supports. Below this the schema
 * and operation functions rely on features (or fixes) that are absent or
 * unreliable, so we refuse to run rather than fail later in a surprising way.
 *
 * Rationale: the operation functions use `INSERT … ON CONFLICT`, transaction
 * advisory locks, `to_regclass`, multi-array `unnest(…) WITH ORDINALITY`, and
 * lean on the read-write "expanded array" representation for cheap in-loop
 * accumulation — all comfortably available here, on a version that is still
 * within the PostgreSQL support window.
 */
export declare const MINIMUM_POSTGRES_VERSION = 13;
/**
 * Recommended lowest PostgreSQL *major* version. Between {@link
 * MINIMUM_POSTGRES_VERSION} and this we still run, but emit a one-time warning
 * (mirrors the Redis backend's `recommendedMinimumVersion`).
 */
export declare const RECOMMENDED_POSTGRES_VERSION = 14;
/** The BullMQ major version used for PostgreSQL schema compatibility checks. */
export declare const BULLMQ_MAJOR_VERSION: number;
/**
 * Thrown when the connected PostgreSQL server is older than {@link
 * MINIMUM_POSTGRES_VERSION}. Pass `skipVersionCheck: true` on the connection to
 * bypass the check (at your own risk).
 */
export declare class UnsupportedPostgresVersionError extends Error {
    readonly serverVersion: string;
    readonly minimumVersion: number;
    constructor(serverVersion: string, minimumVersion: number);
}
/**
 * Verifies the connected server meets {@link MINIMUM_POSTGRES_VERSION} (throws
 * an {@link UnsupportedPostgresVersionError} otherwise) and warns once when it
 * is below {@link RECOMMENDED_POSTGRES_VERSION}. No-op when `skipVersionCheck`
 * is set. Uses `server_version_num` (e.g. `160002` for 16.2), whose integer
 * major component is `num / 10000` for every supported release.
 */
export declare function assertPostgresVersion(client: PgQueryable, skipVersionCheck?: boolean): Promise<void>;
/**
 * Validates a PostgreSQL schema name and returns it double-quoted for safe
 * interpolation into DDL (schema names cannot be passed as bind parameters).
 *
 * Only simple identifiers are allowed (letter/underscore start, then
 * letters/digits/underscores/`$`, max 63 bytes), which both keeps the value
 * injection-safe and avoids surprising case-folding / quoting edge cases.
 */
export declare function quoteSchemaName(schema: string): string;
/**
 * Thrown when the database schema is newer than this BullMQ build supports.
 *
 * This happens when the schema was migrated by a newer BullMQ release and an
 * older instance then connects: the older code may not understand the newer
 * structures, so we refuse to operate rather than risk corruption. The fix is
 * to upgrade BullMQ — schema downgrades are not supported.
 */
export declare class SchemaVersionMismatchError extends Error {
    readonly minimumClientVersion: number;
    readonly clientVersion: number;
    /** @deprecated Use {@link minimumClientVersion}. */
    readonly databaseVersion: number;
    /** @deprecated Use {@link clientVersion}. */
    readonly supportedVersion: number;
    constructor(minimumClientVersion: number, clientVersion: number);
}
/** Thrown when a connection uses a schema that has not been initialized. */
export declare class SchemaMigrationRequiredError extends Error {
    readonly schema: string;
    constructor(schema: string);
}
/**
 * Checks schema and server compatibility with one read and without locks or DDL.
 */
export declare function assertSchemaCompatibility(client: PgQueryable, schema?: string, options?: {
    skipVersionCheck?: boolean;
}): Promise<number>;
/**
 * Brings the database schema up to {@link LATEST_SCHEMA_VERSION}.
 *
 * Run explicitly with `runMigrations()` or by passing `migrate: true` on the
 * connection. Behaviour by current database version:
 *
 * - **older** than supported → applies the pending migrations in order.
 * - **equal** to supported → no-op.
 * - **newer** than bundled → no-op if its minimum client major is compatible.
 *
 * ## Atomicity
 *
 * The whole operation runs inside a **single transaction**: every pending
 * migration's SQL and its ledger row are committed together, or nothing is. If
 * any migration fails the transaction is rolled back and the database is left
 * exactly at its previous schema version — there are no partially-applied
 * upgrades.
 *
 * For this guarantee to hold, migration `.sql` files must contain only
 * transaction-safe statements. PostgreSQL DDL (`CREATE TABLE`/`FUNCTION`/`INDEX`,
 * `ALTER …`, …) is transactional, but a few commands are not and must never be
 * used in a migration: `CREATE INDEX CONCURRENTLY`, `VACUUM`, `CREATE DATABASE`,
 * etc.
 *
 * ## Isolation
 *
 * A transaction-scoped `pg_advisory_xact_lock` serializes concurrent starters
 * (many Queue/Worker instances booting at once across processes), so the
 * migrations run exactly once. The lock is acquired as the first statement and
 * released automatically when the transaction commits or rolls back (or if the
 * connection dies), so it can never leak. Late starters block until the winner
 * commits, then observe the up-to-date version and no-op.
 *
 * ## Namespace
 *
 * All objects are created in `schema` (default {@link DEFAULT_SCHEMA}), the
 * connection-level namespace that replaces Redis's per-queue key prefix. The
 * schema is created if missing and `search_path` is set (transaction-locally)
 * so the migrations' unqualified table names resolve into it.
 *
 * The caller MUST provide a single dedicated session (e.g. a checked-out
 * `pg.PoolClient` or a standalone `pg.Client`), never the pool itself, so the
 * lock and the transaction share one connection.
 *
 * @returns the schema version the database is at after the call.
 */
export declare function runMigrations(client: PgQueryable, schema?: string, options?: {
    skipVersionCheck?: boolean;
}): Promise<number>;
/**
 * Reads the schema version currently recorded in the database, or 0 for a fresh
 * database. Assumes the ledger table already exists (see
 * {@link ensureLedgerTable}).
 */
export declare function getCurrentSchemaVersion(client: PgQueryable): Promise<number>;
