import { ipcRenderer } from 'electron';
import path from 'node:path';

function selectDirectory(): Promise<string> {
  return ipcRenderer.invoke('select-directory')
}

function selectFile(directory?: string): Promise<{ directory: string, fileName: string } | null> {
  return ipcRenderer.invoke('select-file', directory)
}

function openPath(path: string): void {
  ipcRenderer.invoke('open-path', path)
}

const pathUtils = {
  dirname: (p: string): string => path.dirname(p),
  basename: (p: string): string => path.basename(p),
  join: (...paths: string[]): string => path.join(...paths),
};

const metadata = await ipcRenderer.invoke('get-metadata')

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
  enqueue: (value: EnqueueRequestInput["value"], options?: EnqueueRequestInput["options"]): Promise<TrycatchResult<boolean>> =>
    ipcRenderer.invoke('kvClient:enqueue', value, options),
  atomic: (operations: AtomicOperationInput[]): Promise<TrycatchResult<boolean>> =>
    ipcRenderer.invoke('kvClient:atomic', operations),
  watch: (keys: SerializedKvKey[], listener: (updatedEntries: SerializedKvEntry[]) => void): void => {
    ipcRenderer.removeAllListeners('kvClient:watch-listener')
    ipcRenderer.invoke('kvClient:watch', keys)
    ipcRenderer.on(
      'kvClient:watch-listener',
      (_event, updatedEntries: SerializedKvEntry[]) => listener(updatedEntries)
    )
  },
  cancelWatcher: async (): Promise<void> => {
    ipcRenderer.removeAllListeners('kvClient:watch-listener')
    await ipcRenderer.invoke('kvClient:cancelWatcher')
  },
};

const bridgeServer = {
  openServer: (kvStore: KvStore): Promise<boolean> =>
    ipcRenderer.invoke('bridgeServer:openServer', kvStore),
  closeServer: (): Promise<void> =>
    ipcRenderer.invoke('bridgeServer:closeServer'),
};

const settingsService = {
  getSettings: (): Promise<Settings | undefined> =>
    ipcRenderer.invoke('settingsService:getSettings'),
  updateSettings: (updatedSettings: Settings): Promise<boolean> =>
    ipcRenderer.invoke('settingsService:updateSettings', updatedSettings),
};

const lastFetchedUpdateService = {
  getLastFetchedUpdate: (): Promise<LastFetchedUpdate | null> =>
    ipcRenderer.invoke('lastFetchedUpdateService:getLastFetchedUpdate'),
  setLastFetchedUpdate: (updateInfo: UpdateCheckResult): Promise<boolean> =>
    ipcRenderer.invoke('lastFetchedUpdateService:setLastFetchedUpdate', updateInfo),
  deleteLastFetchedUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('lastFetchedUpdateService:deleteLastFetchedUpdate'),
  doNotNotifyLastFetchedUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('lastFetchedUpdateService:doNotNotifyLastFetchedUpdate'),
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

const watchedKeysService = {
  getWatchedKeys: (kvStoreId: string): Promise<SerializedKvKey[] | null> =>
    ipcRenderer.invoke('watchedKeysService:getWatchedKeys', kvStoreId),
  setWatchedKeys: (kvStoreId: string, keys: SerializedKvKey[]): Promise<boolean> =>
    ipcRenderer.invoke('watchedKeysService:setWatchedKeys', kvStoreId, keys),
};

export {
  metadata,
  selectDirectory,
  selectFile,
  openPath,
  kvStoresService,
  kvClient,
  bridgeServer,
  appUpdater,
  settingsService,
  lastFetchedUpdateService,
  browsingParamsService,
  watchedKeysService,
  pathUtils,
};
