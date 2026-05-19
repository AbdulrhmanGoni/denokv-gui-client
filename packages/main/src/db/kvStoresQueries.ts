import { database } from './db.js';

export const insertQuery = database.prepare(`
    INSERT INTO kvStores(id, name, url, type, accessToken, authToken, createdAt, updatedAt) 
    VALUES(?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
`);

export const updateQuery = database.prepare(`
    UPDATE kvStores SET 
        name = COALESCE($name, name), 
        url = COALESCE($url, url), 
        accessToken = $accessToken,
        authToken = $authToken,
        type = COALESCE($type, type), 
        updatedAt = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') 
    WHERE id = $id
`);

export const deleteOneQuery = database.prepare(
    'DELETE FROM kvStores WHERE id = ?'
);

export const getAllQuery = database.prepare(
    'SELECT * FROM kvStores ORDER BY updatedAt DESC'
);

export const getOneQuery = database.prepare(
    'SELECT * FROM kvStores WHERE id = ?'
);
