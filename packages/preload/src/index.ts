import * as versions from './versions.js';
import { ipcRenderer } from 'electron';
import * as kvStoresService from './kvStoresService.js';
import * as kvClient from './kvServerClient.js';
import * as bridgeServer from './server.js';

function selectDirectory() {
  return ipcRenderer.invoke('select-directory') as Promise<string>
}

export {
  versions,
  selectDirectory,
  kvStoresService,
  kvClient,
  bridgeServer,
};
