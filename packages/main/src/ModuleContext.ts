import type { BrowserWindow } from 'electron';

export type ModuleContext = {
  readonly app: Electron.App;
  browserWindow?: BrowserWindow;
}
