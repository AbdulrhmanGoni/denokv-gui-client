import type { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';
import { ipcMain } from 'electron';
import * as kvStoresService from '../services/kvStoresService.js';
import * as kvClient from '../server/kvServerClient.js';
import * as bridgeServer from '../server/server.js';
import * as settingsService from '../services/settingsService.js';
import * as lastFetchedUpdateService from '../services/lastFetchedUpdateService.js';
import * as browsingParamsService from '../services/browsingParamsService.js';
import * as appUpdater from '../appUpdater.js';
import * as versions from '../versions.js';

class BusinessLogicModule implements AppModule {
    async enable({ }: ModuleContext): Promise<void> {
        this.registerHandlers('kvStoresService', kvStoresService);
        this.registerHandlers('kvClient', kvClient);
        this.registerHandlers('bridgeServer', bridgeServer);
        this.registerHandlers('settingsService', settingsService);
        this.registerHandlers('lastFetchedUpdateService', lastFetchedUpdateService);
        this.registerHandlers('browsingParamsService', browsingParamsService);

        ipcMain.handle('check-for-update', () => appUpdater.checkForUpdate());
        ipcMain.handle('download-update', () => appUpdater.downloadUpdate());
        ipcMain.handle('cancel-downloading-update', () => appUpdater.cancelUpdate());
        ipcMain.handle('quit-and-install-update', () => appUpdater.quitAndInstallUpdate());

        ipcMain.handle('get-versions', () => ({ ...versions }));
        ipcMain.handle('get-environment', () => {
            return process.env.PLAYWRIGHT_TEST == 'true' ? 'testing' :
                process.env.NODE_ENV == 'development' ? 'development' : 'production';
        });
    }

    private registerHandlers(namespace: string, service: any) {
        for (const key of Object.keys(service)) {
            if (typeof service[key] === 'function') {
                ipcMain.handle(`${namespace}:${key}`, async (_, ...args) => {
                    return await service[key](...args);
                });
            }
        }
    }
}

export function createBusinessLogicModule() {
    return new BusinessLogicModule();
}
