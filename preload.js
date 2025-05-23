const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadAndExtractGame: (url, destFolder, gameName) =>
    ipcRenderer.invoke('download-and-extract-game', url, destFolder, gameName),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  onDownloadProgress: (callback) => {
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.on('download-progress', (event, percent) => {
      callback(percent);
    });
  },
  pauseDownload: () => ipcRenderer.send('pause-download'),
  resumeDownload: () => ipcRenderer.send('resume-download'),
  cancelDownload: () => ipcRenderer.send('cancel-download'),
  getDownloadStatus: () => ipcRenderer.invoke('get-download-status')
});
