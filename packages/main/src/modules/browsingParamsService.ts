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
import type { SavedBrowsingParams, SavedBrowsingParamsRecord } from "../types.ts";

class BrowsingParamsService {
  async saveBrowsingParams(
    kvStoreId: string,
    updateData: { browsingParams: SavedBrowsingParams; setAsDefault: boolean },
  ) {
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
  }

  async getSavedBrowsingParamsRecords(kvStoreId: string) {
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
  }

  async getDefaultSavedBrowsingParams(kvStoreId: string) {
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
  }

  async updateSavedBrowsingParams(
    kvStoreId: string,
    browsingParamsId: string,
    updateData: {
      newBrowsingParams?: SavedBrowsingParams;
      setAsDefault?: boolean;
    },
  ) {
    return syncTrycatch<true>(() => {
      return databaseTransaction<true>(() => {
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
    });
  }

  async deleteSavedBrowsingParams(browsingParamsId: string) {
    return syncTrycatch<true>(() => {
      const result = deleteOneQuery.run(browsingParamsId);
      if (result.changes) return true;
      throw "Failed to delete the saved browsing params";
    });
  }
}

export type BrowsingParamsServiceInterface = BrowsingParamsService;

export class BrowsingParamsServiceModule implements AppModule {
  enable(_context: ModuleContext): void {
    const service = new BrowsingParamsService();

    ipcMain.handle(
      "browsingParamsService:saveBrowsingParams",
      (_event, ...args: Parameters<typeof service.saveBrowsingParams>) => {
        return service.saveBrowsingParams(...args);
      },
    );

    ipcMain.handle(
      "browsingParamsService:getSavedBrowsingParamsRecords",
      (_event, ...args: Parameters<typeof service.getSavedBrowsingParamsRecords>) => {
        return service.getSavedBrowsingParamsRecords(...args);
      },
    );

    ipcMain.handle(
      "browsingParamsService:getDefaultSavedBrowsingParams",
      (_event, ...args: Parameters<typeof service.getDefaultSavedBrowsingParams>) => {
        return service.getDefaultSavedBrowsingParams(...args);
      },
    );

    ipcMain.handle(
      "browsingParamsService:updateSavedBrowsingParams",
      (_event, ...args: Parameters<typeof service.updateSavedBrowsingParams>) => {
        return service.updateSavedBrowsingParams(...args);
      },
    );

    ipcMain.handle(
      "browsingParamsService:deleteSavedBrowsingParams",
      (_event, ...args: Parameters<typeof service.deleteSavedBrowsingParams>) => {
        return service.deleteSavedBrowsingParams(...args);
      },
    );
  }
}
