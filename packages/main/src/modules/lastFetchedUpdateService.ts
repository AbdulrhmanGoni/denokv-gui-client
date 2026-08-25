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
import { appVersion } from "./metadataModule.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { LastFetchedUpdate, TrycatchResult } from "../types.ts";
import type { UpdateCheckResult } from "electron-updater";

export interface LastFetchedUpdateServiceInterface {
  getLastFetchedUpdate(): Promise<TrycatchResult<LastFetchedUpdate | null>>;
  setLastFetchedUpdate(updateInfo: UpdateCheckResult): Promise<TrycatchResult<boolean>>;
  deleteLastFetchedUpdate(): Promise<TrycatchResult<boolean>>;
  doNotNotifyLastFetchedUpdate(): Promise<TrycatchResult<boolean>>;
}

export class LastFetchedUpdateServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    ipcMain.handle("lastFetchedUpdateService:getLastFetchedUpdate", () =>
      syncTrycatch(getLastFetchedUpdate),
    );

    ipcMain.handle(
      "lastFetchedUpdateService:setLastFetchedUpdate",
      async (_, ...args: Parameters<typeof setLastFetchedUpdate>) => {
        return syncTrycatch(() => setLastFetchedUpdate(...args));
      },
    );

    ipcMain.handle("lastFetchedUpdateService:deleteLastFetchedUpdate", () =>
      syncTrycatch(deleteLastFetchedUpdate),
    );

    const doNotNotifyLastFetchedUpdate: LastFetchedUpdateServiceInterface["doNotNotifyLastFetchedUpdate"] =
      async () => {
        return syncTrycatch(() => {
          const result = updateDoNotNotifyQuery.run(1);
          return !!result.changes;
        });
      };
    ipcMain.handle(
      "lastFetchedUpdateService:doNotNotifyLastFetchedUpdate",
      doNotNotifyLastFetchedUpdate,
    );
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
