import { ElectronApplication, expect, JSHandle, Page } from "playwright/test";
import type { BrowserWindow } from 'electron';

export async function mainWindowTests({ electronApp, page }: { electronApp: ElectronApplication, page: Page }) {
    const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);
    const windowState = await window.evaluate(
        (mainWindow): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean }> => {
            const getState = () => ({
                isVisible: mainWindow.isVisible(),
                isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
                isCrashed: mainWindow.webContents.isCrashed(),
            });

            return new Promise(resolve => {
                /**
                 * The main window is created hidden, and is shown only when it is ready.
                 */
                if (mainWindow.isVisible()) {
                    resolve(getState());
                } else {
                    mainWindow.once('ready-to-show', () => resolve(getState()));
                }
            });
        },
    );

    expect(windowState.isCrashed, 'The app has crashed').toEqual(false);
    expect(windowState.isVisible, 'The main window was not visible').toEqual(true);
    expect(windowState.isDevToolsOpened, 'The DevTools panel was open').toEqual(false);
}