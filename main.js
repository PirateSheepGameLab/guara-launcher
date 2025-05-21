import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import { download } from 'electron-dl';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
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
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});