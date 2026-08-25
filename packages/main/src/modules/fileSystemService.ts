import { type BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import type { AppModule, ModuleContext } from "./types.js";
import { asyncTrycatch, syncTrycatch } from "../helpers.js";
import type { TrycatchResult } from "../types.ts";

class FileSystemService {
  constructor(private readonly context: ModuleContext) {}

  private getBrowserWindow(): BrowserWindow {
    if (this.context.browserWindow && !this.context.browserWindow.isDestroyed()) {
      return this.context.browserWindow;
    }

    throw new Error("Browser window is not created");
  }

  async selectDirectory(): Promise<TrycatchResult<string>> {
    return asyncTrycatch(async () => {
      const result = await dialog.showOpenDialog(this.getBrowserWindow(), {
        properties: ["openDirectory"],
      });

      if (result.canceled) return "";
      return result.filePaths[0];
    });
  }

  async selectFile(
    directory?: string,
  ): Promise<TrycatchResult<{ directory: string; fileName: string } | null>> {
    return asyncTrycatch(async () => {
      const result = await dialog.showOpenDialog(this.getBrowserWindow(), {
        properties: ["openFile"],
        defaultPath: directory,
        filters: [
          { name: "SQLite", extensions: ["db", "sqlite", "sqlite3"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (result.canceled) return null;
      return {
        directory: path.dirname(result.filePaths[0]),
        fileName: path.basename(result.filePaths[0]),
      };
    });
  }

  async openPath(path: string): Promise<TrycatchResult<void>> {
    return syncTrycatch(() => shell.showItemInFolder(path));
  }
}

export type FileSystemServiceInterface = Pick<
  FileSystemService,
  "selectDirectory" | "selectFile" | "openPath"
>;

export class FileSystemServiceModule implements AppModule {
  enable(context: ModuleContext): void {
    const service = new FileSystemService(context);

    ipcMain.handle("select-directory", (_event) => {
      return service.selectDirectory();
    });

    ipcMain.handle(
      "select-file",
      (_event, ...args: Parameters<typeof service.selectFile>) => {
        return service.selectFile(...args);
      },
    );

    ipcMain.handle(
      "open-path",
      (_event, ...args: Parameters<typeof service.openPath>) => {
        return service.openPath(...args);
      },
    );
  }
}
