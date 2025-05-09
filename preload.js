const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    fileSystem: {
        checkGameExists: (gamesPath, gameTitle) => 
            ipcRenderer.invoke('check-game-exists', gamesPath, gameTitle),
        createDirectory: (dirPath) => 
            ipcRenderer.invoke('create-directory', dirPath),
        writeFile: (filePath, data, onProgress) => 
            ipcRenderer.invoke('write-file', filePath, data, onProgress),
        extractZip: (zipPath, destPath, onProgress) => 
            ipcRenderer.invoke('extract-zip', zipPath, destPath, onProgress),
        deleteFile: (filePath) => 
            ipcRenderer.invoke('delete-file', filePath),
        findAndRunExe: (gamePath) =>
            ipcRenderer.invoke('find-and-run-exe', gamePath)
    }
});