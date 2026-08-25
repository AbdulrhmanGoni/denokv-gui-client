import type { AppModule, ModuleContext } from "./types.js";
import { ipcMain } from "electron";
import os from "node:os";
import { syncTrycatch } from "../helpers.js";
import { getSettings } from "./settingsService.js";

class AppManagerService {
  constructor(private readonly context: ModuleContext) {}

  async restartApp() {
    return syncTrycatch(() => {
      let relaunchOptions: Electron.RelaunchOptions | undefined = undefined;
      if (
        os.platform() == "linux" &&
        process.env.APPIMAGE &&
        this.context.app.isPackaged
      ) {
        relaunchOptions = {
          execPath: process.env.APPIMAGE,
          args: ["--appimage-extract-and-run"],
        };
      }

      this.context.app.relaunch(relaunchOptions);
      this.context.app.exit();
    });
  }
}

export type AppManagerInterface = Pick<AppManagerService, "restartApp">;

export class AppManagerModule implements AppModule {
  constructor() {}

  async enable(context: ModuleContext): Promise<void> {
    const isSingleInstance = context.app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      context.app.quit();
      process.exit(0);
    }

    context.app.on("window-all-closed", () => context.app.quit());

    const settings = getSettings();
    if (settings?.disableHardwareAcceleration === true) {
      context.app.disableHardwareAcceleration();
    }

    const service = new AppManagerService(context);

    ipcMain.handle("restart-app", (_event) => service.restartApp());

    await context.app.whenReady();
  }
}
