import { loadMigrationSql } from '../sql-loader';
/**
 * The ordered list of migrations bundled with this version of BullMQ. Append a
 * new entry (never edit or reorder existing ones) whenever the schema changes.
 */
export const MIGRATIONS = [
    {
        version: 1,
        name: '0001_schema',
        minClientVersion: 6,
        load: () => loadMigrationSql('0001_schema.sql'),
    },
    {
        version: 2,
        name: '0002_functions',
        // This initial schema split is the sole same-major exception. Future schema
        // migrations are breaking changes and require a new BullMQ major version.
        minClientVersion: 6,
        load: () => loadMigrationSql('0002_functions.sql'),
    },
];
/**
 * The highest schema version this BullMQ build knows how to produce. Explicit
 * migration applies older pending versions.
 */
export const LATEST_SCHEMA_VERSION = MIGRATIONS.length > 0 ? MIGRATIONS[MIGRATIONS.length - 1].version : 0;
