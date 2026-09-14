import { database } from "../db.js";

export type SettingsRow = {
  autoCheckForUpdate: 0 | 1;
  disableHardwareAcceleration: 0 | 1;
  lastFetchedUpdate: string | null;
  ignoreLastFetchedUpdate: 0 | 1;
};

export const getSettingsQuery = database.prepare(`
  SELECT autoCheckForUpdate, disableHardwareAcceleration, lastFetchedUpdate, ignoreLastFetchedUpdate
  FROM userSettings
  WHERE settingsId = 'settings'
`);

export const updateSettingsQuery = database.prepare(`
  UPDATE userSettings SET 
    autoCheckForUpdate = COALESCE($autoCheckForUpdate, autoCheckForUpdate), 
    disableHardwareAcceleration = COALESCE($disableHardwareAcceleration, disableHardwareAcceleration),
    ignoreLastFetchedUpdate = COALESCE($ignoreLastFetchedUpdate, ignoreLastFetchedUpdate)
  WHERE settingsId = 'settings'
  RETURNING autoCheckForUpdate, disableHardwareAcceleration, lastFetchedUpdate, ignoreLastFetchedUpdate;
`);

export const getLastFetchedUpdateQuery = database.prepare(`
  SELECT lastFetchedUpdate FROM userSettings WHERE settingsId = 'settings'
`);

export const setLastFetchedUpdateQuery = database.prepare(`
  UPDATE userSettings SET lastFetchedUpdate = ?, ignoreLastFetchedUpdate = 0
  WHERE settingsId = 'settings'
`);
