import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import {
  deleteLastFetchedUpdateQuery,
  getLastFetchedUpdateQuery,
  insertLastFetchedUpdateQuery,
  updateDoNotNotifyQuery,
  updateLastFetchedUpdateQuery,
} from "../db/queries/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "../helpers.js";
import { appVersion } from "./AppInfoModule.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { LastFetchedUpdate, TrycatchResult } from "../types.ts";
import type { UpdateCheckResult } from "electron-updater";

class LastFetchedUpdateService {
  async getLastFetchedUpdate(): Promise<TrycatchResult<LastFetchedUpdate | null>> {
    return syncTrycatch(getLastFetchedUpdate);
  }

  async setLastFetchedUpdate(
    updateInfo: UpdateCheckResult,
  ): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() => setLastFetchedUpdate(updateInfo));
  }

  async deleteLastFetchedUpdate(): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(deleteLastFetchedUpdate);
  }

  async doNotNotifyLastFetchedUpdate(): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() => {
      const result = updateDoNotNotifyQuery.run(1);
      return !!result.changes;
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

export class LastFetchedUpdateModule implements AppModule {
  enable(_context: ModuleContext): void {
    const service = new LastFetchedUpdateService();

    ipcMain.handle("lastFetchedUpdateService:getLastFetchedUpdate", (_event) => {
      return service.getLastFetchedUpdate();
    });

    ipcMain.handle(
      "lastFetchedUpdateService:setLastFetchedUpdate",
      async (_event, ...args: Parameters<typeof service.setLastFetchedUpdate>) => {
        return service.setLastFetchedUpdate(...args);
      },
    );

    ipcMain.handle("lastFetchedUpdateService:deleteLastFetchedUpdate", (_event) => {
      return service.deleteLastFetchedUpdate();
    });

    ipcMain.handle("lastFetchedUpdateService:doNotNotifyLastFetchedUpdate", (_event) => {
      return service.doNotNotifyLastFetchedUpdate();
    });
  }
}

function getLastFetchedUpdate(): LastFetchedUpdate | null {
  const row = getLastFetchedUpdateQuery.get() as
    | { updateInfoAsJson: string; doNotNotify: number }
    | undefined;
  if (!row) return null;

  const existingUpdate = JSON.parse(row.updateInfoAsJson) as UpdateCheckResult;
  const doNotNotify = !!row.doNotNotify;

  if (isGreaterVersion(existingUpdate.updateInfo.version, appVersion)) {
    return { data: existingUpdate, doNotNotify };
  }

  deleteLastFetchedUpdate();
  return null;
}

export function setLastFetchedUpdate(
  updateInfo: Parameters<LastFetchedUpdateServiceInterface["setLastFetchedUpdate"]>[0],
): boolean {
  return databaseTransaction(() => {
    const existingUpdate = getLastFetchedUpdate();
    if (existingUpdate?.data.updateInfo.version === updateInfo.updateInfo.version) {
      return true;
    }

    const query = existingUpdate
      ? updateLastFetchedUpdateQuery
      : insertLastFetchedUpdateQuery;

    const result = query.run(JSON.stringify(updateInfo));
    return !!result.changes;
  });
}

function deleteLastFetchedUpdate(): boolean {
  const result = deleteLastFetchedUpdateQuery.run();
  return !!result.changes;
}
