import { startCheckingForUpdates } from "$lib/states/appUpdate.svelte";
import { onWindowReady, settingsService } from "@app/preload"

type SettingsState = Settings

export const settingsState: SettingsState = $state({})

export async function setAutoCheckForUpdate(value: boolean) {
    await settingsService.updateSettings({
        autoCheckForUpdate: value,
    });

    await reloadSettings()
}

async function reloadSettings() {
    Object.assign(settingsState, await settingsService.getSettings())
}

onWindowReady(async () => {
    await reloadSettings()
    if (settingsState.autoCheckForUpdate) {
        startCheckingForUpdates();
    }
})
