import { DatabaseSync } from 'node:sqlite';
import { getDatabasePath } from './dbPath.js';
import { migrateDatabaseSchema } from './migrate.js';

const isDev = process.env.NODE_ENV == 'development'
const isTest = process.env.PLAYWRIGHT_TEST == 'true'

const dbPath = isDev ? "./database.dev.sqlite" : isTest ? "./database.test.sqlite" : getDatabasePath();

export const database = new DatabaseSync(dbPath);

if (!isDev) {
    migrateDatabaseSchema(dbPath);
}

export function databaseTransaction<T>(fn: () => T) {
    database.exec("BEGIN");
    try {
        const result = fn()
        database.exec("COMMIT");
        return result
    } catch {
        database.exec("ROLLBACK");
        throw new Error("Transaction failed");
    }
}
