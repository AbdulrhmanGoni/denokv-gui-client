import { database } from "../db.js";

export type SettingsRow = {
  autoCheckForUpdate: 0 | 1;
  disableHardwareAcceleration: 0 | 1;
};

export const getSettingsQuery = database.prepare(`
  SELECT autoCheckForUpdate, disableHardwareAcceleration
  FROM userSettings
  WHERE settingsId = 'settings'
`);

export const updateSettingsQuery = database.prepare(`
  UPDATE userSettings SET 
    autoCheckForUpdate = COALESCE($autoCheckForUpdate, autoCheckForUpdate), 
    disableHardwareAcceleration = COALESCE($disableHardwareAcceleration, disableHardwareAcceleration)
  WHERE settingsId = 'settings'
  RETURNING autoCheckForUpdate, disableHardwareAcceleration;
`);
