import * as versions from './versions.js';
import { ipcRenderer } from 'electron';
import * as kvStoresService from './kvStoresService.js';
import * as kvClient from './kvServerClient.js';
import * as bridgeServer from './server.js';
import * as appUpdater from './appUpdater.js';
import * as settingsService from './settingsService.js';

function selectDirectory() {
  return ipcRenderer.invoke('select-directory') as Promise<string>
}

function onWindowReady(cb: () => void) {
  return ipcRenderer.on('window-ready', cb)
}

export {
  versions,
  selectDirectory,
  kvStoresService,
  kvClient,
  bridgeServer,
  appUpdater,
  settingsService,
  onWindowReady,
};
