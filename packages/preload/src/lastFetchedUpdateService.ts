import {
    deleteLastFetchedUpdateQuery,
    getLastFetchedUpdateQuery,
    insertLastFetchedUpdateQuery,
    updateLastFetchedUpdateQuery,
} from "./db/lastFetchedUpdateQueries.js";
import { isGreaterVersion } from "./helpers.js";
import { versions } from "./index.js";

export function getLastFetchedUpdate(): UpdateCheckResult | null {
    const row = getLastFetchedUpdateQuery.get() as { updateInfoAsJson: string } | undefined
    if (!row) return null

    const existingUpdate = JSON.parse(row.updateInfoAsJson) as UpdateCheckResult

    if (isGreaterVersion(existingUpdate.updateInfo.version, versions.appVersion)) {
        return existingUpdate
    }

    deleteLastFetchedUpdate()
    return null
}

export function setLastFetchedUpdate(updateInfo: UpdateCheckResult) {
    const existingUpdate = getLastFetchedUpdate()
    if (existingUpdate) {
        const result = updateLastFetchedUpdateQuery.run(JSON.stringify(updateInfo))
        return !!result.changes
    } else {
        const result = insertLastFetchedUpdateQuery.run(JSON.stringify(updateInfo))
        return !!result.changes
    }
}

export function deleteLastFetchedUpdate() {
    const result = deleteLastFetchedUpdateQuery.run()
    return !!result.changes
}
