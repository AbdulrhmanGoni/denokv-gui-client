import { ipcMain } from "electron";
import {
  getSettingsQuery,
  insertSettingQuery,
  updateSettingQuery,
} from "../db/queries/settingsQueries.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { Settings, TrycatchResult } from "../types.ts";

class SettingsService {
  async getSettings() {
    return syncTrycatch(() => this.fetchSettings());
  }

  fetchSettings() {
    const result = getSettingsQuery.get() as { settingsAsJsonText: string } | undefined;
    if (result) {
      return JSON.parse(result.settingsAsJsonText) as Settings;
    }
    return result;
  }

  async updateSettings(
    updatedSettings: Settings,
  ): Promise<TrycatchResult<Settings | undefined>> {
    return syncTrycatch(() =>
      databaseTransaction(() => {
        const settings = this.fetchSettings();
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

export class SettingsModule {
  public service: SettingsService;

  constructor() {
    this.service = new SettingsService();

    ipcMain.handle("settingsService:getSettings", (_event) => {
      return this.service.getSettings();
    });

    ipcMain.handle(
      "settingsService:updateSettings",
      (_event, ...args: Parameters<typeof this.service.updateSettings>) => {
        return this.service.updateSettings(...args);
      },
    );
  }
}
