import { ipcMain } from "electron";
import type { AppModule } from "../AppModule.js";
import type { ModuleContext } from "../ModuleContext.js";
import {
  deleteLastFetchedUpdateQuery,
  getLastFetchedUpdateQuery,
  insertLastFetchedUpdateQuery,
  updateDoNotNotifyQuery,
  updateLastFetchedUpdateQuery,
} from "../db/queries/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "../helpers.js";
import { appVersion } from "./metadataModule.js";

export interface LastFetchedUpdateServiceInterface {
  getLastFetchedUpdate(): Promise<LastFetchedUpdate | null>;
  setLastFetchedUpdate(updateInfo: UpdateCheckResult): Promise<boolean>;
  deleteLastFetchedUpdate(): Promise<boolean>;
  doNotNotifyLastFetchedUpdate(): Promise<boolean>;
}

export class LastFetchedUpdateServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    ipcMain.handle("lastFetchedUpdateService:getLastFetchedUpdate", getLastFetchedUpdate);

    ipcMain.handle(
      "lastFetchedUpdateService:setLastFetchedUpdate",
      async (_, ...args: Parameters<typeof setLastFetchedUpdate>) => {
        return setLastFetchedUpdate(...args);
      },
    );

    ipcMain.handle(
      "lastFetchedUpdateService:deleteLastFetchedUpdate",
      deleteLastFetchedUpdate,
    );

    const doNotNotifyLastFetchedUpdate: LastFetchedUpdateServiceInterface["doNotNotifyLastFetchedUpdate"] =
      async () => {
        const result = updateDoNotNotifyQuery.run(1);
        return !!result.changes;
      };
    ipcMain.handle(
      "lastFetchedUpdateService:doNotNotifyLastFetchedUpdate",
      doNotNotifyLastFetchedUpdate,
    );
  }
}

function getLastFetchedUpdate(): Awaited<
  ReturnType<LastFetchedUpdateServiceInterface["getLastFetchedUpdate"]>
> {
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
): Awaited<ReturnType<LastFetchedUpdateServiceInterface["setLastFetchedUpdate"]>> {
  const existingUpdate = getLastFetchedUpdate();
  if (existingUpdate?.data.updateInfo.version === updateInfo.updateInfo.version)
    return true;
  const result = (
    existingUpdate ? updateLastFetchedUpdateQuery : insertLastFetchedUpdateQuery
  ).run(JSON.stringify(updateInfo));
  return !!result.changes;
}

function deleteLastFetchedUpdate(): Awaited<
  ReturnType<LastFetchedUpdateServiceInterface["deleteLastFetchedUpdate"]>
> {
  const result = deleteLastFetchedUpdateQuery.run();
  return !!result.changes;
}
