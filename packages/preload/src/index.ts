import { versions } from './versions.js';
import { ipcRenderer } from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

async function selectDirectory() {
  return (await ipcRenderer.invoke('select-directory')) as string
}

export {
  versions,
  send,
  selectDirectory,
};
