import { app } from "electron";
import type { AppInitConfig, AppModule, ModuleContext } from "./modules/types.js";
import { AppInfoModule } from "./modules/AppInfoModule.js";
import { WindowManagerModule } from "./modules/WindowManagerModule.js";
import { WebContentsUrlPolicyModule } from "./modules/WebContentsUrlPolicyModule.js";
import { BridgeServerModule } from "./modules/BridgeServerModule.js";
import { KvStoresModule } from "./modules/KvStoresModule.js";
import { SettingsModule } from "./modules/SettingsModule.js";
import { LastFetchedUpdateModule } from "./modules/LastFetchedUpdateModule.js";
import { BrowsingParamsModule } from "./modules/BrowsingParamsModule.js";
import { AppUpdaterModule } from "./modules/AppUpdaterModule.js";
import { WatchedKeysModule } from "./modules/WatchedKeysModule.js";
import { FileSystemModule } from "./modules/FileSystemModule.js";
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
    new FileSystemModule(),
    new KvStoresModule(),
    new BridgeServerModule(),
    new SettingsModule(),
    new LastFetchedUpdateModule(),
    new BrowsingParamsModule(),
    new AppUpdaterModule(),
    new WatchedKeysModule(),
    new WebContentsUrlPolicyModule(
      initConfig.renderer instanceof URL ? initConfig.renderer.origin : "",
    ),
    new WindowManagerModule({
      initConfig,
      openDevTools: import.meta.env.DEV,
    }),
  ]);
}

export * from "./types.ts";
