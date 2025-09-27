import { appUpdater } from "@app/preload"

type GlobalState = {
    loadingOverlay: {
        open: boolean,
        text?: string,
    }
    openAddKvEntryForm: boolean,
    openSettings: boolean,
}

export const globalState: GlobalState = $state({
    loadingOverlay: {
        open: false,
    },
    openAddKvEntryForm: false,
    openSettings: false,
})

export function openAddKvEntryDialog() {
    globalState.openAddKvEntryForm = true
}

export function closeAddKvEntryDialog() {
    globalState.openAddKvEntryForm = false
}

type AutoUpdateState = {
    downloadUpdateProgress: DownloadUpdateProgressInfo | null;
    newUpdate: UpdateCheckResult | null;
    checkingForUpdates: boolean;
    checkingForUpdatesError: string;
    checkingForUpdatesDone: boolean;
    downloadingUpdates: boolean;
    downloadingUpdatesError: string;
    downloadingUpdatesDone: boolean;
}

export const updateAppState: AutoUpdateState = $state({
    status: null,
    downloadUpdateProgress: null,
    newUpdate: null,
    checkingForUpdates: false,
    checkingForUpdatesError: "",
    checkingForUpdatesDone: false,
    downloadingUpdates: false,
    downloadingUpdatesError: "",
    downloadingUpdatesDone: false,
})

export async function startCheckingForUpdates() {
    updateAppState.checkingForUpdates = true;
    try {
        updateAppState.newUpdate = await appUpdater.checkForUpdate();
        updateAppState.checkingForUpdatesDone = true
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
    appUpdater.cancelUpdate()
    updateAppState.downloadingUpdates = false;
    updateAppState.downloadingUpdatesError = "";
    updateAppState.downloadingUpdatesDone = false;
}

export function quitAndInstallTheUpdate() {
    appUpdater.quitAndInstallUpdate()
}
