import { BrowserWindow, screen } from "electron";
import type { AppInitConfig } from "./types.js";

export class WindowManagerModule {
  #browserWindow: BrowserWindow | null = null;

  constructor(
    private readonly app: Electron.App,
    private readonly initConfig: AppInitConfig,
  ) {
    this.#restoreOrCreateWindow(false);
    this.app.on("second-instance", () => this.#restoreOrCreateWindow(true));
    this.app.on("activate", () => this.#restoreOrCreateWindow(true));
  }

  get browserWindow(): BrowserWindow {
    if (!this.#browserWindow) {
      throw new Error("Trying to get the browser window while it's not created yet!");
    }

    return this.#browserWindow;
  }

  #createWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    return new BrowserWindow({
      show: false,
      height: Math.min(800, workAreaSize.height),
      width: Math.min(1400, workAreaSize.width),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        webviewTag: false,
        preload: this.initConfig.preload.path,
        webSecurity: true,
      },
    });
  }

  #restoreOrCreateWindow(loadFrontEndImmediately: boolean) {
    let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

    this.#browserWindow = window ?? this.#createWindow();

    if (this.#browserWindow.isMinimized()) {
      this.#browserWindow.restore();
    }

    if (import.meta.env.DEV) {
      this.#browserWindow.webContents.openDevTools();
    }

    if (loadFrontEndImmediately) {
      if (window) {
        this.#browserWindow.show();
        this.#browserWindow.focus();
      } else {
        this.loadFrontEnd();
      }
    }
  }

  async loadFrontEnd() {
    if (this.initConfig.renderer instanceof URL) {
      await this.browserWindow.loadURL(this.initConfig.renderer.href);
    } else {
      await this.browserWindow.loadFile(this.initConfig.renderer.path);
    }

    this.browserWindow.show();
  }
}
