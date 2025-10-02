import { startCheckingForUpdates } from "$lib/states/appUpdate.svelte";
import { onWindowReady, settingsService } from "@app/preload"

type SettingsState = Settings

export const settingsState: SettingsState = $state(settingsService.getSettings() || {})

export function setAutoCheckForUpdate(value: boolean) {
    settingsService.updateSettings({
        autoCheckForUpdate: value,
    });

    reloadSettings()
}

function reloadSettings() {
    Object.assign(settingsState, settingsService.getSettings())
}

onWindowReady(() => {
    if (settingsState.autoCheckForUpdate) {
        startCheckingForUpdates();
    }
})
