import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import type { CancellationToken } from 'electron-updater';
import electronUpdater from 'electron-updater';
const { autoUpdater, CancellationToken: CancellationTokenConstructor } = electronUpdater;
import { setLastFetchedUpdate } from './lastFetchedUpdateService.js';
import * as metadata from './metadataModule.js';
import { isGreaterVersion } from '../helpers.js';

let cancellationToken: CancellationToken | null = null;

export class AppUpdaterModule implements AppModule {
    enable(_context: ModuleContext): void {
        ipcMain.handle("check-for-update", async () => {
            const newUpdate = await autoUpdater.checkForUpdatesAndNotify();
            if (newUpdate && isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)) {
                setLastFetchedUpdate(newUpdate)
                return newUpdate
            }
            return null
        });

        ipcMain.handle("download-update", () => {
            cancellationToken = new CancellationTokenConstructor();
            return autoUpdater.downloadUpdate(cancellationToken);
        });

        ipcMain.handle("cancel-downloading-update", () => {
            if (cancellationToken && !cancellationToken.cancelled) {
                cancellationToken.cancel();
            }
        });

        ipcMain.handle("quit-and-install-update", () => {
            autoUpdater.quitAndInstall();
        });
    }
}
