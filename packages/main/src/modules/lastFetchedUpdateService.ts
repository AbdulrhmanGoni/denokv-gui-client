import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import {
    deleteLastFetchedUpdateQuery,
    getLastFetchedUpdateQuery,
    insertLastFetchedUpdateQuery,
    updateDoNotNotifyQuery,
    updateLastFetchedUpdateQuery,
} from "../db/queries/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "../helpers.js";
import { appVersion } from "./metadataModule.js";

export class LastFetchedUpdateServiceModule implements AppModule {
    enable(_context: ModuleContext): void {
        ipcMain.handle("lastFetchedUpdateService:getLastFetchedUpdate", () => getLastFetchedUpdate());

        ipcMain.handle("lastFetchedUpdateService:setLastFetchedUpdate", (_, updateInfo: UpdateCheckResult) => {
            return setLastFetchedUpdate(updateInfo)
        });

        ipcMain.handle("lastFetchedUpdateService:deleteLastFetchedUpdate", () => deleteLastFetchedUpdate());

        ipcMain.handle("lastFetchedUpdateService:doNotNotifyLastFetchedUpdate", () => {
            const result = updateDoNotNotifyQuery.run(1)
            return !!result.changes
        });
    }
}

function getLastFetchedUpdate(): LastFetchedUpdate | null {
    const row = getLastFetchedUpdateQuery.get() as { updateInfoAsJson: string, doNotNotify: number } | undefined
    if (!row) return null

    const existingUpdate = JSON.parse(row.updateInfoAsJson) as UpdateCheckResult
    const doNotNotify = !!row.doNotNotify

    if (isGreaterVersion(existingUpdate.updateInfo.version, appVersion)) {
        return { data: existingUpdate, doNotNotify }
    }

    deleteLastFetchedUpdate()
    return null
}

export function setLastFetchedUpdate(updateInfo: UpdateCheckResult) {
    const existingUpdate = getLastFetchedUpdate()
    if (existingUpdate?.data.updateInfo.version === updateInfo.updateInfo.version) return true
    const result = (existingUpdate ? updateLastFetchedUpdateQuery : insertLastFetchedUpdateQuery)
        .run(JSON.stringify(updateInfo))
    return !!result.changes
}

function deleteLastFetchedUpdate() {
    const result = deleteLastFetchedUpdateQuery.run()
    return !!result.changes
}