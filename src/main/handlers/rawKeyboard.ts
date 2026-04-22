import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null
let rawKeyboardModule: any = null
let moduleAvailable = false
let moduleError: string | null = null
let isListening = false

async function getModule(): Promise<any> {
  if (moduleAvailable && rawKeyboardModule) return rawKeyboardModule
  if (moduleError) throw new Error(moduleError)

  try {
    const mod = await import('raw-keyboard')
    rawKeyboardModule = mod.default ?? mod
    moduleAvailable = true
    return rawKeyboardModule
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    moduleError = `raw-keyboard 原生模块加载失败: ${errMsg}`
    throw new Error(moduleError)
  }
}

export function setupRawKeyboardHandlers(): void {
  // 检查模块可用性
  ipcMain.handle('raw-keyboard:check', async () => {
    if (moduleAvailable) return { available: true }
    if (moduleError) return { available: false, error: moduleError }
    try {
      await getModule()
      return { available: true }
    } catch {
      return { available: false, error: moduleError || 'raw-keyboard 原生模块不可用' }
    }
  })

  // 列出键盘设备
  ipcMain.handle('raw-keyboard:listDevices', async () => {
    try {
      const mod = await getModule()
      return mod.getKeyboardDevices()
    } catch {
      return []
    }
  })

  // 开始监听
  ipcMain.handle('raw-keyboard:start', async (event) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (isListening) {
      return { success: true, message: 'already listening' }
    }

    try {
      const mod = await getModule()
      mod.startRawInput((data: { handle: number; vKey: number; scanCode: number; keyDown: boolean; keyName: string }) => {
        mainWindow?.webContents.send('raw-keyboard:data', data)
      })
      isListening = true
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || '启动监听失败' }
    }
  })

  // 停止监听
  ipcMain.handle('raw-keyboard:stop', async () => {
    if (!isListening) {
      return { success: true, message: 'not listening' }
    }

    const mod = await getModule()
    if (mod) {
      try {
        mod.stopRawInput()
      } catch {
        // ignore
      }
    }
    isListening = false
    return { success: true }
  })
}
