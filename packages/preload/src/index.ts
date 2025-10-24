import * as versions from './versions.js';
import { ipcRenderer } from 'electron';
import * as kvStoresService from './services/kvStoresService.js';
import * as kvClient from './kvServerClient.js';
import * as bridgeServer from './server.js';
import * as appUpdater from './appUpdater.js';
import * as settingsService from './services/settingsService.js';
import * as lastFetchedUpdateService from './services/lastFetchedUpdateService.js';

function selectDirectory() {
  return ipcRenderer.invoke('select-directory') as Promise<string>
}

function openPath(path: string) {
  ipcRenderer.invoke('open-path', path)
}

function onWindowReady(cb: () => void) {
  return ipcRenderer.on('window-ready', cb)
}

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
};
