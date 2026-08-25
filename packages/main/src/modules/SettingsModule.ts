import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import {
  getSettingsQuery,
  insertSettingQuery,
  updateSettingQuery,
} from "../db/queries/settingsQueries.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { Settings, TrycatchResult } from "../types.ts";

class SettingsService {
  async getSettings(): Promise<TrycatchResult<Settings | undefined>> {
    return syncTrycatch(getSettings);
  }

  async updateSettings(
    updatedSettings: Settings,
  ): Promise<TrycatchResult<Settings | undefined>> {
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
  }
}

export type SettingsServiceInterface = Pick<
  SettingsService,
  "getSettings" | "updateSettings"
>;

export class SettingsModule implements AppModule {
  enable(_context: ModuleContext): void {
    const service = new SettingsService();

    ipcMain.handle("settingsService:getSettings", (_event) => {
      return service.getSettings();
    });

    ipcMain.handle(
      "settingsService:updateSettings",
      (_event, ...args: Parameters<typeof service.updateSettings>) => {
        return service.updateSettings(...args);
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
