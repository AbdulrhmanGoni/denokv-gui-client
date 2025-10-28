import { database } from './db.js';

export const insertQuery = database.prepare(`
    INSERT INTO browsingParams(id, kvStoreId, paramsAsJson, isDefault, createdAt, updatedAt) 
    VALUES($id, $kvStoreId, $paramsAsJson, $isDefault, datetime('now'), datetime('now'))
`);

export const updateQuery = database.prepare(`
    UPDATE browsingParams 
    SET 
        paramsAsJson = COALESCE($paramsAsJson, paramsAsJson),
        isDefault = COALESCE($isDefault, isDefault),
        updatedAt = datetime('now')
    WHERE id = $id;
`);

export const deleteOneQuery = database.prepare(
    'DELETE FROM browsingParams WHERE id = ?'
);

export const clearSavedParamsQuery = database.prepare(
    'DELETE FROM browsingParams WHERE kvStoreId = ?'
);

export const getAllQuery = database.prepare(
    'SELECT * FROM browsingParams WHERE kvStoreId = ? ORDER BY updatedAt DESC'
);

export const getDefaultSavedBrowsingQuery = database.prepare(
    'SELECT * FROM browsingParams WHERE kvStoreId = ? AND isDefault = 1'
);

export const unsetDefaultParamsQuery = database.prepare(`
    UPDATE browsingParams SET isDefault = 0 WHERE kvStoreId = ? AND isDefault = 1;
`);
