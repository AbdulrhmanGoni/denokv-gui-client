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

export interface WatchedKeysServiceInterface {
  getWatchedKeys(kvStoreId: string): Promise<TrycatchResult<SerializedKvKey[] | null>>;
  setWatchedKeys(
    kvStoreId: string,
    keys: SerializedKvKey[],
  ): Promise<TrycatchResult<boolean>>;
}

export class WatchedKeysServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    const getWatchedKeys: WatchedKeysServiceInterface["getWatchedKeys"] = async (
      kvStoreId,
    ) => {
      return syncTrycatch(() => {
        const row = getWatchedKeysQuery.get(kvStoreId) as
          | { keysAsJson: string }
          | undefined;
        if (!row) return null;
        return JSON.parse(row.keysAsJson) as SerializedKvKey[];
      });
    };
    ipcMain.handle(
      "watchedKeysService:getWatchedKeys",
      (_, ...args: Parameters<typeof getWatchedKeys>) => {
        return getWatchedKeys(...args);
      },
    );

    const setWatchedKeys: WatchedKeysServiceInterface["setWatchedKeys"] = async (
      kvStoreId,
      keys,
    ) => {
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
    };
    ipcMain.handle(
      "watchedKeysService:setWatchedKeys",
      (_, ...args: Parameters<typeof setWatchedKeys>) => {
        return setWatchedKeys(...args);
      },
    );
  }
}
