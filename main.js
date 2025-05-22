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
    ipcMain.handle('download-and-extract-game', async (event, url, destFolder, gameName) => {
        try {
            // Cria a pasta do jogo
            const gameFolder = path.join(destFolder, gameName);
            if (!fs.existsSync(gameFolder)) fs.mkdirSync(gameFolder, { recursive: true });

            // Caminho do zip temporário
            const zipPath = path.join(gameFolder, 'game.zip');

            // Baixa o arquivo
            const res = await fetch(url);
            if (!res.ok) throw new Error('Erro ao baixar o arquivo');
            const fileStream = fs.createWriteStream(zipPath);
            await new Promise((resolve, reject) => {
                res.body.pipe(fileStream);
                res.body.on('error', reject);
                fileStream.on('finish', resolve);
            });

            // Extrai o zip
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(gameFolder, true);

            // Remove o zip
            fs.unlinkSync(zipPath);

            return true;
        } catch (err) {
            throw new Error('Erro no download ou extração: ' + err.message);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});