import type { AppModule, ModuleContext } from "./types.js";
import { ipcMain } from "electron";
import os from "node:os";

export interface AppManagerInterface {
  restartApp: () => Promise<void>;
}

export class AppManagerModule implements AppModule {
  constructor() {}

  async enable(context: ModuleContext): Promise<void> {
    const isSingleInstance = context.app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      context.app.quit();
      process.exit(0);
    }

    context.app.on("window-all-closed", () => context.app.quit());

    const restartApp: AppManagerInterface["restartApp"] = async () => {
      let relaunchOptions: Electron.RelaunchOptions | undefined = undefined;
      if (os.platform() == "linux" && process.env.APPIMAGE && context.app.isPackaged) {
        relaunchOptions = {
          execPath: process.env.APPIMAGE,
          args: ["--appimage-extract-and-run"],
        };
      }
      context.app.relaunch(relaunchOptions);
      context.app.exit();
    };
    ipcMain.handle("restart-app", restartApp);

    await context.app.whenReady();
  }
}
