import { ipcMain } from "electron";
import type { CancellationToken } from "electron-updater";
import type { LastFetchedUpdateModule } from "./LastFetchedUpdateModule.js";
import type { AppInfoModule } from "./AppInfoModule.js";
import { asyncTrycatch, syncTrycatch, isGreaterVersion } from "../helpers.js";
import { WindowManagerModule } from "./WindowManagerModule.js";

type ElectronUpdaterModule = typeof import("electron-updater");

class AppUpdaterService {
  constructor(
    private readonly appInfoModule: AppInfoModule,
    private readonly windowManagerModule: WindowManagerModule,
    private readonly lastFetchedUpdateModule: LastFetchedUpdateModule,
  ) {}

  #updaterPromise: Promise<ElectronUpdaterModule> | null = null;

  #cancellationToken: CancellationToken | null = null;

  #getUpdater(): Promise<ElectronUpdaterModule> {
    if (!this.#updaterPromise) {
      this.#updaterPromise = import("electron-updater").then((electronUpdater) => {
        const { autoUpdater } = electronUpdater;
        autoUpdater.autoDownload = false;
        autoUpdater.fullChangelog = true;
        autoUpdater.forceDevUpdateConfig =
          this.appInfoModule.metadata.environment === "development";
        autoUpdater.on("download-progress", (progressInfo) => {
          this.windowManagerModule.browserWindow?.webContents.send(
            "downloading-update-progress",
            progressInfo,
          );
        });

        return electronUpdater;
      });
    }

    return this.#updaterPromise;
  }

  async checkForUpdate() {
    return asyncTrycatch(async () => {
      const { autoUpdater } = await this.#getUpdater();
      const newUpdate = await autoUpdater.checkForUpdatesAndNotify();
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
      const { CancellationToken, autoUpdater } = await this.#getUpdater();
      this.#cancellationToken = new CancellationToken();
      return autoUpdater.downloadUpdate(this.#cancellationToken);
    });
  }

  async cancelUpdate() {
    return syncTrycatch(() => {
      if (this.#cancellationToken && !this.#cancellationToken.cancelled) {
        this.#cancellationToken.cancel();
      }
    });
  }

  async quitAndInstallUpdate() {
    return asyncTrycatch(async () => {
      const { autoUpdater } = await this.#getUpdater();
      return autoUpdater.quitAndInstall();
    });
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
    const service = new AppUpdaterService(
      appInfoModule,
      windowManagerModule,
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
