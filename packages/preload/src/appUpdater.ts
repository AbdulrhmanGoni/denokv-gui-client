import { ipcRenderer } from 'electron';
import { lastFetchedUpdateService, versions } from './index.js';
import { isGreaterVersion } from './helpers.js';

export async function checkForUpdate() {
    const newUpdate = await ipcRenderer.invoke("check-for-update") as UpdateCheckResult | null;
    if (newUpdate && isGreaterVersion(newUpdate.updateInfo.version, versions.appVersion)) {
        lastFetchedUpdateService.setLastFetchedUpdate(newUpdate)
        return newUpdate
    }
    return null
}

export function downloadUpdate() {
    return ipcRenderer.invoke("download-update");
}

export function cancelUpdate() {
    ipcRenderer.invoke("cancel-downloading-update");
}

export function onDownloadingUpdateProgress(cb: (progressInfo: DownloadUpdateProgressInfo) => void) {
    ipcRenderer.on("downloading-update-progress", (_, progressInfo) => cb(progressInfo));
}

export function quitAndInstallUpdate() {
    ipcRenderer.invoke("quit-and-install-update");
}
