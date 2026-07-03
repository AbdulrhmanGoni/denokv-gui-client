import type { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { ipcMain } from "electron";
import os from "node:os";

export class AppManagerModule implements AppModule {
  constructor() {}

  async enable(context: ModuleContext): Promise<void> {
    const isSingleInstance = context.app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      context.app.quit();
      process.exit(0);
    }

    context.app.on("window-all-closed", () => context.app.quit());

    ipcMain.handle("restart-app", () => {
      let relaunchOptions: Electron.RelaunchOptions | undefined = undefined;
      if (os.platform() == "linux" && process.env.APPIMAGE && context.app.isPackaged) {
        relaunchOptions = {
          execPath: process.env.APPIMAGE,
          args: ["--appimage-extract-and-run"],
        };
      }
      context.app.relaunch(relaunchOptions);
      context.app.exit();
    });

    await context.app.whenReady();
  }
}
