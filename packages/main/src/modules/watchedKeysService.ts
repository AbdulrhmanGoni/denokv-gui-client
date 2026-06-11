import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import {
  getWatchedKeysQuery,
  insertWatchedKeysQuery,
  updateWatchedKeysQuery,
} from "../db/queries/watchedKvEntriesQueries.js";

export class WatchedKeysServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    ipcMain.handle(
      "watchedKeysService:getWatchedKeys",
      (_, kvStoreId: string) => {
        const row = getWatchedKeysQuery.get(kvStoreId) as
          | { keysAsJson: string }
          | undefined;
        if (!row) return null;
        return JSON.parse(row.keysAsJson) as SerializedKvKey[];
      },
    );

    ipcMain.handle(
      "watchedKeysService:setWatchedKeys",
      (_, kvStoreId: string, keys: SerializedKvKey[]) => {
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
      },
    );
  }
}
