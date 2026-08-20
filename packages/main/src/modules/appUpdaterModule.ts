import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import electronUpdater from "electron-updater";
import { setLastFetchedUpdate } from "./lastFetchedUpdateService.js";
import * as metadata from "./metadataModule.js";
import { asyncTrycatch, syncTrycatch, isGreaterVersion } from "../helpers.js";

let cancellationToken: electronUpdater.CancellationToken | null = null;

export interface AppUpdaterInterface {
  checkForUpdate(): Promise<TrycatchResult<UpdateCheckResult | null>>;
  downloadUpdate(): Promise<TrycatchResult<Array<string>>>;
  cancelUpdate(): Promise<TrycatchResult<void>>;
  quitAndInstallUpdate(): Promise<TrycatchResult<void>>;
}

export class AppUpdaterModule implements AppModule {
  enable(context: ModuleContext): void {
    const { autoUpdater } = electronUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.fullChangelog = true;
    autoUpdater.forceDevUpdateConfig = metadata.environment === "development";
    autoUpdater.on("download-progress", (progressInfo) => {
      context.browserWindow?.webContents.send(
        "downloading-update-progress",
        progressInfo,
      );
    });

    const checkForUpdate: AppUpdaterInterface["checkForUpdate"] = async () => {
      return asyncTrycatch(async () => {
        const newUpdate = await autoUpdater.checkForUpdatesAndNotify();
        if (
          newUpdate &&
          isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)
        ) {
          setLastFetchedUpdate(newUpdate);
          return newUpdate;
        }
        return null;
      });
    };
    ipcMain.handle("check-for-update", checkForUpdate);

    const downloadUpdate: AppUpdaterInterface["downloadUpdate"] = () => {
      return asyncTrycatch(async () => {
        cancellationToken = new electronUpdater.CancellationToken();
        return autoUpdater.downloadUpdate(cancellationToken);
      });
    };
    ipcMain.handle("download-update", downloadUpdate);

    const cancelUpdate: AppUpdaterInterface["cancelUpdate"] = async () => {
      return syncTrycatch(() => {
        if (cancellationToken && !cancellationToken.cancelled) {
          cancellationToken.cancel();
        }
      });
    };
    ipcMain.handle("cancel-downloading-update", cancelUpdate);

    const quitAndInstallUpdate: AppUpdaterInterface["quitAndInstallUpdate"] =
      async () => {
        return syncTrycatch(() => autoUpdater.quitAndInstall());
      };
    ipcMain.handle("quit-and-install-update", quitAndInstallUpdate);
  }
}
