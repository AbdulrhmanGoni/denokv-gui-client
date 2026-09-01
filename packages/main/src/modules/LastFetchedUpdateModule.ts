import { ipcMain } from "electron";
import {
  deleteLastFetchedUpdateQuery,
  getLastFetchedUpdateQuery,
  insertLastFetchedUpdateQuery,
  updateDoNotNotifyQuery,
  updateLastFetchedUpdateQuery,
} from "../db/queries/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "../helpers.js";
import type { AppInfoModule } from "./AppInfoModule.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { LastFetchedUpdate } from "../types.ts";
import type { UpdateCheckResult } from "electron-updater";

class LastFetchedUpdateService {
  constructor(private readonly appInfoModule: AppInfoModule) {}

  async getLastFetchedUpdate() {
    return syncTrycatch(() => this.#get());
  }

  async setLastFetchedUpdate(updateInfo: UpdateCheckResult) {
    return this.updatedLastFetchedUpdate(updateInfo);
  }

  async deleteLastFetchedUpdate() {
    return this.#delete();
  }

  async doNotNotifyLastFetchedUpdate() {
    return syncTrycatch(() => {
      const result = updateDoNotNotifyQuery.run(1);
      return !!result.changes;
    });
  }

  #get(): LastFetchedUpdate | null {
    const row = getLastFetchedUpdateQuery.get() as
      | { updateInfoAsJson: string; doNotNotify: number }
      | undefined;
    if (!row) return null;

    const existingUpdate = JSON.parse(row.updateInfoAsJson) as UpdateCheckResult;
    const doNotNotify = !!row.doNotNotify;

    if (
      isGreaterVersion(
        existingUpdate.updateInfo.version,
        this.appInfoModule.metadata.appVersion,
      )
    ) {
      return { data: existingUpdate, doNotNotify };
    }

    this.#delete();
    return null;
  }

  #delete() {
    return syncTrycatch(() => {
      const result = deleteLastFetchedUpdateQuery.run();
      return !!result.changes;
    });
  }

  updatedLastFetchedUpdate(updateInfo: UpdateCheckResult) {
    return syncTrycatch(() => {
      return databaseTransaction(() => {
        const existingUpdate = this.#get();
        if (existingUpdate?.data.updateInfo.version === updateInfo.updateInfo.version) {
          return true;
        }

        const query = existingUpdate
          ? updateLastFetchedUpdateQuery
          : insertLastFetchedUpdateQuery;

        const result = query.run(JSON.stringify(updateInfo));
        return !!result.changes;
      });
    });
  }
}

export type LastFetchedUpdateServiceInterface = Pick<
  LastFetchedUpdateService,
  | "getLastFetchedUpdate"
  | "setLastFetchedUpdate"
  | "deleteLastFetchedUpdate"
  | "doNotNotifyLastFetchedUpdate"
>;

export class LastFetchedUpdateModule {
  service: LastFetchedUpdateService;

  constructor(appInfoModule: AppInfoModule) {
    this.service = new LastFetchedUpdateService(appInfoModule);

    ipcMain.handle("lastFetchedUpdateService:getLastFetchedUpdate", (_event) => {
      return this.service.getLastFetchedUpdate();
    });

    ipcMain.handle(
      "lastFetchedUpdateService:setLastFetchedUpdate",
      async (_event, ...args: Parameters<typeof this.service.setLastFetchedUpdate>) => {
        return this.service.setLastFetchedUpdate(...args);
      },
    );

    ipcMain.handle("lastFetchedUpdateService:deleteLastFetchedUpdate", (_event) => {
      return this.service.deleteLastFetchedUpdate();
    });

    ipcMain.handle("lastFetchedUpdateService:doNotNotifyLastFetchedUpdate", (_event) => {
      return this.service.doNotNotifyLastFetchedUpdate();
    });
  }
}
