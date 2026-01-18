import type { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import type { AppInitConfig } from '../AppInitConfig.js';
import electronUpdater from 'electron-updater';

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;

  constructor({ initConfig, openDevTools = false }: { initConfig: AppInitConfig, openDevTools?: boolean }) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable({ app }: ModuleContext): Promise<void> {
    await app.whenReady();
    await this.restoreOrCreateWindow(true);
    app.on('second-instance', () => this.restoreOrCreateWindow(true));
    app.on('activate', () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      height: 800,
      width: 1400,
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

    ipcMain.handle('open-path', async (_, path) => {
      return shell.showItemInFolder(path);
    });

    const { autoUpdater } = electronUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.fullChangelog = true;

    autoUpdater.on('download-progress', (progressInfo) => {
      browserWindow.webContents.send('downloading-update-progress', progressInfo)
    })

    browserWindow.webContents.send('window-ready')

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
