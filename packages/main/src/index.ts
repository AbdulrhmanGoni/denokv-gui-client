import type { AppInitConfig } from './AppInitConfig.js';
import { createModuleRunner } from './ModuleRunner.js';
import { disallowMultipleAppInstance } from './modules/SingleInstanceApp.js';
import { createWindowManagerModule } from './modules/WindowManager.js';
import { terminateAppOnLastWindowClose } from './modules/ApplicationTerminatorOnLastWindowClose.js';
import { hardwareAccelerationMode } from './modules/HardwareAccelerationModule.js';
import { allowInternalOrigins } from './modules/BlockNotAllowdOrigins.js';
import { allowExternalUrls } from './modules/ExternalUrls.js';
import { BridgeServerModule } from './modules/bridgeServer.js';
import { KvStoresServiceModule } from './modules/kvStoresService.js';
import { SettingsServiceModule } from './modules/settingsService.js';
import { LastFetchedUpdateServiceModule } from './modules/lastFetchedUpdateService.js';
import { BrowsingParamsServiceModule } from './modules/browsingParamsService.js';
import { AppUpdaterModule } from './modules/appUpdaterModule.js';
import { MetadataModule } from './modules/metadataModule.js';
import { KvServerClientModule } from './modules/kvServerClientModule.js';


export async function initApp(initConfig: AppInitConfig) {
  const moduleRunner = createModuleRunner()
    .init(createWindowManagerModule({ initConfig, openDevTools: import.meta.env.DEV }))
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({ enable: false }))
    .init(new KvStoresServiceModule())
    .init(new BridgeServerModule())
    .init(new SettingsServiceModule())
    .init(new LastFetchedUpdateServiceModule())
    .init(new BrowsingParamsServiceModule())
    .init(new AppUpdaterModule())
    .init(new MetadataModule())
    .init(new KvServerClientModule())

    // Security
    .init(allowInternalOrigins(
      new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : []),
    ))
    .init(allowExternalUrls(
      new Set(['https://github.com', 'https://docs.deno.com'])),
    );

  await moduleRunner;
}
