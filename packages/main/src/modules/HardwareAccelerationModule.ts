import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import { getSettings } from "./settingsService.js";

export interface HardwareAccelerationInterface {
  isEnabled(): Promise<boolean>;
}

export class HardwareAccelerationModule implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    const settings = getSettings();
    if (settings?.disableHardwareAcceleration === true) {
      app.disableHardwareAcceleration();
    }

    const isEnabled: HardwareAccelerationInterface["isEnabled"] = async () => {
      return app.isHardwareAccelerationEnabled();
    };
    ipcMain.handle("hardwareAcceleration:isEnabled", isEnabled);
  }
}
