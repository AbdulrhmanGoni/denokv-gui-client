import type { AppInitConfig } from './AppInitConfig.js';
import { createModuleRunner } from './ModuleRunner.js';
import { disallowMultipleAppInstance } from './modules/SingleInstanceApp.js';
import { createWindowManagerModule } from './modules/WindowManager.js';
import { hardwareAccelerationMode } from './modules/HardwareAccelerationModule.js';
import { createWebContentsUrlPolicy } from './modules/WebContentsUrlPolicy.js';
import { BridgeServerModule } from './modules/bridgeServer.js';
import { KvStoresServiceModule } from './modules/kvStoresService.js';
import { SettingsServiceModule } from './modules/settingsService.js';
import { LastFetchedUpdateServiceModule } from './modules/lastFetchedUpdateService.js';
import { BrowsingParamsServiceModule } from './modules/browsingParamsService.js';
import { AppUpdaterModule } from './modules/appUpdaterModule.js';
import { MetadataModule } from './modules/metadataModule.js';
import { KvServerClientModule } from './modules/kvServerClientModule.js';
import { WatchedKeysServiceModule } from './modules/watchedKeysService.js';
import { FileSystemServiceModule } from './modules/fileSystemService.js';

export async function initApp(initConfig: AppInitConfig) {
  await createModuleRunner()
    .init(createWindowManagerModule({ initConfig, openDevTools: import.meta.env.DEV }))
    .init(disallowMultipleAppInstance())
    .init(hardwareAccelerationMode({ enable: false }))
    .init(new FileSystemServiceModule())
    .init(new KvStoresServiceModule())
    .init(new BridgeServerModule())
    .init(new SettingsServiceModule())
    .init(new LastFetchedUpdateServiceModule())
    .init(new BrowsingParamsServiceModule())
    .init(new AppUpdaterModule())
    .init(new MetadataModule())
    .init(new KvServerClientModule())
    .init(new WatchedKeysServiceModule())
    .init(createWebContentsUrlPolicy(initConfig.renderer instanceof URL ? initConfig.renderer.origin : ''));
}
