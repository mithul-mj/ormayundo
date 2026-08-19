import { BackendFactory } from '../interfaces';
import { PostgresQueueBackend } from './postgres-queue-backend';
/**
 * {@link BackendFactory} that builds a {@link PostgresQueueBackend}.
 *
 * The returned backend owns its {@link PostgresConnection} (a `pg.Pool` plus a
 * dedicated `LISTEN` client); the high-level classes depend only on
 * `IQueueBackend` and never touch a `pg` client directly.
 *
 * The `opts.connection` value is forwarded to {@link PostgresConnection} and may
 * be a connection string, a node-postgres pool config (optionally carrying a
 * `schema`), or an already-built `pg.Pool` instance. `pg` is lazily required
 * only when a config/string is passed, so Redis-only users never need it
 * installed.
 *
 * Inject this into the queue classes (or set it as the process-wide default via
 * `setDefaultBackendFactory(createPostgresBackend)`) to back BullMQ with
 * PostgreSQL.
 */
export declare const createPostgresBackend: BackendFactory<PostgresQueueBackend>;
