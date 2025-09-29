import { database } from './db.js';

export const insertSettingQuery = database.prepare(`
    INSERT INTO userSettings(settingsId, settingsAsJsonText) 
    VALUES('settings', ?)
`);

export const updateSettingQuery = database.prepare(`
    UPDATE userSettings SET settingsAsJsonText = ?
`);

export const getSettingsQuery = database.prepare(
    "SELECT settingsAsJsonText FROM userSettings WHERE settingsId = 'settings'"
);
