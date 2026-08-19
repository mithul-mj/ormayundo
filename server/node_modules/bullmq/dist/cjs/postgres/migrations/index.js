"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LATEST_SCHEMA_VERSION = exports.MIGRATIONS = void 0;
const sql_loader_1 = require("../sql-loader");
/**
 * The ordered list of migrations bundled with this version of BullMQ. Append a
 * new entry (never edit or reorder existing ones) whenever the schema changes.
 */
exports.MIGRATIONS = [
    {
        version: 1,
        name: '0001_schema',
        minClientVersion: 6,
        load: () => (0, sql_loader_1.loadMigrationSql)('0001_schema.sql'),
    },
    {
        version: 2,
        name: '0002_functions',
        // This initial schema split is the sole same-major exception. Future schema
        // migrations are breaking changes and require a new BullMQ major version.
        minClientVersion: 6,
        load: () => (0, sql_loader_1.loadMigrationSql)('0002_functions.sql'),
    },
];
/**
 * The highest schema version this BullMQ build knows how to produce. Explicit
 * migration applies older pending versions.
 */
exports.LATEST_SCHEMA_VERSION = exports.MIGRATIONS.length > 0 ? exports.MIGRATIONS[exports.MIGRATIONS.length - 1].version : 0;
