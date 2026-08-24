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
  updateSettings(
    updatedSettings: Settings,
  ): Promise<TrycatchResult<Settings | undefined>>;
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
            const mergedSettings = { ...settings, ...updatedSettings };
            const result = updateSettingQuery.run(JSON.stringify(mergedSettings));
            if (result.changes) {
              return mergedSettings;
            }

            throw new Error("Failed to update settings");
          }

          const result = insertSettingQuery.run(JSON.stringify(updatedSettings));
          if (result.changes) {
            return updatedSettings;
          }

          throw new Error("Failed to insert settings");
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
