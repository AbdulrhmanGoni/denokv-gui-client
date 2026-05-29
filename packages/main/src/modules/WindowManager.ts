import type { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';
import { BrowserWindow, dialog, ipcMain, screen, shell } from 'electron';
import type { AppInitConfig } from '../AppInitConfig.js';
import path from 'node:path';

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;

  constructor({ initConfig, openDevTools = false }: { initConfig: AppInitConfig, openDevTools?: boolean }) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable(context: ModuleContext): Promise<void> {
    await context.app.whenReady();
    context.browserWindow = await this.restoreOrCreateWindow(true);
    context.app.on('second-instance', () => this.restoreOrCreateWindow(true));
    context.app.on('activate', () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const browserWindow = new BrowserWindow({
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      height: Math.min(800, workAreaSize.height),
      width: Math.min(1400, workAreaSize.width),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        webviewTag: false,
        preload: this.#preload.path,
        webSecurity: true,
      },
    });

    if (this.#renderer instanceof URL) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    ipcMain.handle('select-directory', async () => {
      const result = await dialog.showOpenDialog(browserWindow, {
        properties: ['openDirectory'],
      });

      if (result.canceled) return "";
      return result.filePaths[0];
    });

    ipcMain.handle('select-file', async (_, directory?: string) => {
      const result = await dialog.showOpenDialog(browserWindow, {
        properties: ['openFile'],
        defaultPath: directory,
      });

      if (result.canceled) return null;
      return {
        directory: path.dirname(result.filePaths[0]),
        fileName: path.basename(result.filePaths[0])
      };
    });

    ipcMain.handle('open-path', async (_, path) => {
      return shell.showItemInFolder(path);
    });

    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window === undefined) {
      window = await this.createWindow();
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window?.show();

    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    window.focus();

    return window;
  }

}

export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>) {
  return new WindowManager(...args);
}
