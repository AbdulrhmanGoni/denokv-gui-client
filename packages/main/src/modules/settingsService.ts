import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import {
  getSettingsQuery,
  insertSettingQuery,
  updateSettingQuery,
} from "../db/queries/settingsQueries.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";

export interface SettingsServiceInterface {
  getSettings(): Promise<TrycatchResult<Settings | undefined>>;
  updateSettings(updatedSettings: Settings): Promise<TrycatchResult<boolean>>;
}

export class SettingsServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    const getSettingsForRenderer: SettingsServiceInterface["getSettings"] = async () =>
      syncTrycatch(getSettings);
    ipcMain.handle("settingsService:getSettings", getSettingsForRenderer);

    const updateSettings: SettingsServiceInterface["updateSettings"] = async (
      updatedSettings,
    ) => {
      return syncTrycatch(() =>
        databaseTransaction(() => {
          const settings = getSettings();
          if (settings) {
            const result = updateSettingQuery.run(
              JSON.stringify({ ...settings, ...updatedSettings }),
            );
            return !!result.changes;
          }

          const result = insertSettingQuery.run(JSON.stringify(updatedSettings));
          return !!result.changes;
        }),
      );
    };
    ipcMain.handle(
      "settingsService:updateSettings",
      (_, ...args: Parameters<typeof updateSettings>) => {
        return updateSettings(...args);
      },
    );
  }
}

export function getSettings(): Settings | undefined {
  const result = getSettingsQuery.get() as { settingsAsJsonText: string } | undefined;
  if (result) {
    return JSON.parse(result.settingsAsJsonText) as Settings;
  }
  return result;
}
