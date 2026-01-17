import { getSettingsQuery, insertSettingQuery, updateSettingQuery } from "../db/settingsQueries.js";

export function getSettings(): Settings | undefined {
    const result = getSettingsQuery.get() as { settingsAsJsonText: string } | undefined
    if (result) {
        return JSON.parse(result.settingsAsJsonText) as Settings
    }
    return result
}

export function updateSettings(updatedSettings: Settings) {
    const settings = getSettings()
    if (settings) {
        const result = updateSettingQuery.run(JSON.stringify({ ...settings, ...updatedSettings }))
        return !!result.changes
    } else {
        const result = insertSettingQuery.run(
            JSON.stringify(updatedSettings)
        );
        return !!result.changes
    }
}
