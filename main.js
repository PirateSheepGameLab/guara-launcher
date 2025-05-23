import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import { download } from 'electron-dl';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Carrega o arquivo HTML
    win.loadFile(path.join(__dirname, 'index.html'));

    // Descomente a linha abaixo para abrir as DevTools automaticamente
    // win.webContents.openDevTools();

    return win;
}

app.whenReady().then(() => {
    const mainWindow = createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Manipulador para seleção de pasta
    ipcMain.handle('select-folder', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        
        if (!result.canceled) {
            const folderPath = result.filePaths[0];
            store.set('downloadPath', folderPath);
            return folderPath;
        }
        return null;
    });

    // Handler para obter o caminho salvo
    ipcMain.handle('get-download-path', async () => {
        return store.get('downloadPath') || '';
    });

    // Manipulador para download de jogos
    ipcMain.handle('download-game', async (event, { url, filename }) => {
        const downloadPath = store.get('downloadPath');
        
        if (!downloadPath) {
            throw new Error('Selecione uma pasta para download primeiro');
        }

        try {
            await download(mainWindow, url, {
                directory: downloadPath,
                filename: filename,
                onProgress: (progress) => {
                    mainWindow.webContents.send('download-progress', progress);
                }
            });

            return {
                success: true,
                path: path.join(downloadPath, filename)
            };
        } catch (error) {
            throw new Error(`Falha no download: ${error.message}`);
        }
    });

    // Manipulador para download, extração e remoção do zip
    let currentDownload = null;
    let isPaused = false;
    let cancelRequested = false;
    let currentDownloadGame = null;
    let currentDownloadPercent = 0;

    ipcMain.handle('get-download-status', async () => {
        if (currentDownload && currentDownloadGame) {
            return {
                active: true,
                gameName: currentDownloadGame,
                percent: currentDownloadPercent,
                isPaused
            };
        }
        return { active: false };
    });

    ipcMain.handle('download-and-extract-game', async (event, url, destFolder, gameName) => {
        try {
            // Cria a pasta do jogo
            const gameFolder = path.join(destFolder, gameName);
            if (!fs.existsSync(gameFolder)) fs.mkdirSync(gameFolder, { recursive: true });
            const zipPath = path.join(gameFolder, 'game.zip');
            cancelRequested = false;
            currentDownloadGame = gameName;
            currentDownloadPercent = 0;
            const res = await fetch(url); // sem AbortController
            if (!res.ok) throw new Error('Erro ao baixar o arquivo');
            const total = Number(res.headers.get('content-length'));
            let received = 0;
            const fileStream = fs.createWriteStream(zipPath);
            currentDownload = { fileStream, event, res };
            isPaused = false;
            let downloadResult;
            try {
                downloadResult = await new Promise((resolve, reject) => {
                    function cleanup() {
                        res.body.removeAllListeners();
                        fileStream.removeAllListeners();
                    }
                    res.body.on('data', chunk => {
                        if (cancelRequested) {
                            cleanup();
                            try { fileStream.close(); } catch {}
                            fs.unlink(zipPath, () => {});
                            resolve('cancelled');
                            return;
                        }
                        if (isPaused) {
                            res.body.pause();
                            return;
                        }
                        received += chunk.length;
                        if (total) {
                            const percent = Math.floor((received / total) * 100);
                            currentDownloadPercent = percent;
                            event.sender.send('download-progress', percent);
                        }
                    });
                    res.body.on('end', () => {
                        if (!cancelRequested) {
                            event.sender.send('download-progress', 100);
                            currentDownloadPercent = 100;
                            cleanup();
                            resolve();
                        }
                    });
                    res.body.on('error', err => {
                        cleanup();
                        if (cancelRequested) return resolve('cancelled');
                        reject(err);
                    });
                    fileStream.on('error', err => {
                        cleanup();
                        if (cancelRequested) return resolve('cancelled');
                        reject(err);
                    });
                    res.body.pipe(fileStream);
                });
            } catch (err) {
                currentDownload = null;
                currentDownloadGame = null;
                currentDownloadPercent = 0;
                if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                if (cancelRequested) return false;
                throw err;
            }
            if (
                downloadResult === 'cancelled' ||
                !fs.existsSync(zipPath) ||
                fs.statSync(zipPath).size === 0
            ) {
                currentDownload = null;
                currentDownloadGame = null;
                currentDownloadPercent = 0;
                if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                return false;
            }
            try {
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(gameFolder, true);
                fs.unlinkSync(zipPath);
            } catch (err) {
                if (downloadResult === 'cancelled' || !fs.existsSync(zipPath)) {
                    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                    currentDownload = null;
                    currentDownloadGame = null;
                    currentDownloadPercent = 0;
                    return false;
                }
                throw err;
            }
            currentDownload = null;
            currentDownloadGame = null;
            currentDownloadPercent = 0;
            return true;
        } catch (err) {
            currentDownload = null;
            currentDownloadGame = null;
            currentDownloadPercent = 0;
            if (cancelRequested) return false;
            throw new Error('Erro no download ou extração: ' + err.message);
        }
    });

    ipcMain.on('pause-download', () => {
        if (currentDownload && !isPaused) {
            isPaused = true;
            if (currentDownload.res.body) currentDownload.res.body.pause();
        }
    });
    ipcMain.on('resume-download', () => {
        if (currentDownload && isPaused) {
            isPaused = false;
            if (currentDownload.res.body) currentDownload.res.body.resume();
        }
    });
    ipcMain.on('cancel-download', () => {
        cancelRequested = true;
        if (currentDownload && currentDownload.fileStream) {
            try { currentDownload.fileStream.close(); } catch {}
        }
        currentDownload = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});