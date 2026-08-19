export declare function loadMigrationSql(file: string): string;
/**
 * Loads a runtime command's SQL by name (without the `.sql` extension), cached
 * after the first read.
 */
export declare function loadCommandSql(name: string): string;
