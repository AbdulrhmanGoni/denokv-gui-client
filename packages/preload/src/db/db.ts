import { DatabaseSync } from 'node:sqlite';
import { getDatabasePath } from './dbPath.js';
import { migrateDatabaseSchema } from './migrate.js';

const isDev = process.env.NODE_ENV == 'development'

const dbPath = isDev ? "./database.sqlite" : getDatabasePath();

export const database = new DatabaseSync(dbPath);

if (!isDev) {
    migrateDatabaseSchema(dbPath);
}
