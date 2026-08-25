import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import { getSettings } from "./settingsService.js";
import { syncTrycatch } from "../helpers.js";
import type { TrycatchResult } from "../types.ts";

class HardwareAccelerationService {
  constructor(private readonly app: Electron.App) {}

  async isEnabled(): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() => this.app.isHardwareAccelerationEnabled());
  }
}

export type HardwareAccelerationInterface = Pick<
  HardwareAccelerationService,
  "isEnabled"
>;

export class HardwareAccelerationModule implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    const settings = getSettings();
    if (settings?.disableHardwareAcceleration === true) {
      app.disableHardwareAcceleration();
    }

    const service = new HardwareAccelerationService(app);

    ipcMain.handle("hardwareAcceleration:isEnabled", (_event) => {
      return service.isEnabled();
    });
  }
}
