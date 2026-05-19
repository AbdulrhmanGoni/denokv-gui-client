import { database } from './db.js';

export const insertWatchedKeysQuery = database.prepare(`
    INSERT INTO watchedKeys(id, kvStoreId, keysAsJson) 
    VALUES($id, $kvStoreId, $keys)
`);

export const updateWatchedKeysQuery = database.prepare(`
    UPDATE watchedKeys SET keysAsJson = $keys WHERE kvStoreId = $kvStoreId
`);

export const getWatchedKeysQuery = database.prepare(
    "SELECT keysAsJson FROM watchedKeys WHERE kvStoreId = ?"
);

export const deleteWatchedKeysQuery = database.prepare(
    "DELETE FROM watchedKeys WHERE kvStoreId = ?"
);
