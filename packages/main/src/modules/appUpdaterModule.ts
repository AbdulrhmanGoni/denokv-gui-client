import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import electronUpdater from 'electron-updater';
import { setLastFetchedUpdate } from './lastFetchedUpdateService.js';
import * as metadata from './metadataModule.js';
import { isGreaterVersion } from '../helpers.js';

let cancellationToken: electronUpdater.CancellationToken | null = null;

export class AppUpdaterModule implements AppModule {
    enable(context: ModuleContext): void {
        const { autoUpdater } = electronUpdater;
        autoUpdater.autoDownload = false;
        autoUpdater.fullChangelog = true;
        autoUpdater.on('download-progress', (progressInfo) => {
            context.browserWindow?.webContents.send('downloading-update-progress', progressInfo)
        })

        ipcMain.handle("check-for-update", async () => {
            const newUpdate = await autoUpdater.checkForUpdatesAndNotify();
            if (newUpdate && isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)) {
                setLastFetchedUpdate(newUpdate)
                return newUpdate
            }
            return null
        });

        ipcMain.handle("download-update", () => {
            cancellationToken = new electronUpdater.CancellationToken();
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
