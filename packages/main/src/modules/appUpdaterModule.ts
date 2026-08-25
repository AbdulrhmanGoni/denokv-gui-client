import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import electronUpdater from "electron-updater";
import { setLastFetchedUpdate } from "./lastFetchedUpdateService.js";
import * as metadata from "./metadataModule.js";
import { asyncTrycatch, syncTrycatch, isGreaterVersion } from "../helpers.js";

class AppManagerService {
  constructor(private readonly autoUpdater: typeof electronUpdater.autoUpdater) {}

  private cancellationToken: electronUpdater.CancellationToken | null = null;

  async checkForUpdate() {
    return asyncTrycatch(async () => {
      const newUpdate = await this.autoUpdater.checkForUpdatesAndNotify();
      if (
        newUpdate &&
        isGreaterVersion(newUpdate.updateInfo.version, metadata.appVersion)
      ) {
        setLastFetchedUpdate(newUpdate);
        return newUpdate;
      }
      return null;
    });
  }

  async downloadUpdate() {
    return asyncTrycatch(async () => {
      this.cancellationToken = new electronUpdater.CancellationToken();
      return this.autoUpdater.downloadUpdate(this.cancellationToken);
    });
  }

  async cancelUpdate() {
    return syncTrycatch(() => {
      if (this.cancellationToken && !this.cancellationToken.cancelled) {
        this.cancellationToken.cancel();
      }
    });
  }

  async quitAndInstallUpdate() {
    return syncTrycatch(() => this.autoUpdater.quitAndInstall());
  }
}

export type AppUpdaterInterface = Pick<
  AppManagerService,
  "checkForUpdate" | "downloadUpdate" | "cancelUpdate" | "quitAndInstallUpdate"
>;

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

    const service = new AppManagerService(autoUpdater);

    ipcMain.handle("check-for-update", (_event) => {
      return service.checkForUpdate();
    });

    ipcMain.handle("download-update", (_event) => {
      return service.downloadUpdate();
    });

    ipcMain.handle("cancel-downloading-update", (_event) => {
      return service.cancelUpdate();
    });

    ipcMain.handle("quit-and-install-update", (_event) => {
      return service.quitAndInstallUpdate();
    });
  }
}
