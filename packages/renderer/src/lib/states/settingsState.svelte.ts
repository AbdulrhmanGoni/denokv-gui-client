import { isHardwareAccelerationEnabled, settingsService } from "@app/preload";

export const settingsState: Settings = $state({});

export async function setAutoCheckForUpdate(value: boolean) {
  await settingsService.updateSettings({ autoCheckForUpdate: value });
  await loadSettings();
}

export async function loadSettings() {
  Object.assign(settingsState, (await settingsService.getSettings()) ?? {});
  settingsPageState.isHardwareAccelerationCurrentlyDisabled =
    !(await isHardwareAccelerationEnabled());
}

type SettingsPageState = {
  open: boolean;
  isHardwareAccelerationCurrentlyDisabled: boolean;
};
export const settingsPageState: SettingsPageState = $state({
  open: false,
  isHardwareAccelerationCurrentlyDisabled: false,
});

export function openSettingsPage() {
  settingsPageState.open = true;
}

export async function setHardwareAccelerationMode(value: boolean) {
  await settingsService.updateSettings({ disableHardwareAcceleration: value });
  await loadSettings();
}
