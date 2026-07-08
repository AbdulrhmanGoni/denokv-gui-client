import { ipcRenderer } from "electron";
import path from "node:path";
import { type BridgeServerClient, serializeKvKey } from "@app/bridge-server";
import type {
  AppManagerInterface,
  AppUpdaterInterface,
  BridgeServerInterface,
  BrowsingParamsServiceInterface,
  FileSystemServiceInterface,
  HardwareAccelerationInterface,
  KvServerClientInterface,
  KvStoresServiceInterface,
  LastFetchedUpdateServiceInterface,
  MetadataInterface,
  SettingsServiceInterface,
  WatchedKeysServiceInterface,
} from "@app/main/modules/types";

type MetadataType = Awaited<ReturnType<MetadataInterface["getMetadata"]>>;
const metadata = (await ipcRenderer.invoke("get-metadata")) as MetadataType;

type FileSystemServiceType = FileSystemServiceInterface & {
  pathUtils: {
    dirname(p: string): string;
    basename(p: string): string;
    join(...paths: string[]): string;
  };
};

const fileSystemService: FileSystemServiceType = {
  selectDirectory(): Promise<string> {
    return ipcRenderer.invoke("select-directory");
  },
  selectFile(directory) {
    return ipcRenderer.invoke("select-file", directory);
  },
  openPath(path) {
    ipcRenderer.invoke("open-path", path);
  },
  pathUtils: {
    dirname: (p) => path.dirname(p),
    basename: (p) => path.basename(p),
    join: (...paths) => path.join(...paths),
  },
};

const kvStoresService: KvStoresServiceInterface = {
  create(input) {
    return ipcRenderer.invoke("kvStoresService:create", input);
  },
  update(kvStore, changes) {
    return ipcRenderer.invoke("kvStoresService:update", kvStore, changes);
  },
  getAll() {
    return ipcRenderer.invoke("kvStoresService:getAll");
  },
  deleteOne(kvStore) {
    return ipcRenderer.invoke("kvStoresService:deleteOne", kvStore);
  },
  renameDefaultLocalKvStore(store, newName) {
    return ipcRenderer.invoke(
      "kvStoresService:renameDefaultLocalKvStore",
      store,
      newName,
    );
  },
  testKvStoreConnection(kvStore) {
    return ipcRenderer.invoke("kvStoresService:testKvStoreConnection", kvStore);
  },
};

type KvServerClientType = Omit<KvServerClientInterface, "watch"> & {
  watch: BridgeServerClient["watch"];
};

const kvClient: KvServerClientType = {
  browse(params, nextCursor) {
    return ipcRenderer.invoke("kvClient:browse", params, nextCursor);
  },
  set(kvKey, value, options) {
    return ipcRenderer.invoke("kvClient:set", kvKey, value, options);
  },
  deleteKey(key, options) {
    return ipcRenderer.invoke("kvClient:deleteKey", key, options);
  },
  get(key, options) {
    return ipcRenderer.invoke("kvClient:get", key, options);
  },
  enqueue(value, options) {
    return ipcRenderer.invoke("kvClient:enqueue", value, options);
  },
  atomic(operations, options) {
    return ipcRenderer.invoke("kvClient:atomic", operations, options);
  },
  async watch(keys, listener, options) {
    ipcRenderer.removeAllListeners("kvClient:watch-listener");
    const error = await ipcRenderer.invoke("kvClient:watch", keys, options);
    if (error) return error;
    ipcRenderer.on("kvClient:watch-listener", (_event, updatedEntries) =>
      listener(updatedEntries),
    );
  },
  cancelWatcher() {
    ipcRenderer.removeAllListeners("kvClient:watch-listener");
    return ipcRenderer.invoke("kvClient:cancelWatcher");
  },
};

type BridgeServerType = BridgeServerInterface & {
  utils: {
    serializeKvKey: typeof serializeKvKey;
  };
};

const bridgeServer: BridgeServerType = {
  openServer(kvStore) {
    return ipcRenderer.invoke("bridgeServer:openServer", kvStore);
  },
  closeServer() {
    return ipcRenderer.invoke("bridgeServer:closeServer");
  },
  utils: {
    serializeKvKey,
  },
};

