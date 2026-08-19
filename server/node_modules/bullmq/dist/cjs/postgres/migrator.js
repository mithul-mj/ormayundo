"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaMigrationRequiredError = exports.SchemaVersionMismatchError = exports.UnsupportedPostgresVersionError = exports.BULLMQ_MAJOR_VERSION = exports.RECOMMENDED_POSTGRES_VERSION = exports.MINIMUM_POSTGRES_VERSION = exports.MIGRATION_ADVISORY_LOCK_KEY = exports.DEFAULT_SCHEMA = void 0;
exports.assertPostgresVersion = assertPostgresVersion;
exports.quoteSchemaName = quoteSchemaName;
exports.assertSchemaCompatibility = assertSchemaCompatibility;
exports.runMigrations = runMigrations;
exports.getCurrentSchemaVersion = getCurrentSchemaVersion;
const migrations_1 = require("./migrations");
const version_1 = require("../version");
/**
 * Default PostgreSQL schema (namespace) the backend lives in. The schema is the
 * connection-level namespace for *all* queues — the SQL-native replacement for
 * Redis's per-queue key `prefix`.
 */
exports.DEFAULT_SCHEMA = 'bullmq';
/**
 * Stable key for the transaction-scoped advisory lock that serializes
 * migrations across processes. The integer spells `BULL` (0x42554c4c) and is
 * documented here so other runtimes (the Elixir/Python ports) use the exact
 * same lock. The lock is namespaced per schema (via `hashtext(schema)`) so
 * migrating one namespace never blocks another.
 */
exports.MIGRATION_ADVISORY_LOCK_KEY = 0x42554c4c; // 1112493644
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
exports.MINIMUM_POSTGRES_VERSION = 13;
/**
 * Recommended lowest PostgreSQL *major* version. Between {@link
 * MINIMUM_POSTGRES_VERSION} and this we still run, but emit a one-time warning
 * (mirrors the Redis backend's `recommendedMinimumVersion`).
 */
exports.RECOMMENDED_POSTGRES_VERSION = 14;
/** The BullMQ major version used for PostgreSQL schema compatibility checks. */
exports.BULLMQ_MAJOR_VERSION = parseInt(version_1.version.split('.')[0], 10);
/**
 * Thrown when the connected PostgreSQL server is older than {@link
 * MINIMUM_POSTGRES_VERSION}. Pass `skipVersionCheck: true` on the connection to
 * bypass the check (at your own risk).
 */
class UnsupportedPostgresVersionError extends Error {
    constructor(serverVersion, minimumVersion) {
        super(`BullMQ: the PostgreSQL backend requires server version ` +
            `${minimumVersion} or newer, but the server reports ${serverVersion}. ` +
            `Upgrade PostgreSQL, or pass \`skipVersionCheck: true\` on the ` +
            `connection to bypass this check at your own risk.`);
        this.serverVersion = serverVersion;
        this.minimumVersion = minimumVersion;
        this.name = 'UnsupportedPostgresVersionError';
    }
}
exports.UnsupportedPostgresVersionError = UnsupportedPostgresVersionError;
/**
 * Verifies the connected server meets {@link MINIMUM_POSTGRES_VERSION} (throws
 * an {@link UnsupportedPostgresVersionError} otherwise) and warns once when it
 * is below {@link RECOMMENDED_POSTGRES_VERSION}. No-op when `skipVersionCheck`
 * is set. Uses `server_version_num` (e.g. `160002` for 16.2), whose integer
 * major component is `num / 10000` for every supported release.
 */
async function assertPostgresVersion(client, skipVersionCheck = false) {
    var _a, _b, _c, _d;
    if (skipVersionCheck) {
        return;
    }
    const { rows } = await client.query(`SELECT current_setting('server_version_num') AS num, ` +
        `current_setting('server_version') AS ver`);
    assertPostgresVersionValues((_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.num) !== null && _b !== void 0 ? _b : '0', (_d = (_c = rows[0]) === null || _c === void 0 ? void 0 : _c.ver) !== null && _d !== void 0 ? _d : 'unknown');
}
/**
 * Validates a PostgreSQL schema name and returns it double-quoted for safe
 * interpolation into DDL (schema names cannot be passed as bind parameters).
 *
 * Only simple identifiers are allowed (letter/underscore start, then
 * letters/digits/underscores/`$`, max 63 bytes), which both keeps the value
 * injection-safe and avoids surprising case-folding / quoting edge cases.
 */
