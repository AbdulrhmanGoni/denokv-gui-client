import { dialog, ipcMain, shell } from "electron";
import path from "node:path";
import { asyncTrycatch, syncTrycatch } from "../helpers.js";
import type { TrycatchResult } from "../types.ts";
import { WindowManagerModule } from "./WindowManagerModule.js";

class FileSystemService {
  constructor(private readonly windowManagerModule: WindowManagerModule) {}

  async selectDirectory(): Promise<TrycatchResult<string>> {
    return asyncTrycatch(async () => {
      const result = await dialog.showOpenDialog(this.windowManagerModule.browserWindow, {
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
      const result = await dialog.showOpenDialog(this.windowManagerModule.browserWindow, {
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

export class FileSystemModule {
  constructor(windowManagerModule: WindowManagerModule) {
    const service = new FileSystemService(windowManagerModule);

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
