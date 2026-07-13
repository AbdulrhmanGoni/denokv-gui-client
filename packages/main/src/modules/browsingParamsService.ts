import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import { syncTrycatch } from "../helpers.js";
import {
  unsetDefaultParamsQuery,
  deleteOneQuery,
  getAllQuery,
  insertQuery,
  updateQuery,
  getDefaultSavedBrowsingQuery,
} from "../db/queries/browsingParamsQueries.js";
import { databaseTransaction } from "../db/db.js";

export interface BrowsingParamsServiceInterface {
  saveBrowsingParams(
    kvStoreId: string,
    updateData: { browsingParams: SavedBrowsingParams; setAsDefault: boolean },
  ): Promise<TrycatchResult<true>>;
  getSavedBrowsingParamsRecords(
    kvStoreId: string,
  ): Promise<TrycatchResult<SavedBrowsingParamsRecord<SavedBrowsingParams>[]>>;
  getDefaultSavedBrowsingParams(
    kvStoreId: string,
  ): Promise<TrycatchResult<SavedBrowsingParamsRecord<SavedBrowsingParams> | undefined>>;
  updateSavedBrowsingParams(
    kvStoreId: string,
    browsingParamsId: string,
    updateData: {
      newBrowsingParams?: SavedBrowsingParams;
      setAsDefault?: boolean;
    },
  ): Promise<TrycatchResult<true>>;
  deleteSavedBrowsingParams(browsingParamsId: string): Promise<TrycatchResult<true>>;
}

export class BrowsingParamsServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    const saveBrowsingParams: BrowsingParamsServiceInterface["saveBrowsingParams"] =
      async (kvStoreId, updateData) => {
        return syncTrycatch<true>(() => {
          return databaseTransaction<true>(() => {
            if (updateData.setAsDefault) {
              unsetDefaultParamsQuery.run(kvStoreId);
            }

            const result = insertQuery.run({
              id: crypto.randomUUID(),
              kvStoreId,
              paramsAsJson: JSON.stringify(updateData.browsingParams),
              isDefault: Number(updateData.setAsDefault),
            });

            if (result.changes) return true;

            throw "Failed to save the browsing params";
          });
        });
      };
    ipcMain.handle(
      "browsingParamsService:saveBrowsingParams",
      (_, ...args: Parameters<typeof saveBrowsingParams>) => {
        return saveBrowsingParams(...args);
      },
    );

    const getSavedBrowsingParamsRecords: BrowsingParamsServiceInterface["getSavedBrowsingParamsRecords"] =
      async (kvStoreId) => {
        return syncTrycatch<SavedBrowsingParamsRecord<SavedBrowsingParams>[]>(() => {
          const result = getAllQuery.all(kvStoreId) as
            | SavedBrowsingParamsRecord<string>[]
            | undefined;
          if (result) {
            return result.map((record) => ({
              ...record,
              paramsAsJson: JSON.parse(record.paramsAsJson) as SavedBrowsingParams,
            }));
          }

          throw "Couldn't fetch the saved browsing params";
        });
      };
    ipcMain.handle(
      "browsingParamsService:getSavedBrowsingParamsRecords",
      (_, ...args: Parameters<typeof getSavedBrowsingParamsRecords>) => {
        return getSavedBrowsingParamsRecords(...args);
      },
    );

    const getDefaultSavedBrowsingParams: BrowsingParamsServiceInterface["getDefaultSavedBrowsingParams"] =
      async (kvStoreId) => {
        return syncTrycatch<SavedBrowsingParamsRecord<SavedBrowsingParams> | undefined>(
          () => {
            const result = getDefaultSavedBrowsingQuery.get(kvStoreId) as
              | SavedBrowsingParamsRecord<string>
              | undefined;
            if (result) {
              return {
                ...result,
                paramsAsJson: JSON.parse(result.paramsAsJson) as SavedBrowsingParams,
              };
            }

            return;
          },
        );
      };
    ipcMain.handle(
      "browsingParamsService:getDefaultSavedBrowsingParams",
      (_, ...args: Parameters<typeof getDefaultSavedBrowsingParams>) => {
        return getDefaultSavedBrowsingParams(...args);
      },
    );

    const updateSavedBrowsingParams: BrowsingParamsServiceInterface["updateSavedBrowsingParams"] =
      async (kvStoreId, browsingParamsId, updateData) => {
        return syncTrycatch<true>(() => {
          if (updateData.setAsDefault) {
            unsetDefaultParamsQuery.run(kvStoreId);
          }

          const result = updateQuery.run({
            id: browsingParamsId,
            paramsAsJson: updateData.newBrowsingParams
              ? JSON.stringify(updateData.newBrowsingParams)
              : null,
            isDefault:
              "setAsDefault" in updateData ? Number(updateData.setAsDefault) : null,
          });

          if (result.changes) return true;

          throw "Failed to update the saved browsing params";
        });
      };
    ipcMain.handle(
      "browsingParamsService:updateSavedBrowsingParams",
      (_, ...args: Parameters<typeof updateSavedBrowsingParams>) => {
        return updateSavedBrowsingParams(...args);
      },
    );

    const deleteSavedBrowsingParams: BrowsingParamsServiceInterface["deleteSavedBrowsingParams"] =
      async (browsingParamsId) => {
        return syncTrycatch<true>(() => {
          const result = deleteOneQuery.run(browsingParamsId);
          if (result.changes) return true;
          throw "Failed to delete the saved browsing params";
        });
      };
    ipcMain.handle(
      "browsingParamsService:deleteSavedBrowsingParams",
      (_, ...args: Parameters<typeof deleteSavedBrowsingParams>) => {
        return deleteSavedBrowsingParams(...args);
      },
    );
  }
}
