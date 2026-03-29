import {
    deleteLastFetchedUpdateQuery,
    getLastFetchedUpdateQuery,
    insertLastFetchedUpdateQuery,
    updateDoNotNotifyQuery,
    updateLastFetchedUpdateQuery,
} from "../db/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "../helpers.js";
import * as metadata from "../metadata.js";

export function getLastFetchedUpdate(): LastFetchedUpdate | null {
    const row = getLastFetchedUpdateQuery.get() as { updateInfoAsJson: string, doNotNotify: number } | undefined
    if (!row) return null

    const existingUpdate = JSON.parse(row.updateInfoAsJson) as UpdateCheckResult
    const doNotNotify = !!row.doNotNotify

    if (isGreaterVersion(existingUpdate.updateInfo.version, metadata.appVersion)) {
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

export function deleteLastFetchedUpdate() {
    const result = deleteLastFetchedUpdateQuery.run()
    return !!result.changes
}

export function doNotNotifyLastFetchedUpdate() {
    const result = updateDoNotNotifyQuery.run(1)
    return !!result.changes
}