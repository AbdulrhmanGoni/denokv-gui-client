import { database } from './db.js';

export const insertLastFetchedUpdateQuery = database.prepare(`
    INSERT INTO lastFetchedUpdate(lastUpdateId, updateInfoAsJson)
    VALUES('last-update', ?)
`);

export const updateLastFetchedUpdateQuery = database.prepare(`
    UPDATE lastFetchedUpdate SET updateInfoAsJson = ?, doNotNotify = 0
    WHERE lastUpdateId = 'last-update'
`);

export const getLastFetchedUpdateQuery = database.prepare(
    "SELECT updateInfoAsJson, doNotNotify FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'"
);

export const deleteLastFetchedUpdateQuery = database.prepare(
    "DELETE FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'"
);

export const updateDoNotNotifyQuery = database.prepare(
    "UPDATE lastFetchedUpdate SET doNotNotify = ? WHERE lastUpdateId = 'last-update'"
);
