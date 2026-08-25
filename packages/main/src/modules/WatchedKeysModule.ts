import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import {
  getWatchedKeysQuery,
  insertWatchedKeysQuery,
  updateWatchedKeysQuery,
} from "../db/queries/watchedKvEntriesQueries.js";
import { databaseTransaction } from "../db/db.js";
import { syncTrycatch } from "../helpers.js";
import type { SerializedKvKey } from "@app/bridge-server";
import type { TrycatchResult } from "../types.ts";

class WatchedKeysService {
  async getWatchedKeys(
    kvStoreId: string,
  ): Promise<TrycatchResult<SerializedKvKey[] | null>> {
    return syncTrycatch(() => {
      const row = getWatchedKeysQuery.get(kvStoreId) as
        | { keysAsJson: string }
        | undefined;
      if (!row) return null;
      return JSON.parse(row.keysAsJson) as SerializedKvKey[];
    });
  }

  async setWatchedKeys(
    kvStoreId: string,
    keys: SerializedKvKey[],
  ): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() =>
      databaseTransaction(() => {
        if (getWatchedKeysQuery.get(kvStoreId)) {
          const result = updateWatchedKeysQuery.run({
            kvStoreId,
            keys: JSON.stringify(keys),
          });
          return !!result.changes;
        }

        const result = insertWatchedKeysQuery.run({
          id: crypto.randomUUID(),
          kvStoreId,
          keys: JSON.stringify(keys),
        });
        return !!result.changes;
      }),
    );
  }
}

export type WatchedKeysServiceInterface = Pick<
  WatchedKeysService,
  "getWatchedKeys" | "setWatchedKeys"
>;

export class WatchedKeysModule implements AppModule {
  enable(_context: ModuleContext): void {
    const service = new WatchedKeysService();

    ipcMain.handle(
      "watchedKeysService:getWatchedKeys",
      (_event, ...args: Parameters<typeof service.getWatchedKeys>) => {
        return service.getWatchedKeys(...args);
      },
    );

    ipcMain.handle(
      "watchedKeysService:setWatchedKeys",
      (_event, ...args: Parameters<typeof service.setWatchedKeys>) => {
        return service.setWatchedKeys(...args);
      },
    );
  }
}
