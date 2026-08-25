import { type BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import type { AppModule, ModuleContext } from "./types.js";
import { asyncTrycatch, syncTrycatch } from "../helpers.js";
import type { TrycatchResult } from "../types.ts";

export interface FileSystemServiceInterface {
  selectDirectory(): Promise<TrycatchResult<string>>;
  selectFile(
    directory?: string,
  ): Promise<TrycatchResult<{ directory: string; fileName: string } | null>>;
  openPath(path: string): Promise<TrycatchResult<void>>;
}

export class FileSystemServiceModule implements AppModule {
  enable(context: ModuleContext): void {
    const selectDirectory: FileSystemServiceInterface["selectDirectory"] = async () => {
      return asyncTrycatch(async () => {
        const result = await dialog.showOpenDialog(getBrowserWindow(context), {
          properties: ["openDirectory"],
        });

        if (result.canceled) return "";
        return result.filePaths[0];
      });
    };
    ipcMain.handle("select-directory", selectDirectory);

    const selectFile: FileSystemServiceInterface["selectFile"] = async (directory) => {
      return asyncTrycatch(async () => {
        const result = await dialog.showOpenDialog(getBrowserWindow(context), {
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
    };
    ipcMain.handle("select-file", (_, ...args: Parameters<typeof selectFile>) => {
      return selectFile(...args);
    });

    const openPath: FileSystemServiceInterface["openPath"] = async (path) => {
      return syncTrycatch(() => shell.showItemInFolder(path));
    };
    ipcMain.handle("open-path", (_, ...args: Parameters<typeof openPath>) => {
      return openPath(...args);
    });
  }
}

function getBrowserWindow(context: ModuleContext): BrowserWindow {
  if (context.browserWindow && !context.browserWindow.isDestroyed()) {
    return context.browserWindow;
  }

  throw new Error("Browser window not found");
}
