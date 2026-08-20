import { appUpdater, lastFetchedUpdateService, metadata } from "@app/preload";
import { toast } from "svelte-sonner";
import newUpdateNotificationActions from "$lib/features/settings/newUpdateNotificationActions.svelte";

type UpdateAppState = {
  downloadUpdateProgress: DownloadUpdateProgressInfo | null;
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

function notifyUserForNewUpdate(update: UpdateCheckResult, message: string) {
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
        onClick: async () => {
          dismiss();
          const { error } = await lastFetchedUpdateService.doNotNotifyLastFetchedUpdate();
          if (error) toast.error(error);
        },
      },
      description: (internals) => newUpdateNotificationActions(internals, { dismiss }),
      id: toastId,
    });
  }
}

export async function startCheckingForUpdates() {
  const lastFetchedUpdateResponse = await lastFetchedUpdateService.getLastFetchedUpdate();
  if (lastFetchedUpdateResponse.error)
    return toast.error(lastFetchedUpdateResponse.error);
  const lastFetchedUpdate = lastFetchedUpdateResponse.result;
  if (lastFetchedUpdate) {
    if (!lastFetchedUpdate.doNotNotify) {
      notifyUserForNewUpdate(
        lastFetchedUpdate.data,
        `A new update is available (v${lastFetchedUpdate.data.updateInfo.version})`,
      );
    }
    updateAppState.newUpdate = lastFetchedUpdate.data;
    updateAppState.checkingForUpdatesDone = true;
    const checkResponse = await appUpdater.checkForUpdate();
    if (checkResponse.error) {
      toast.error(checkResponse.error);
      return;
    }

    updateAppState.newUpdate = checkResponse.result;
    if (updateAppState.newUpdate) {
      const isNewerVersion =
        lastFetchedUpdate.data.updateInfo.version !==
        updateAppState.newUpdate.updateInfo.version;
      if (isNewerVersion && !lastFetchedUpdate.doNotNotify) {
        notifyUserForNewUpdate(
          updateAppState.newUpdate,
          `A newer update is available (v${updateAppState.newUpdate.updateInfo.version})`,
        );
      }
    }
    return;
  }

  updateAppState.checkingForUpdates = true;
  try {
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
      notifyUserForNewUpdate(
        updateAppState.newUpdate,
        `A new update is available (v${updateAppState.newUpdate.updateInfo.version})`,
      );
    }
  } catch (error) {
    updateAppState.checkingForUpdatesError = String(error);
    updateAppState.checkingForUpdatesDone = false;
  } finally {
    updateAppState.checkingForUpdates = false;
  }
}

export async function startDownloadingUpdate() {
  updateAppState.downloadingUpdates = true;
  try {
    updateAppState.downloadUpdateProgress = null;
    const downloadPromise = appUpdater.downloadUpdate();
    appUpdater.onDownloadingUpdateProgress((progressInfo) => {
      updateAppState.downloadUpdateProgress = progressInfo;
    });

    const { error } = await downloadPromise;
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
  const { result: releaseNotes, error } = await metadata.getCurrentVersionReleaseNotes();
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
