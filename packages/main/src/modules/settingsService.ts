import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { getSettingsQuery, insertSettingQuery, updateSettingQuery } from "../db/queries/settingsQueries.js";

export class SettingsServiceModule implements AppModule {
    enable(_context: ModuleContext): void {
        ipcMain.handle("settingsService:getSettings", getSettings);

        ipcMain.handle("settingsService:updateSettings", (_, updatedSettings: Settings) => {
            const settings = getSettings()
            if (settings) {
                const result = updateSettingQuery.run(JSON.stringify({ ...settings, ...updatedSettings }))
                return !!result.changes
            }

            const result = insertSettingQuery.run(
                JSON.stringify(updatedSettings)
            );
            return !!result.changes
        });
    }
}

export function getSettings(): Settings | undefined {
    const result = getSettingsQuery.get() as { settingsAsJsonText: string } | undefined
    if (result) {
        return JSON.parse(result.settingsAsJsonText) as Settings
    }
    return result
}