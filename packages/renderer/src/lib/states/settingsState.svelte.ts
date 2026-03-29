import { settingsService } from "@app/preload"

export const settingsState: Settings = $state({})

export async function setAutoCheckForUpdate(value: boolean) {
    await settingsService.updateSettings({
        autoCheckForUpdate: value,
    });

    await loadSettings()
}

export async function loadSettings() {
    Object.assign(settingsState, await settingsService.getSettings() ?? {})
}

export const settingsPageState: { open: boolean } = $state({ open: false })

export function openSettingsPage() {
    settingsPageState.open = true
}