const settingsService: SettingsServiceInterface = {
  getSettings() {
    return ipcRenderer.invoke("settingsService:getSettings");
  },
  updateSettings(updatedSettings) {
    return ipcRenderer.invoke("settingsService:updateSettings", updatedSettings);
  },
};

const lastFetchedUpdateService: LastFetchedUpdateServiceInterface = {
  getLastFetchedUpdate() {
    return ipcRenderer.invoke("lastFetchedUpdateService:getLastFetchedUpdate");
  },
  setLastFetchedUpdate(updateInfo) {
    return ipcRenderer.invoke(
      "lastFetchedUpdateService:setLastFetchedUpdate",
      updateInfo,
    );
  },
  deleteLastFetchedUpdate() {
    return ipcRenderer.invoke("lastFetchedUpdateService:deleteLastFetchedUpdate");
  },
  doNotNotifyLastFetchedUpdate() {
    return ipcRenderer.invoke("lastFetchedUpdateService:doNotNotifyLastFetchedUpdate");
  },
};

const browsingParamsService: BrowsingParamsServiceInterface = {
  saveBrowsingParams(kvStoreId, updateData) {
    return ipcRenderer.invoke(
      "browsingParamsService:saveBrowsingParams",
      kvStoreId,
      updateData,
    );
  },
  getSavedBrowsingParamsRecords(kvStoreId) {
    return ipcRenderer.invoke(
      "browsingParamsService:getSavedBrowsingParamsRecords",
      kvStoreId,
    );
  },
  getDefaultSavedBrowsingParams(kvStoreId) {
    return ipcRenderer.invoke(
      "browsingParamsService:getDefaultSavedBrowsingParams",
      kvStoreId,
    );
  },
  updateSavedBrowsingParams(kvStoreId, browsingParamsId, updateData) {
    return ipcRenderer.invoke(
      "browsingParamsService:updateSavedBrowsingParams",
      kvStoreId,
      browsingParamsId,
      updateData,
    );
  },
  deleteSavedBrowsingParams(browsingParamsId) {
    return ipcRenderer.invoke(
      "browsingParamsService:deleteSavedBrowsingParams",
      browsingParamsId,
    );
  },
};

type AppUpdaterType = AppUpdaterInterface & {
  onDownloadingUpdateProgress(
    cb: (progressInfo: DownloadUpdateProgressInfo) => void,
  ): void;
};

const appUpdater: AppUpdaterType = {
  checkForUpdate() {
    return ipcRenderer.invoke("check-for-update");
  },
  downloadUpdate() {
    return ipcRenderer.invoke("download-update");
  },
  cancelUpdate() {
    return ipcRenderer.invoke("cancel-downloading-update");
  },
  onDownloadingUpdateProgress(cb) {
    ipcRenderer.on("downloading-update-progress", (_, progressInfo) => cb(progressInfo));
  },
  quitAndInstallUpdate() {
    return ipcRenderer.invoke("quit-and-install-update");
  },
};

const watchedKeysService: WatchedKeysServiceInterface = {
  getWatchedKeys(kvStoreId) {
    return ipcRenderer.invoke("watchedKeysService:getWatchedKeys", kvStoreId);
  },
  setWatchedKeys(kvStoreId, keys) {
    return ipcRenderer.invoke("watchedKeysService:setWatchedKeys", kvStoreId, keys);
  },
};

const hardwareAccelerationService: HardwareAccelerationInterface = {
  isEnabled() {
    return ipcRenderer.invoke("hardwareAcceleration:isEnabled");
  },
};

const appManager: AppManagerInterface = {
  restartApp() {
    return ipcRenderer.invoke("restart-app");
  },
};

export {
  metadata,
  fileSystemService,
  kvStoresService,
  kvClient,
  bridgeServer,
  appUpdater,
  settingsService,
  lastFetchedUpdateService,
  browsingParamsService,
  watchedKeysService,
  hardwareAccelerationService,
  appManager,
};
