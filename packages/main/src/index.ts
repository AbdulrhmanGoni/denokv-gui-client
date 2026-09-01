import { app } from "electron";
import type { AppInitConfig } from "./modules/types.js";
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

export async function initApp(initConfig: AppInitConfig) {
  const settingsModule = new SettingsModule();

  const appManagerModule = new AppManagerModule(app, settingsModule);
  await appManagerModule.waitAppToBeReady();

  new WebContentsUrlPolicyModule(
    app,
    initConfig.renderer instanceof URL ? initConfig.renderer.origin : "",
  );

  const windowManagerModule = new WindowManagerModule(app, initConfig);

  const appInfoModule = new AppInfoModule(app);

  new FileSystemModule(windowManagerModule);

  new KvStoresModule();

  const lastFetchedUpdateModule = new LastFetchedUpdateModule(appInfoModule);

  new AppUpdaterModule(appInfoModule, windowManagerModule, lastFetchedUpdateModule);

  new BridgeServerModule();

  new BrowsingParamsModule();

  new WatchedKeysModule();

  await windowManagerModule.loadFrontEnd();
}

export * from "./types.ts";
