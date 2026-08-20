import { hardwareAccelerationService, settingsService } from "@app/preload";
import { toast } from "svelte-sonner";

export const settingsState: Settings = $state({});

export async function setAutoCheckForUpdate(value: boolean) {
  const { error } = await settingsService.updateSettings({ autoCheckForUpdate: value });
  if (error) return toast.error(error);
  await loadSettings();
}

export async function loadSettings() {
  const settings = await settingsService.getSettings();
  if (settings.error) return toast.error(settings.error);

  Object.assign(settingsState, settings.result ?? {});

  const hardwareAcceleration = await hardwareAccelerationService.isEnabled();
  if (hardwareAcceleration.error) return toast.error(hardwareAcceleration.error);

  settingsPageState.isHardwareAccelerationCurrentlyDisabled =
    !hardwareAcceleration.result;
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
  const { error } = await settingsService.updateSettings({
    disableHardwareAcceleration: value,
  });

  if (error) return toast.error(error);
  await loadSettings();
}
