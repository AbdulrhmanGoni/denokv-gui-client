import { database } from './db.js';

export const insertLastFetchedUpdateQuery = database.prepare(`
    INSERT INTO lastFetchedUpdate(lastUpdateId, updateInfoAsJson)
    VALUES('last-update', ?)
`);

export const updateLastFetchedUpdateQuery = database.prepare(`
    UPDATE lastFetchedUpdate SET updateInfoAsJson = ?
    WHERE lastUpdateId = 'last-update'
`);

export const getLastFetchedUpdateQuery = database.prepare(
    "SELECT updateInfoAsJson FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'"
);

export const deleteLastFetchedUpdateQuery = database.prepare(
    "DELETE FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'"
);
