import { versions } from './versions.js';
import { ipcRenderer } from 'electron';
import * as kvStoresService from './kvStoresService.js';
import * as kvClient from './kvServerClient.js';
import * as bridgeServer from './server.js';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function selectDirectory() {
  return ipcRenderer.invoke('select-directory') as Promise<string>
}

export {
  versions,
  send,
  selectDirectory,
  kvStoresService,
  kvClient,
  bridgeServer,
};
