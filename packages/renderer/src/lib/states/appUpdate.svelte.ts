import { appUpdater, lastFetchedUpdateService } from "@app/preload"
import { toast } from "svelte-sonner"
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
    openReleaseNotes: boolean;
}

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
    openReleaseNotes: false,
})

function notifyUserForNewUpdate(update: UpdateCheckResult, message: string) {
    if (update.isUpdateAvailable) {
        const toastId = "new-update-notification:" + update.updateInfo.version
        const dismiss = () => toast.dismiss(toastId)
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
                onClick: () => {
                    dismiss();
                    lastFetchedUpdateService.doNotNotifyLastFetchedUpdate();
                }
            },
            description: (internals) => (
                newUpdateNotificationActions(internals, { dismiss })
            ),
            id: toastId
        })
    }
}

export async function startCheckingForUpdates() {
    const lastFetchedUpdate = await lastFetchedUpdateService.getLastFetchedUpdate()
    if (lastFetchedUpdate) {
        !lastFetchedUpdate.doNotNotify && notifyUserForNewUpdate(
            lastFetchedUpdate.data,
            `A new update is available (v${lastFetchedUpdate.data.updateInfo.version})`
        )
        updateAppState.newUpdate = lastFetchedUpdate.data
        updateAppState.checkingForUpdatesDone = true
        updateAppState.newUpdate = await appUpdater.checkForUpdate()
        if (updateAppState.newUpdate) {
            const isNewerVersion = lastFetchedUpdate.data.updateInfo.version !== updateAppState.newUpdate.updateInfo.version
            if (isNewerVersion && !lastFetchedUpdate.doNotNotify) {
                notifyUserForNewUpdate(
                    updateAppState.newUpdate,
                    `A newer update is available (v${updateAppState.newUpdate.updateInfo.version})`
                )
            }
        }
        return
    }

    updateAppState.checkingForUpdates = true;
    try {
        updateAppState.newUpdate = await appUpdater.checkForUpdate();
        updateAppState.checkingForUpdatesDone = true
        updateAppState.checkingForUpdatesError = "";
        if (updateAppState.newUpdate) {
            notifyUserForNewUpdate(
                updateAppState.newUpdate,
                `A new update is available (v${updateAppState.newUpdate.updateInfo.version})`
            )
        }
    } catch (error) {
        updateAppState.checkingForUpdatesError = String(error);
        updateAppState.checkingForUpdatesDone = false
    } finally {
        updateAppState.checkingForUpdates = false;
    }
}

export async function startDownloadingUpdate() {
    updateAppState.downloadingUpdates = true;
    try {
        const downloadPromise = appUpdater.downloadUpdate();
        updateAppState.downloadUpdateProgress = null
        appUpdater.onDownloadingUpdateProgress((progressInfo) => {
            updateAppState.downloadUpdateProgress = progressInfo
        })

        await downloadPromise

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
    await appUpdater.cancelUpdate()
    updateAppState.downloadingUpdates = false;
    updateAppState.downloadingUpdatesError = "";
    updateAppState.downloadingUpdatesDone = false;
}

export function quitAndInstallTheUpdate() {
    appUpdater.quitAndInstallUpdate()
}
