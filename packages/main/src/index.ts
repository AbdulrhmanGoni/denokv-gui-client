import type { AppInitConfig } from "./AppInitConfig.js";
import { AppModule } from "./AppModule.js";
import { ModuleContext } from "./ModuleContext.js";
import { app } from "electron";
import { WindowManager } from "./modules/WindowManager.js";
import { HardwareAccelerationModule } from "./modules/HardwareAccelerationModule.js";
import { WebContentsUrlPolicy } from "./modules/WebContentsUrlPolicy.js";
import { BridgeServerModule } from "./modules/bridgeServer.js";
import { KvStoresServiceModule } from "./modules/kvStoresService.js";
import { SettingsServiceModule } from "./modules/settingsService.js";
import { LastFetchedUpdateServiceModule } from "./modules/lastFetchedUpdateService.js";
import { BrowsingParamsServiceModule } from "./modules/browsingParamsService.js";
import { AppUpdaterModule } from "./modules/appUpdaterModule.js";
import { MetadataModule } from "./modules/metadataModule.js";
import { KvServerClientModule } from "./modules/kvServerClientModule.js";
import { WatchedKeysServiceModule } from "./modules/watchedKeysService.js";
import { FileSystemServiceModule } from "./modules/fileSystemService.js";

export async function initModules(modules: AppModule[]): Promise<void> {
  const context: ModuleContext = { app };
  for (const module of modules) {
    await module.enable(context);
  }
}

export async function initApp(initConfig: AppInitConfig) {
  await initModules([
    new MetadataModule(),
    new HardwareAccelerationModule(),
    new FileSystemServiceModule(),
    new KvStoresServiceModule(),
    new BridgeServerModule(),
    new SettingsServiceModule(),
    new LastFetchedUpdateServiceModule(),
    new BrowsingParamsServiceModule(),
    new AppUpdaterModule(),
    new KvServerClientModule(),
    new WatchedKeysServiceModule(),
    new WebContentsUrlPolicy(
      initConfig.renderer instanceof URL ? initConfig.renderer.origin : "",
    ),
    new WindowManager({
      initConfig,
      openDevTools: import.meta.env.DEV,
    }),
  ]);
}
