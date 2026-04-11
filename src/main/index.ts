import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Dynamic import for electron-toolkit/utils (requires app to be ready)
  const { electronApp, optimizer } = await import('@electron-toolkit/utils')

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Setup device handlers (dynamic import)
  const { setupSerialHandlers } = await import('./handlers/serial')
  const { setupUsbHandlers } = await import('./handlers/usb')
  const { setupBluetoothHandlers } = await import('./handlers/bluetooth')
  const { setupNetworkHandlers } = await import('./handlers/network')
  const { setupHidHandlers } = await import('./handlers/hid')
  const { setupGpioHandlers } = await import('./handlers/gpio')
  const { setupI2cHandlers } = await import('./handlers/i2c')
  const { setupSpiHandlers } = await import('./handlers/spi')
  const { setupOnewireHandlers } = await import('./handlers/onewire')
  const { setupSystemHandlers } = await import('./handlers/system')
  const { setupStorageHandlers } = await import('./handlers/storage')
  const { setupDisplayHandlers } = await import('./handlers/display')
  const { setupPowerHandlers } = await import('./handlers/power')
  const { setupProcessHandlers } = await import('./handlers/process')
  const { setupPrinterHandlers } = await import('./handlers/printer')
  const { setupMediaHandlers } = await import('./handlers/media')
  const { setupHotplugWatcher } = await import('./handlers/hotplug')

  setupSerialHandlers()
  setupUsbHandlers()
  setupBluetoothHandlers()
  setupNetworkHandlers()
  setupHidHandlers()
  setupGpioHandlers()
  setupI2cHandlers()
  setupSpiHandlers()
  setupOnewireHandlers()
  setupSystemHandlers()
  setupStorageHandlers()
  setupDisplayHandlers()
  setupPowerHandlers()
  setupProcessHandlers()
  setupPrinterHandlers()
  setupMediaHandlers()
  setupHotplugWatcher()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
