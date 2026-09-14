import { ipcMain } from "electron";
import {
  getSettingsQuery,
  getLastFetchedUpdateQuery,
  setLastFetchedUpdateQuery,
  updateSettingsQuery,
  type SettingsRow,
} from "../db/queries/settingsQueries.js";
import { isGreaterVersion, syncTrycatch } from "../helpers.js";
import type {
  Settings,
  UpdateCheckResult,
  UpdateSettingsInput,
  TrycatchResult,
} from "../types.ts";
import type { SQLInputValue } from "node:sqlite";
import type { AppInfoModule } from "./AppInfoModule.js";

class SettingsService {
  constructor(private readonly appInfoModule: AppInfoModule) {}

  async getSettings() {
    return syncTrycatch(() => this.fetchSettings());
  }

  #settingsRowToObject(settingsRow: SettingsRow): Settings {
    return {
      autoCheckForUpdate: !!settingsRow.autoCheckForUpdate,
      disableHardwareAcceleration: !!settingsRow.disableHardwareAcceleration,
      ignoreLastFetchedUpdate: !!settingsRow.ignoreLastFetchedUpdate,
      lastFetchedUpdate: this.#parseLastFetchedUpdate(settingsRow.lastFetchedUpdate),
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
        updatedSettings.ignoreLastFetchedUpdate === undefined &&
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
        $ignoreLastFetchedUpdate: this.#booleanToSQLiteInteger(
          updatedSettings.ignoreLastFetchedUpdate,
        ),
      }) as SettingsRow;

      if (updatedSettingsRow) {
        return this.#settingsRowToObject(updatedSettingsRow);
      }

      throw new Error("Failed to update settings");
    });
  }

  #parseLastFetchedUpdate(
    lastFetchedUpdateColumn: string | null,
  ): UpdateCheckResult | null {
    if (!lastFetchedUpdateColumn) return null;

    const parsedUpdate = JSON.parse(lastFetchedUpdateColumn) as UpdateCheckResult;
    if (
      isGreaterVersion(
        parsedUpdate.updateInfo.version,
        this.appInfoModule.metadata.appVersion,
      )
    ) {
      return parsedUpdate;
    }

    setLastFetchedUpdateQuery.run(null);
    return null;
  }

  #getLastFetchedUpdate(): UpdateCheckResult | null {
    const settingsRow = getLastFetchedUpdateQuery.get() as
      | Pick<SettingsRow, "lastFetchedUpdate">
      | undefined;

    if (!settingsRow) return null;

    return this.#parseLastFetchedUpdate(settingsRow.lastFetchedUpdate);
  }

  async setLastFetchedUpdate(updateInfo: UpdateCheckResult) {
    return syncTrycatch(() => {
      const existingUpdate = this.#getLastFetchedUpdate();
      if (existingUpdate?.updateInfo.version === updateInfo.updateInfo.version) {
        return true;
      }

      const result = setLastFetchedUpdateQuery.run(JSON.stringify(updateInfo));
      return !!result.changes;
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

  constructor(appInfoModule: AppInfoModule) {
    this.service = new SettingsService(appInfoModule);

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
