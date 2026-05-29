import { type BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import type { AppModule } from "../AppModule.js";
import type { ModuleContext } from "../ModuleContext.js";

export class FileSystemServiceModule implements AppModule {
    enable(context: ModuleContext): void {
        ipcMain.handle('select-directory', async () => {
            const result = await dialog.showOpenDialog(getBrowserWindow(context), {
                properties: ['openDirectory'],
            });

            if (result.canceled) return "";
            return result.filePaths[0];
        });

        ipcMain.handle('select-file', async (_, directory?: string) => {
            const result = await dialog.showOpenDialog(getBrowserWindow(context), {
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
    }
}

function getBrowserWindow(context: ModuleContext): BrowserWindow {
    if (context.browserWindow && !context.browserWindow.isDestroyed()) {
        return context.browserWindow;
    }

    throw new Error("Browser window not found");
}
