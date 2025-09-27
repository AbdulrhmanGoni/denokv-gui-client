import { ipcRenderer } from 'electron';

export function checkForUpdate() {
    return ipcRenderer.invoke("check-for-update");
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
