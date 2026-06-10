import { ipcMain } from 'electron';
import { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';
import { getSettings } from './settingsService.js';

export class HardwareAccelerationModule implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    const settings = getSettings()
    if (settings?.disableHardwareAcceleration === true) {
      app.disableHardwareAcceleration();
    }

    ipcMain.handle("isHardwareAccelerationEnabled", () => (
      app.isHardwareAccelerationEnabled()
    ));
  }
}
