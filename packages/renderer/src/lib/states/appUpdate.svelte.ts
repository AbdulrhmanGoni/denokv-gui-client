import { appUpdater, metadata, appInfoService } from "@app/preload";
import { toast } from "svelte-sonner";
import newUpdateNotificationActions from "$lib/features/settings/newUpdateNotificationActions.svelte";
import type { ProgressInfo, UpdateCheckResult } from "@app/main";
import { ignoreLastFetchedUpdate, settingsState } from "./settingsState.svelte";

type UpdateAppState = {
  downloadUpdateProgress: ProgressInfo | null;
  newUpdate: UpdateCheckResult | null;
  checkingForUpdates: boolean;
  checkingForUpdatesError: string;
  checkingForUpdatesDone: boolean;
  downloadingUpdates: boolean;
  downloadingUpdatesError: string;
  downloadingUpdatesDone: boolean;
  releaseNotes: Exclude<UpdateCheckResult["updateInfo"]["releaseNotes"], string>;
};

export const updateAppState: UpdateAppState = $state({
  status: null,
  downloadUpdateProgress: null,
  newUpdate: null,
  checkingForUpdates: false,
  checkingForUpdatesError: "",
  checkingForUpdatesDone: false,
  downloadingUpdates: false,
  downloadingUpdatesError: "",
  downloadingUpdatesDone: false,
  releaseNotes: null,
});

export function notifyUserForNewUpdate(update: UpdateCheckResult, message: string) {
  if (update.isUpdateAvailable) {
    const toastId = "new-update-notification:" + update.updateInfo.version;
    const dismiss = () => toast.dismiss(toastId);
    toast.info(message, {
      class: "px-2.5!",
      classes: {
        title: "text-[15px]",
        actionButton:
          "bg-transparent! border! transition-colors border-border! text-muted-foreground! hover:text-foreground!",
      },
      duration: 60000,
      closeButton: true,
      action: {
        label: "Ignore",
        onClick() {
          dismiss();
          ignoreLastFetchedUpdate();
        },
      },
      description: (internals) => newUpdateNotificationActions(internals, { dismiss }),
      id: toastId,
    });
  }
}

export function notifyLastFetchedUpdateIfExists() {
  if (settingsState.lastFetchedUpdate) {
    if (!settingsState.ignoreLastFetchedUpdate) {
      notifyUserForNewUpdate(
        settingsState.lastFetchedUpdate,
        `A new update is available (v${settingsState.lastFetchedUpdate.updateInfo.version})`,
      );
    }
    updateAppState.newUpdate = settingsState.lastFetchedUpdate;
    updateAppState.checkingForUpdatesDone = true;
  }
}

export async function startCheckingForUpdates() {
  try {
    updateAppState.checkingForUpdates = true;
    const updateResponse = await appUpdater.checkForUpdate();
    if (updateResponse.error) {
      toast.error(updateResponse.error);
      updateAppState.checkingForUpdatesError = updateResponse.error;
      updateAppState.checkingForUpdatesDone = false;
      return;
    }
    updateAppState.newUpdate = updateResponse.result;
    updateAppState.checkingForUpdatesDone = true;
    updateAppState.checkingForUpdatesError = "";
    if (updateAppState.newUpdate) {
      const isNewerVersion =
        settingsState.lastFetchedUpdate &&
        settingsState.lastFetchedUpdate.updateInfo.version !==
          updateAppState.newUpdate.updateInfo.version;

      if (
        !settingsState.lastFetchedUpdate ||
        (!settingsState.ignoreLastFetchedUpdate && isNewerVersion)
      ) {
        notifyUserForNewUpdate(
          updateAppState.newUpdate,
          isNewerVersion
            ? `A newer update is available (v${updateAppState.newUpdate.updateInfo.version})`
            : `A new update is available (v${updateAppState.newUpdate.updateInfo.version})`,
        );
      }
    }

    settingsState.lastFetchedUpdate = updateResponse.result;
  } catch (error) {
    updateAppState.checkingForUpdatesError = String(error);
    updateAppState.checkingForUpdatesDone = false;
  } finally {
    updateAppState.checkingForUpdates = false;
  }
}

export async function startDownloadingUpdate() {
  try {
    updateAppState.downloadingUpdates = true;
    updateAppState.downloadingUpdatesDone = false;
    updateAppState.downloadingUpdatesError = "";
    updateAppState.downloadUpdateProgress = null;
    const downloadResponse = appUpdater.downloadUpdate();
    appUpdater.onDownloadingUpdateProgress((progressInfo) => {
      updateAppState.downloadUpdateProgress = progressInfo;
    });

    const { error } = await downloadResponse;
    if (error) {
      updateAppState.downloadingUpdatesError = error;
      return;
    }

    updateAppState.downloadingUpdatesDone = true;
    updateAppState.downloadingUpdatesError = "";
  } catch (error) {
    updateAppState.downloadingUpdatesError = String(error);
    updateAppState.downloadingUpdatesDone = false;
  } finally {
    updateAppState.downloadingUpdates = false;
  }
}

export async function cancelDownloadingUpdate() {
  const { error } = await appUpdater.cancelUpdate();
  if (error) return toast.error(error);
  updateAppState.downloadingUpdates = false;
  updateAppState.downloadingUpdatesError = "";
  updateAppState.downloadingUpdatesDone = false;
}

export async function quitAndInstallTheUpdate() {
  const { error } = await appUpdater.quitAndInstallUpdate();
  if (error) toast.error(error);
}

export function openNewUpdateReleaseNotes() {
  if (updateAppState.newUpdate) {
    if (typeof updateAppState.newUpdate.updateInfo.releaseNotes === "string") {
      updateAppState.releaseNotes = [
        {
          version: updateAppState.newUpdate.updateInfo.version,
          note: updateAppState.newUpdate.updateInfo.releaseNotes,
        },
      ];
    } else {
      updateAppState.releaseNotes = updateAppState.newUpdate.updateInfo.releaseNotes;
    }
  }
}

export async function openCurrentVersionReleaseNotes() {
  const { result: releaseNotes, error } = await appInfoService.getReleaseNotes();
  if (error || !releaseNotes) {
    toast.error(error ?? "Couldn't get the release notes of the current version");
    return;
  }

  updateAppState.releaseNotes = [
    {
      version: metadata.appVersion,
      note: releaseNotes,
    },
  ];
}