function quoteSchemaName(schema) {
    if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(schema) || schema.length > 63) {
        throw new Error(`BullMQ: invalid PostgreSQL schema name ${JSON.stringify(schema)}. ` +
            'Use a simple identifier (letters, digits, underscores; max 63 chars).');
    }
    return `"${schema}"`;
}
/**
 * Thrown when the database schema is newer than this BullMQ build supports.
 *
 * This happens when the schema was migrated by a newer BullMQ release and an
 * older instance then connects: the older code may not understand the newer
 * structures, so we refuse to operate rather than risk corruption. The fix is
 * to upgrade BullMQ — schema downgrades are not supported.
 */
class SchemaVersionMismatchError extends Error {
    constructor(minimumClientVersion, clientVersion) {
        super(`BullMQ: the PostgreSQL schema requires BullMQ major version ` +
            `${minimumClientVersion} or newer, but this client is major version ` +
            `${clientVersion}. Upgrade BullMQ to use this schema.`);
        this.minimumClientVersion = minimumClientVersion;
        this.clientVersion = clientVersion;
        this.name = 'SchemaVersionMismatchError';
        this.databaseVersion = minimumClientVersion;
        this.supportedVersion = clientVersion;
    }
}
exports.SchemaVersionMismatchError = SchemaVersionMismatchError;
/** Thrown when a connection uses a schema that has not been initialized. */
class SchemaMigrationRequiredError extends Error {
    constructor(schema) {
        super(`BullMQ: PostgreSQL schema ${JSON.stringify(schema)} is not initialized. ` +
            'Run the migrations explicitly or pass `migrate: true` on the connection.');
        this.schema = schema;
        this.name = 'SchemaMigrationRequiredError';
    }
}
exports.SchemaMigrationRequiredError = SchemaMigrationRequiredError;
/**
 * Checks schema and server compatibility with one read and without locks or DDL.
 */
