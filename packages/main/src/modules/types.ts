import type { BrowserWindow } from "electron";

export type ModuleContext = {
  readonly app: Electron.App;
  browserWindow?: BrowserWindow;
};

export interface AppModule {
  enable(context: ModuleContext): Promise<void> | void;
}

export type AppInitConfig = {
  preload: { path: string };
  renderer: { path: string } | URL;
};
