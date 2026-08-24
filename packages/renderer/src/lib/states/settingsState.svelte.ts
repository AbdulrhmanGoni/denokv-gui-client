import { hardwareAccelerationService, settingsService } from "@app/preload";
import { toast } from "svelte-sonner";

export const settingsState: Settings = $state({});

export function setAutoCheckForUpdate(value: boolean) {
  applySettingsResult(
    settingsService.updateSettings({
      autoCheckForUpdate: value,
    }),
  );
}

export function loadSettings() {
  return applySettingsResult(settingsService.getSettings());
}

type SettingsPageState = {
  open: boolean;
  isHardwareAccelerationCurrentlyDisabled: boolean;
};
export const settingsPageState: SettingsPageState = $state({
  open: false,
  isHardwareAccelerationCurrentlyDisabled: false,
});

export async function loadHardwareAccelerationState() {
  const hardwareAcceleration = await hardwareAccelerationService.isEnabled();
  if (hardwareAcceleration.error) return toast.error(hardwareAcceleration.error);

  settingsPageState.isHardwareAccelerationCurrentlyDisabled =
    !hardwareAcceleration.result;
}

export function openSettingsPage() {
  settingsPageState.open = true;
}

export function setHardwareAccelerationMode(value: boolean) {
  applySettingsResult(
    settingsService.updateSettings({
      disableHardwareAcceleration: value,
    }),
  );
}

async function applySettingsResult(
  updatePromise: Promise<TrycatchResult<Settings | undefined>>,
) {
  const { error, result } = await updatePromise;
  if (error) return toast.error(error);
  if (result) Object.assign(settingsState, result);
}
