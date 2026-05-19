import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { syncTrycatch } from "../helpers.js";
import {
    unsetDefaultParamsQuery,
    deleteOneQuery,
    getAllQuery,
    insertQuery,
    updateQuery,
    getDefaultSavedBrowsingQuery
} from "../db/browsingParamsQueries.js";
import { databaseTransaction } from "../db/db.js";

export class BrowsingParamsServiceModule implements AppModule {
    enable(_context: ModuleContext): void {
        ipcMain.handle("browsingParamsService:saveBrowsingParams", (_, kvStoreId: string, updateData: {
            browsingParams: SavedBrowsingParams, setAsDefault: boolean
        }) => {
            return syncTrycatch<true>(() => {
                return databaseTransaction<true>(() => {
                    if (updateData.setAsDefault) {
                        unsetDefaultParamsQuery.run(kvStoreId)
                    }

                    const result = insertQuery.run({
                        id: crypto.randomUUID(),
                        kvStoreId,
                        paramsAsJson: JSON.stringify(updateData.browsingParams),
                        isDefault: Number(updateData.setAsDefault)
                    })

                    if (!!result.changes) return true

                    throw "Failed to save the browsing params"
                })
            })
        });

        ipcMain.handle("browsingParamsService:getSavedBrowsingParamsRecords", (_, kvStoreId: string) => {
            return syncTrycatch<SavedBrowsingParamsRecord<SavedBrowsingParams>[]>(() => {
                const result = getAllQuery.all(kvStoreId) as SavedBrowsingParamsRecord<string>[] | undefined
                if (result) {
                    return result.map((record) => ({
                        ...record,
                        paramsAsJson: JSON.parse(record.paramsAsJson) as SavedBrowsingParams,
                    }))
                }

                throw "Couldn't fetch the saved browsing params";
            })
        });

        ipcMain.handle("browsingParamsService:getDefaultSavedBrowsingParams", (_, kvStoreId: string) => {
            return syncTrycatch<SavedBrowsingParamsRecord<SavedBrowsingParams> | undefined>(() => {
                const result = getDefaultSavedBrowsingQuery.get(kvStoreId) as SavedBrowsingParamsRecord<string> | undefined
                if (result) {
                    return {
                        ...result,
                        paramsAsJson: JSON.parse(result.paramsAsJson) as SavedBrowsingParams,
                    }
                }

                return
            })
        });

        ipcMain.handle(
            "browsingParamsService:updateSavedBrowsingParams",
            (
                _,
                kvStoreId: string,
                browsingParamsId: string,
                updateData: { newBrowsingParams?: SavedBrowsingParams, setAsDefault?: boolean },
            ) => {
                return syncTrycatch<true>(() => {
                    if (updateData.setAsDefault) {
                        unsetDefaultParamsQuery.run(kvStoreId)
                    }

                    const result = updateQuery.run({
                        id: browsingParamsId,
                        paramsAsJson: updateData.newBrowsingParams ? JSON.stringify(updateData.newBrowsingParams) : null,
                        isDefault: "setAsDefault" in updateData ? Number(updateData.setAsDefault) : null,
                    })

                    if (!!result.changes) return true

                    throw "Failed to update the saved browsing params"
                })
            },
        );

        ipcMain.handle("browsingParamsService:deleteSavedBrowsingParams", (_, browsingParamsId: string) => {
            return syncTrycatch<true>(() => {
                const result = deleteOneQuery.run(browsingParamsId)
                if (!!result.changes) return true
                throw "Failed to delete the saved browsing params"
            })
        });
    }
}
