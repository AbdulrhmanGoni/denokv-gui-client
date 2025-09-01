import { DatabaseSync } from 'node:sqlite';
import { getDatabasePath } from './dbPath.js';

const dbPath = getDatabasePath();

export const database = new DatabaseSync(dbPath);

export const insertQuery = database.prepare(`
    INSERT INTO kvStores(id, name, url, type, accessToken, createdAt, updatedAt) 
    VALUES(?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

export const updateQuery = database.prepare(`
    UPDATE kvStores SET 
        name = COALESCE($name, name), 
        url = COALESCE($url, url), 
        accessToken = $accessToken,
        type = COALESCE($type, type), 
        updatedAt = datetime('now') 
    WHERE id = $id
`);

export const deleteOneQuery = database.prepare(
    'DELETE FROM kvStores WHERE id = ?'
);

export const getAllQuery = database.prepare(
    'SELECT * FROM kvStores ORDER BY updatedAt DESC'
);
