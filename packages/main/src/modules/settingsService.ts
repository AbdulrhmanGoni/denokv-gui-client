import { ipcMain } from "electron";
import type { AppModule } from "../AppModule.js";
import type { ModuleContext } from "../ModuleContext.js";
import {
  getSettingsQuery,
  insertSettingQuery,
  updateSettingQuery,
} from "../db/queries/settingsQueries.js";

export interface SettingsServiceInterface {
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updatedSettings: Settings): Promise<boolean>;
}

export class SettingsServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    ipcMain.handle("settingsService:getSettings", getSettings);

    const updateSettings: SettingsServiceInterface["updateSettings"] = async (
      updatedSettings,
    ) => {
      const settings = getSettings();
      if (settings) {
        const result = updateSettingQuery.run(
          JSON.stringify({ ...settings, ...updatedSettings }),
        );
        return !!result.changes;
      }

      const result = insertSettingQuery.run(JSON.stringify(updatedSettings));
      return !!result.changes;
    };
    ipcMain.handle(
      "settingsService:updateSettings",
      (_, ...args: Parameters<typeof updateSettings>) => {
        return updateSettings(...args);
      },
    );
  }
}

export function getSettings(): Awaited<
  ReturnType<SettingsServiceInterface["getSettings"]>
> {
  const result = getSettingsQuery.get() as { settingsAsJsonText: string } | undefined;
  if (result) {
    return JSON.parse(result.settingsAsJsonText) as Settings;
  }
  return result;
}
