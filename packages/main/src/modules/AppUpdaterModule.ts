import { ipcMain } from "electron";
import electronUpdater from "electron-updater";
import type { LastFetchedUpdateModule } from "./LastFetchedUpdateModule.js";
import type { AppInfoModule } from "./AppInfoModule.js";
import { asyncTrycatch, syncTrycatch, isGreaterVersion } from "../helpers.js";
import { WindowManagerModule } from "./WindowManagerModule.js";

class AppUpdaterService {
  constructor(
    private readonly autoUpdater: typeof electronUpdater.autoUpdater,
    private readonly appInfoModule: AppInfoModule,
    private readonly lastFetchedUpdateModule: LastFetchedUpdateModule,
  ) {}

  private cancellationToken: electronUpdater.CancellationToken | null = null;

  async checkForUpdate() {
    return asyncTrycatch(async () => {
      const newUpdate = await this.autoUpdater.checkForUpdatesAndNotify();
      if (
        newUpdate &&
        isGreaterVersion(
          newUpdate.updateInfo.version,
          this.appInfoModule.metadata.appVersion,
        )
      ) {
        this.lastFetchedUpdateModule.service.updatedLastFetchedUpdate(newUpdate);
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

export type AppUpdaterServiceInterface = Pick<
  AppUpdaterService,
  "checkForUpdate" | "downloadUpdate" | "cancelUpdate" | "quitAndInstallUpdate"
>;

export class AppUpdaterModule {
  constructor(
    appInfoModule: AppInfoModule,
    windowManagerModule: WindowManagerModule,
    lastFetchedUpdateModule: LastFetchedUpdateModule,
  ) {
    const { autoUpdater } = electronUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.fullChangelog = true;
    autoUpdater.forceDevUpdateConfig =
      appInfoModule.metadata.environment === "development";
    autoUpdater.on("download-progress", (progressInfo) => {
      windowManagerModule.browserWindow?.webContents.send(
        "downloading-update-progress",
        progressInfo,
      );
    });

    const service = new AppUpdaterService(
      autoUpdater,
      appInfoModule,
      lastFetchedUpdateModule,
    );

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
