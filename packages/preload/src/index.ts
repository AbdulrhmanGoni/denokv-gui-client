import * as versions from './versions.js';
import { ipcRenderer } from 'electron';
import type { BrowseReturn, EnqueueRequestInput } from '@app/bridge-server';

function selectDirectory(): Promise<string> {
  return ipcRenderer.invoke('select-directory')
}

function openPath(path: string): void {
  ipcRenderer.invoke('open-path', path)
}

function onWindowReady(cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  return ipcRenderer.on('window-ready', cb)
}

const environment =
  process.env.PLAYWRIGHT_TEST == 'true' ? 'testing' :
    process.env.NODE_ENV == 'development' ? 'development' : 'production'

const kvStoresService = {
  create: (input: CreateKvStoreInput): Promise<boolean> =>
    ipcRenderer.invoke('kvStoresService:create', input),
  update: (kvStore: KvStore, changes: EditKvStoreInput): Promise<boolean> =>
    ipcRenderer.invoke('kvStoresService:update', kvStore, changes),
  getAll: (): Promise<KvStore[]> =>
    ipcRenderer.invoke('kvStoresService:getAll'),
  deleteOne: (kvStore: KvStore): Promise<boolean> =>
    ipcRenderer.invoke('kvStoresService:deleteOne', kvStore),
  renameDefaultLocalKvStore: (store: KvStore, newName: string): Promise<boolean> =>
    ipcRenderer.invoke('kvStoresService:renameDefaultLocalKvStore', store, newName),
  testKvStoreConnection: (kvStore: TestKvStoreParams): Promise<boolean> =>
    ipcRenderer.invoke('kvStoresService:testKvStoreConnection', kvStore),
};

const kvClient = {
  browse: (params: BrowsingParams, nextCursor?: string): Promise<TrycatchResult<BrowseReturn>> =>
    ipcRenderer.invoke('kvClient:browse', params, nextCursor),
  set: (kvKey: string | SerializedKvKey, value: SerializedKvValue, options?: SetKeyOptions): Promise<TrycatchResult<boolean>> =>
    ipcRenderer.invoke('kvClient:set', kvKey, value, options),
  deleteKey: (key: SerializedKvKey): Promise<TrycatchResult<true>> =>
    ipcRenderer.invoke('kvClient:deleteKey', key),
  get: (key: string | SerializedKvKey): Promise<TrycatchResult<SerializedKvEntry>> =>
    ipcRenderer.invoke('kvClient:get', key),
  enqueue: (value: EnqueueRequestInput["value"], options?: EnqueueOptions): Promise<TrycatchResult<boolean>> =>
    ipcRenderer.invoke('kvClient:enqueue', value, options),
};

const bridgeServer = {
  openServer: (kvStore: KvStore): Promise<boolean> =>
    ipcRenderer.invoke('bridgeServer:openServer', kvStore),
  closeServer: (): Promise<void> =>
    ipcRenderer.invoke('bridgeServer:closeServer'),
  getServerClient: (): Promise<any> =>
    ipcRenderer.invoke('bridgeServer:getServerClient'),
};

const settingsService = {
  getSettings: (): Promise<Settings | undefined> =>
    ipcRenderer.invoke('settingsService:getSettings'),
  updateSettings: (updatedSettings: Settings): Promise<boolean> =>
    ipcRenderer.invoke('settingsService:updateSettings', updatedSettings),
};

const lastFetchedUpdateService = {
  getLastFetchedUpdate: (): Promise<UpdateCheckResult | null> =>
    ipcRenderer.invoke('lastFetchedUpdateService:getLastFetchedUpdate'),
  setLastFetchedUpdate: (updateInfo: UpdateCheckResult): Promise<boolean> =>
    ipcRenderer.invoke('lastFetchedUpdateService:setLastFetchedUpdate', updateInfo),
  deleteLastFetchedUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('lastFetchedUpdateService:deleteLastFetchedUpdate'),
};

const browsingParamsService = {
  saveBrowsingParams: (kvStoreId: string, updateData: { browsingParams: SavedBrowsingParams, setAsDefault: boolean }): Promise<TrycatchResult<true>> =>
    ipcRenderer.invoke('browsingParamsService:saveBrowsingParams', kvStoreId, updateData),
  getSavedBrowsingParamsRecords: (kvStoreId: string): Promise<TrycatchResult<SavedBrowsingParamsRecord<SavedBrowsingParams>[]>> =>
    ipcRenderer.invoke('browsingParamsService:getSavedBrowsingParamsRecords', kvStoreId),
  getDefaultSavedBrowsingParams: (kvStoreId: string): Promise<TrycatchResult<SavedBrowsingParamsRecord<SavedBrowsingParams> | undefined>> =>
    ipcRenderer.invoke('browsingParamsService:getDefaultSavedBrowsingParams', kvStoreId),
  updateSavedBrowsingParams: (kvStoreId: string, browsingParamsId: string, updateData: { newBrowsingParams?: SavedBrowsingParams, setAsDefault?: boolean }): Promise<TrycatchResult<true>> =>
    ipcRenderer.invoke('browsingParamsService:updateSavedBrowsingParams', kvStoreId, browsingParamsId, updateData),
  deleteSavedBrowsingParams: (browsingParamsId: string): Promise<TrycatchResult<true>> =>
    ipcRenderer.invoke('browsingParamsService:deleteSavedBrowsingParams', browsingParamsId),
};

const appUpdater = {
  checkForUpdate: (): Promise<UpdateCheckResult | null> =>
    ipcRenderer.invoke('check-for-update'),
  downloadUpdate: (): Promise<any> =>
    ipcRenderer.invoke('download-update'),
  cancelUpdate: (): Promise<void> =>
    ipcRenderer.invoke('cancel-downloading-update'),
  onDownloadingUpdateProgress: (cb: (progressInfo: DownloadUpdateProgressInfo) => void): void => {
    ipcRenderer.on('downloading-update-progress', (_: any, progressInfo: DownloadUpdateProgressInfo) => cb(progressInfo));
  },
  quitAndInstallUpdate: (): Promise<void> =>
    ipcRenderer.invoke('quit-and-install-update'),
};

export {
  versions,
  selectDirectory,
  openPath,
  kvStoresService,
  kvClient,
  bridgeServer,
  appUpdater,
  settingsService,
  onWindowReady,
  lastFetchedUpdateService,
  browsingParamsService,
  environment
};
