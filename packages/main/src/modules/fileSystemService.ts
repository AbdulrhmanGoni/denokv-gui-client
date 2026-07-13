import { type BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import type { AppModule, ModuleContext } from "./types.js";

export interface FileSystemServiceInterface {
  selectDirectory(): Promise<string>;
  selectFile(directory?: string): Promise<{ directory: string; fileName: string } | null>;
  openPath(path: string): void;
}

export class FileSystemServiceModule implements AppModule {
  enable(context: ModuleContext): void {
    const selectDirectory: FileSystemServiceInterface["selectDirectory"] = async () => {
      const result = await dialog.showOpenDialog(getBrowserWindow(context), {
        properties: ["openDirectory"],
      });

      if (result.canceled) return "";
      return result.filePaths[0];
    };
    ipcMain.handle("select-directory", selectDirectory);

    const selectFile: FileSystemServiceInterface["selectFile"] = async (directory) => {
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
    };
    ipcMain.handle("select-file", (_, ...args: Parameters<typeof selectFile>) => {
      return selectFile(...args);
    });

    const openPath: FileSystemServiceInterface["openPath"] = (path) => {
      return shell.showItemInFolder(path);
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
