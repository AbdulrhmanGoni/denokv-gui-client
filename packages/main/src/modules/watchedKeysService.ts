import { ipcMain } from "electron";
import type { AppModule } from "../AppModule.js";
import type { ModuleContext } from "../ModuleContext.js";
import {
  getWatchedKeysQuery,
  insertWatchedKeysQuery,
  updateWatchedKeysQuery,
} from "../db/queries/watchedKvEntriesQueries.js";

export interface WatchedKeysServiceInterface {
  getWatchedKeys(kvStoreId: string): Promise<SerializedKvKey[] | null>;
  setWatchedKeys(kvStoreId: string, keys: SerializedKvKey[]): Promise<boolean>;
}

export class WatchedKeysServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    const getWatchedKeys: WatchedKeysServiceInterface["getWatchedKeys"] = async (
      kvStoreId,
    ) => {
      const row = getWatchedKeysQuery.get(kvStoreId) as
        | { keysAsJson: string }
        | undefined;
      if (!row) return null;
      return JSON.parse(row.keysAsJson) as SerializedKvKey[];
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
    };
    ipcMain.handle(
      "watchedKeysService:setWatchedKeys",
      (_, ...args: Parameters<typeof setWatchedKeys>) => {
        return setWatchedKeys(...args);
      },
    );
  }
}
