import { app } from "electron";
import type { AppInitConfig, AppModule, ModuleContext } from "./modules/types.js";
import { AppInfoModule } from "./modules/AppInfoModule.js";
import { WindowManager } from "./modules/WindowManager.js";
import { WebContentsUrlPolicy } from "./modules/WebContentsUrlPolicy.js";
import { BridgeServerModule } from "./modules/bridgeServer.js";
import { KvStoresServiceModule } from "./modules/kvStoresService.js";
import { SettingsServiceModule } from "./modules/settingsService.js";
import { LastFetchedUpdateServiceModule } from "./modules/lastFetchedUpdateService.js";
import { BrowsingParamsServiceModule } from "./modules/browsingParamsService.js";
import { AppUpdaterModule } from "./modules/appUpdaterModule.js";
import { WatchedKeysServiceModule } from "./modules/watchedKeysService.js";
import { FileSystemServiceModule } from "./modules/fileSystemService.js";
import { AppManagerModule } from "./modules/AppManagerModule.js";

async function initModules(modules: AppModule[]): Promise<void> {
  const context: ModuleContext = { app };
  for (const module of modules) {
    await module.enable(context);
  }
}

export async function initApp(initConfig: AppInitConfig) {
  await initModules([
    new AppManagerModule(),
    new AppInfoModule(),
    new FileSystemServiceModule(),
    new KvStoresServiceModule(),
    new BridgeServerModule(),
    new SettingsServiceModule(),
    new LastFetchedUpdateServiceModule(),
    new BrowsingParamsServiceModule(),
    new AppUpdaterModule(),
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

export * from "./types.ts";
