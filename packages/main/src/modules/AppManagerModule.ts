import { ipcMain } from "electron";
import os from "node:os";
import { syncTrycatch } from "../helpers.js";
import type { SettingsModule } from "./SettingsModule.js";

class AppManagerService {
  constructor(private readonly app: Electron.App) {}

  async restartApp() {
    return syncTrycatch(() => {
      let relaunchOptions: Electron.RelaunchOptions | undefined = undefined;
      if (os.platform() == "linux" && process.env.APPIMAGE && this.app.isPackaged) {
        relaunchOptions = {
          execPath: process.env.APPIMAGE,
          args: ["--appimage-extract-and-run"],
        };
      }

      this.app.relaunch(relaunchOptions);
      this.app.exit();
    });
  }
}

export type AppManagerServiceInterface = Pick<AppManagerService, "restartApp">;

export class AppManagerModule {
  #appReadinessPromise: Promise<void>;

  constructor(app: Electron.App, settingsModule: SettingsModule) {
    const isSingleInstance = app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      app.quit();
      process.exit(0);
    }

    app.on("window-all-closed", () => app.quit());

    const settings = settingsModule.service.fetchSettings();
    if (settings?.disableHardwareAcceleration === true) {
      app.disableHardwareAcceleration();
    }

    const service = new AppManagerService(app);

    ipcMain.handle("restart-app", (_event) => service.restartApp());

    this.#appReadinessPromise = app.whenReady();
  }

  async waitAppToBeReady(): Promise<void> {
    await this.#appReadinessPromise;
  }
}
