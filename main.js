const { app, BrowserWindow, protocol, dialog, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const AdmZip = require('adm-zip')
const { exec } = require('child_process')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Setup custom protocol handler for loading local files
  protocol.interceptFileProtocol('file', (request, callback) => {
    let filePath = request.url.replace('file:///', '')
    // Remove any query parameters
    filePath = filePath.split('?')[0]
    
    // Handle both absolute and relative paths
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(__dirname, filePath)
    }
    
    // Normalize the path
    filePath = decodeURIComponent(filePath)
    callback({ path: path.normalize(filePath) })
  })

  // Load the index.html of the app.
  mainWindow.loadFile('index.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow()

  // Handle folder selection dialog
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result
  })

  // Handle file system operations
  ipcMain.handle('check-game-exists', (event, gamesPath, gameTitle) => {
    const gamePath = path.join(gamesPath, gameTitle)
    return fs.existsSync(gamePath)
  })

  ipcMain.handle('find-and-run-exe', (event, gamePath) => {
    try {
      // Procura por arquivos .exe no diretório do jogo
      const files = fs.readdirSync(gamePath);
      const exeFiles = files.filter(file => file.toLowerCase().endsWith('.exe'));
      
      if (exeFiles.length === 0) {
        throw new Error('Nenhum arquivo executável (.exe) encontrado');
      }

      // Se encontrar mais de um .exe, tenta achar o principal
      let mainExe = exeFiles[0]; // padrão para o primeiro encontrado
      
      // Prioriza arquivos que parecem ser o executável principal
      const priorityNames = ['game', 'start', 'launcher', 'main'];
      for (const name of priorityNames) {
        const found = exeFiles.find(exe => exe.toLowerCase().includes(name));
        if (found) {
          mainExe = found;
          break;
        }
      }

      const exePath = path.join(gamePath, mainExe);
      
      // Executa o programa
      exec(`"${exePath}"`, (error) => {
        if (error) {
          console.error('Erro ao executar o jogo:', error);
          throw error;
        }
      });

      return { success: true, exeName: mainExe };
    } catch (error) {
      console.error('Erro ao procurar/executar o jogo:', error);
      throw error;
    }
  })

  ipcMain.handle('create-directory', (event, dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    return true
  })

  ipcMain.handle('write-file', (event, filePath, data) => {
    // Verifica se os dados são um ArrayBuffer e converte para Buffer
    const buffer = Buffer.from(new Uint8Array(data));
    fs.writeFileSync(filePath, buffer);
    return true;
  })

  ipcMain.handle('extract-zip', (event, zipPath, destPath) => {
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(destPath, true)
    return true
  })

  ipcMain.handle('delete-file', (event, filePath) => {
    fs.unlinkSync(filePath)
    return true
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})