async function assertSchemaCompatibility(client, schema = exports.DEFAULT_SCHEMA, options = {}) {
    var _a, _b, _c, _d;
    const quotedSchema = quoteSchemaName(schema);
    let rows;
    try {
        ({ rows } = await client.query(`SELECT COALESCE(MAX(version), 0)::int AS version,
              COALESCE(
                MAX((to_jsonb(migration)->>'min_client_version')::int),
                $1
              )::int AS min_client_version,
              current_setting('server_version_num') AS server_version_num,
              current_setting('server_version') AS server_version
         FROM ${quotedSchema}.migration`, [exports.BULLMQ_MAJOR_VERSION]));
    }
    catch (err) {
        if (err.code === '42P01') {
            throw new SchemaMigrationRequiredError(schema);
        }
        throw err;
    }
    const state = rows[0];
    if (!options.skipVersionCheck) {
        assertPostgresVersionValues((_a = state === null || state === void 0 ? void 0 : state.server_version_num) !== null && _a !== void 0 ? _a : '0', (_b = state === null || state === void 0 ? void 0 : state.server_version) !== null && _b !== void 0 ? _b : 'unknown');
    }
    const minimumClientVersion = (_c = state === null || state === void 0 ? void 0 : state.min_client_version) !== null && _c !== void 0 ? _c : exports.BULLMQ_MAJOR_VERSION;
    if (minimumClientVersion > exports.BULLMQ_MAJOR_VERSION) {
        throw new SchemaVersionMismatchError(minimumClientVersion, exports.BULLMQ_MAJOR_VERSION);
    }
    return (_d = state === null || state === void 0 ? void 0 : state.version) !== null && _d !== void 0 ? _d : 0;
}
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
async function runMigrations(client, schema = exports.DEFAULT_SCHEMA, options = {}) {
    const quotedSchema = quoteSchemaName(schema);
    // Fail fast on an unsupported server *before* opening the migration
    // transaction, so an old server surfaces a clear error rather than a cryptic
    // syntax/feature failure partway through applying DDL.
    await assertPostgresVersion(client, options.skipVersionCheck);
    await client.query('BEGIN');
    try {
        // Isolation: serialize concurrent migrators for THIS schema. The lock is
        // held for the lifetime of this transaction and released automatically on
        // COMMIT/ROLLBACK. Namespaced by schema so different namespaces don't block.
        await client.query('SELECT pg_advisory_xact_lock($1, hashtext($2))', [
            exports.MIGRATION_ADVISORY_LOCK_KEY,
            schema,
        ]);
        // Create the namespace and point unqualified names at it for the rest of
        // the transaction (SET LOCAL is reverted on COMMIT/ROLLBACK).
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${quotedSchema}`);
        await client.query(`SET LOCAL search_path TO ${quotedSchema}`);
        await ensureLedgerTable(client);
        const currentVersion = await getCurrentSchemaVersion(client);
        const minimumClientVersion = await getMinimumClientVersion(client);
        if (minimumClientVersion > exports.BULLMQ_MAJOR_VERSION) {
            throw new SchemaVersionMismatchError(minimumClientVersion, exports.BULLMQ_MAJOR_VERSION);
        }
        if (currentVersion < migrations_1.LATEST_SCHEMA_VERSION) {
            for (const migration of migrations_1.MIGRATIONS) {
                if (migration.version > currentVersion) {
                    await applyMigration(client, migration);
                }
            }
        }
        // Atomicity: every migration applied above and its ledger row commit
        // together as one unit.
        await client.query('COMMIT');
        return Math.max(currentVersion, migrations_1.LATEST_SCHEMA_VERSION);
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
}
/**
 * Reads the schema version currently recorded in the database, or 0 for a fresh
 * database. Assumes the ledger table already exists (see
 * {@link ensureLedgerTable}).
 */
async function getCurrentSchemaVersion(client) {
    var _a, _b;
    const { rows } = await client.query('SELECT COALESCE(MAX(version), 0)::int AS version FROM migration');
    return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.version) !== null && _b !== void 0 ? _b : 0;
}
async function ensureLedgerTable(client) {
    await client.query(`CREATE TABLE IF NOT EXISTS migration (
       version    integer PRIMARY KEY,
       name       text NOT NULL,
       min_client_version integer NOT NULL,
       applied_at timestamptz NOT NULL DEFAULT now()
     )`);
    await client.query('ALTER TABLE migration ADD COLUMN IF NOT EXISTS min_client_version integer');
    await client.query('UPDATE migration SET min_client_version = $1 WHERE min_client_version IS NULL', [exports.BULLMQ_MAJOR_VERSION]);
    await client.query('ALTER TABLE migration ALTER COLUMN min_client_version SET NOT NULL');
}
async function getMinimumClientVersion(client) {
    var _a, _b;
    const { rows } = await client.query(`SELECT COALESCE(MAX(min_client_version), $1)::int AS min_client_version
       FROM migration`, [exports.BULLMQ_MAJOR_VERSION]);
    return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.min_client_version) !== null && _b !== void 0 ? _b : exports.BULLMQ_MAJOR_VERSION;
}
async function applyMigration(client, migration) {
    await client.query(migration.load());
    await client.query(`INSERT INTO migration (version, name, min_client_version)
     VALUES ($1, $2, $3)`, [migration.version, migration.name, migration.minClientVersion]);
}
function assertPostgresVersionValues(num, reported) {
    const major = Math.floor(parseInt(num, 10) / 10000);
    if (major < exports.MINIMUM_POSTGRES_VERSION) {
        throw new UnsupportedPostgresVersionError(reported, exports.MINIMUM_POSTGRES_VERSION);
    }
    if (major < exports.RECOMMENDED_POSTGRES_VERSION) {
        const warned = assertPostgresVersion._warnedRecommendedVersion;
        if (!warned) {
            assertPostgresVersion._warnedRecommendedVersion = true;
            console.warn(`BullMQ: PostgreSQL ${exports.RECOMMENDED_POSTGRES_VERSION} or newer is ` +
                `recommended for the PostgreSQL backend (detected ${reported}).`);
        }
    }
}
