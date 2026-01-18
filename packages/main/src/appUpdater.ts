import type { CancellationToken, UpdateCheckResult } from 'electron-updater';
import electronUpdater from 'electron-updater';
const { autoUpdater, CancellationToken: CancellationTokenConstructor } = electronUpdater;
import * as lastFetchedUpdateService from './services/lastFetchedUpdateService.js';
import * as metadata from './metadata.js';
import { isGreaterVersion } from './helpers.js';

let cancellationToken: CancellationToken | null = null;

export async function checkForUpdate() {
    const newUpdate = await autoUpdater.checkForUpdatesAndNotify() as any as UpdateCheckResult | null;
    if (newUpdate && isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)) {
        lastFetchedUpdateService.setLastFetchedUpdate(newUpdate)
        return newUpdate
    }
    return null
}

export function downloadUpdate() {
    cancellationToken = new CancellationTokenConstructor();
    return autoUpdater.downloadUpdate(cancellationToken);
}

export function cancelUpdate() {
    if (cancellationToken && !cancellationToken.cancelled) {
        cancellationToken.cancel();
    }
}

export function quitAndInstallUpdate() {
    autoUpdater.quitAndInstall();
}
