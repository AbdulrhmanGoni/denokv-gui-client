import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import electronUpdater from "electron-updater";
import { setLastFetchedUpdate } from "./lastFetchedUpdateService.js";
import * as metadata from "./metadataModule.js";
import { isGreaterVersion } from "../helpers.js";

let cancellationToken: electronUpdater.CancellationToken | null = null;

export interface AppUpdaterInterface {
  checkForUpdate(): Promise<UpdateCheckResult | null>;
  downloadUpdate(): Promise<any>;
  cancelUpdate(): Promise<void>;
  quitAndInstallUpdate(): Promise<void>;
}

export class AppUpdaterModule implements AppModule {
  enable(context: ModuleContext): void {
    const { autoUpdater } = electronUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.fullChangelog = true;
    autoUpdater.on("download-progress", (progressInfo) => {
      context.browserWindow?.webContents.send(
        "downloading-update-progress",
        progressInfo,
      );
    });

    const checkForUpdate: AppUpdaterInterface["checkForUpdate"] = async () => {
      const newUpdate = await autoUpdater.checkForUpdatesAndNotify();
      if (
        newUpdate &&
        isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)
      ) {
        setLastFetchedUpdate(newUpdate);
        return newUpdate;
      }
      return null;
    };
    ipcMain.handle("check-for-update", checkForUpdate);

    const downloadUpdate: AppUpdaterInterface["downloadUpdate"] = () => {
      cancellationToken = new electronUpdater.CancellationToken();
      return autoUpdater.downloadUpdate(cancellationToken);
    };
    ipcMain.handle("download-update", downloadUpdate);

    const cancelUpdate: AppUpdaterInterface["cancelUpdate"] = async () => {
      if (cancellationToken && !cancellationToken.cancelled) {
        cancellationToken.cancel();
      }
    };
    ipcMain.handle("cancel-downloading-update", cancelUpdate);

    const quitAndInstallUpdate: AppUpdaterInterface["quitAndInstallUpdate"] =
      async () => {
        autoUpdater.quitAndInstall();
      };
    ipcMain.handle("quit-and-install-update", quitAndInstallUpdate);
  }
}
