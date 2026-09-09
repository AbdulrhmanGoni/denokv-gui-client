import { ipcMain } from "electron";
import {
  getSettingsQuery,
  updateSettingsQuery,
  type SettingsRow,
} from "../db/queries/settingsQueries.js";
import { syncTrycatch } from "../helpers.js";
import type { Settings, UpdateSettingsInput, TrycatchResult } from "../types.ts";
import type { SQLInputValue } from "node:sqlite";

class SettingsService {
  async getSettings() {
    return syncTrycatch(() => this.fetchSettings());
  }

  #settingsRowToObject(settingsRow: SettingsRow): Settings {
    return {
      autoCheckForUpdate: !!settingsRow.autoCheckForUpdate,
      disableHardwareAcceleration: !!settingsRow.disableHardwareAcceleration,
    };
  }

  fetchSettings(): Settings {
    const settingsRow = getSettingsQuery.get() as SettingsRow;
    if (!settingsRow) {
      throw new Error("Failed to load settings");
    }

    return this.#settingsRowToObject(settingsRow);
  }

  async updateSettings(
    updatedSettings: UpdateSettingsInput,
  ): Promise<TrycatchResult<Settings>> {
    return syncTrycatch(() => {
      if (
        updatedSettings.autoCheckForUpdate === undefined &&
        updatedSettings.disableHardwareAcceleration === undefined
      ) {
        throw new Error("No settings provided to update");
      }

      const updatedSettingsRow = updateSettingsQuery.get({
        $autoCheckForUpdate: this.#booleanToSQLiteInteger(
          updatedSettings.autoCheckForUpdate,
        ),
        $disableHardwareAcceleration: this.#booleanToSQLiteInteger(
          updatedSettings.disableHardwareAcceleration,
        ),
      }) as SettingsRow;

      if (updatedSettingsRow) {
        return this.#settingsRowToObject(updatedSettingsRow);
      }

      throw new Error("Failed to update settings");
    });
  }

  #booleanToSQLiteInteger(value: boolean | undefined): SQLInputValue {
    return value !== undefined ? (value ? 1 : 0) : null;
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
