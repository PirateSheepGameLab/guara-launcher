const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadAndExtractGame: (url, destFolder, gameName) =>
    ipcRenderer.invoke('download-and-extract-game', url, destFolder, gameName),
  selectFolder: () => ipcRenderer.invoke('select-folder')
});
