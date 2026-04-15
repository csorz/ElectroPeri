import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

// 最早的调试日志 - 写入到临时文件
function earlyLog(message: string): void {
  try {
    const fs = require('fs')
    const os = require('os')
    const logPath = join(os.tmpdir(), 'electroperi-debug.log')
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`)
    console.log(message)
  } catch {
    console.log(message)
  }
}

earlyLog('=== Application Starting ===')
earlyLog(`Node version: ${process.versions.node}`)
earlyLog(`Electron version: ${process.versions.electron}`)
earlyLog(`Platform: ${process.platform}`)
earlyLog(`Arch: ${process.arch}`)
earlyLog(`Exec path: ${process.execPath}`)
earlyLog(`CWD: ${process.cwd()}`)
earlyLog(`Args: ${process.argv.join(' ')}`)

// 检查 electron 模块是否正确加载
earlyLog(`app is defined: ${typeof app !== 'undefined'}`)
earlyLog(`app.whenReady is defined: ${typeof app?.whenReady === 'function'}`)

// 启动日志模块 - 必须在最开始初始化
let startupLog: {
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  debug: (message: string, ...args: unknown[]) => void
} = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.log
}

// 初始化启动日志
async function initLog() {
  try {
    const logModule = await import('./startupLog')
    logModule.initStartupLog()
    logModule.setupErrorHandlers()
    startupLog = logModule.startupLog
  } catch (err) {
    console.error('Failed to initialize startup log:', err)
  }
}

function createWindow(): void {
  startupLog.info('Creating main window...')

  try {
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

    startupLog.info('Main window created successfully')

    mainWindow.on('ready-to-show', () => {
      startupLog.info('Window ready to show')
      mainWindow.show()
      // Open DevTools in development mode
      if (process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.webContents.openDevTools()
        startupLog.info('DevTools opened (development mode)')
      }
    })

    // Register global shortcut for DevTools
    globalShortcut.register('Alt+Shift+F11', () => {
      mainWindow.webContents.toggleDevTools()
      startupLog.info('DevTools toggled via shortcut')
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Handle Web API permission requests (Serial, USB, Bluetooth, HID)
    mainWindow.webContents.session.setPermissionCheckHandler((_webContents, permission) => {
      // Allow Web Serial, Web USB, Web Bluetooth, WebHID permissions
      if (['serial', 'usb', 'bluetooth', 'hid'].includes(permission)) {
        return true
      }
      return false
    })

    mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
      // Auto-grant Web Serial, Web USB, Web Bluetooth, WebHID permissions
      if (['serial', 'usb', 'bluetooth', 'hid'].includes(permission)) {
        callback(true)
      } else {
        callback(false)
      }
    })

    // Handle serial device selection - return first port or empty to show picker
    mainWindow.webContents.session.on('select-serial-port', (_event, portList, _webContents, callback) => {
      if (portList && portList.length > 0) {
        callback(portList[0].portId)
      } else {
        callback('')
      }
    })

    // 监听渲染进程错误
    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      startupLog.error('Failed to load:', validatedURL, 'Error:', errorCode, errorDescription)
    })

    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      startupLog.error('Render process gone:', details)
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (process.env['ELECTRON_RENDERER_URL']) {
      const url = process.env['ELECTRON_RENDERER_URL']
      startupLog.info('Loading URL:', url)
      mainWindow.loadURL(url)
    } else {
      const htmlPath = join(__dirname, '../renderer/index.html')
      startupLog.info('Loading file:', htmlPath)
      mainWindow.loadFile(htmlPath)
    }

    startupLog.info('Window setup complete')
  } catch (err) {
    startupLog.error('Failed to create window:', err)
    throw err
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // 初始化日志
  await initLog()
  startupLog.info('App is ready')

  try {
    // Dynamic import for electron-toolkit/utils (requires app to be ready)
    startupLog.info('Loading electron-toolkit/utils...')
    const { electronApp, optimizer } = await import('@electron-toolkit/utils')

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')
    startupLog.info('App user model id set')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    // Setup device handlers (dynamic import)
    startupLog.info('Loading handlers...')

    const handlers = [
      { name: 'startupLog', setup: () => import('./handlers/startupLog').then(m => m.setupStartupLogHandlers()) },
      { name: 'serial', setup: () => import('./handlers/serial').then(m => m.setupSerialHandlers()) },
      { name: 'usb', setup: () => import('./handlers/usb').then(m => m.setupUsbHandlers()) },
      { name: 'bluetooth', setup: () => import('./handlers/bluetooth').then(m => m.setupBluetoothHandlers()) },
      { name: 'network', setup: () => import('./handlers/network').then(m => m.setupNetworkHandlers()) },
      { name: 'hid', setup: () => import('./handlers/hid').then(m => m.setupHidHandlers()) },
      { name: 'gpio', setup: () => import('./handlers/gpio').then(m => m.setupGpioHandlers()) },
      { name: 'i2c', setup: () => import('./handlers/i2c').then(m => m.setupI2cHandlers()) },
      { name: 'spi', setup: () => import('./handlers/spi').then(m => m.setupSpiHandlers()) },
      { name: 'onewire', setup: () => import('./handlers/onewire').then(m => m.setupOnewireHandlers()) },
      { name: 'system', setup: () => import('./handlers/system').then(m => m.setupSystemHandlers()) },
      { name: 'storage', setup: () => import('./handlers/storage').then(m => m.setupStorageHandlers()) },
      { name: 'display', setup: () => import('./handlers/display').then(m => m.setupDisplayHandlers()) },
      { name: 'power', setup: () => import('./handlers/power').then(m => m.setupPowerHandlers()) },
      { name: 'process', setup: () => import('./handlers/process').then(m => m.setupProcessHandlers()) },
      { name: 'printer', setup: () => import('./handlers/printer').then(m => m.setupPrinterHandlers()) },
      { name: 'media', setup: () => import('./handlers/media').then(m => m.setupMediaHandlers()) },
      { name: 'hotplug', setup: () => import('./handlers/hotplug').then(m => m.setupHotplugWatcher()) },
      { name: 'codeRunner', setup: () => import('./handlers/codeRunner').then(m => m.setupCodeRunnerHandlers()) },
      { name: 'dns', setup: () => import('./handlers/dns').then(m => m.setupDnsHandlers()) },
      { name: 'meta', setup: () => import('./handlers/meta').then(m => m.setupMetaHandlers()) },
      { name: 'fileTransfer', setup: () => import('./handlers/fileTransfer').then(m => m.setupFileTransferHandlers()) },
      { name: 'mqtt', setup: () => import('./handlers/mqtt').then(m => m.setupMqttHandlers()) }
    ]

    for (const handler of handlers) {
      try {
        await handler.setup()
        startupLog.debug(`Handler loaded: ${handler.name}`)
      } catch (err) {
        startupLog.warn(`Failed to load handler ${handler.name}:`, err)
        // 某些 handler 可能因为依赖不可用而失败，继续加载其他 handler
      }
    }

    startupLog.info('All handlers loaded')

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    startupLog.info('Application started successfully')
  } catch (err) {
    startupLog.error('Failed to initialize app:', err)

    // 显示错误对话框
    dialog.showErrorBox(
      '启动错误',
      `应用启动失败：\n\n${err instanceof Error ? err.message : String(err)}\n\n详细信息请查看日志文件`
    )

    app.quit()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Unregister all shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
