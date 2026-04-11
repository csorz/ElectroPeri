import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null
let gpio: any | null = null
let watching = false

async function ensureOnoff() {
  const mod: any = await import('onoff')
  return mod.Gpio ?? mod.default?.Gpio ?? mod.default ?? mod
}

export function setupGpioHandlers(): void {
  ipcMain.handle('gpio:open', async (event, pin: number, direction: 'in' | 'out') => {
    if (process.platform !== 'linux') {
      throw new Error('GPIO 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    mainWindow = BrowserWindow.fromWebContents(event.sender)
    const Gpio = await ensureOnoff()

    if (gpio) {
      try {
        if (watching) gpio.unwatchAll()
        gpio.unexport()
      } catch {
        // ignore
      }
      gpio = null
      watching = false
    }

    gpio = new Gpio(pin, direction)
    return { success: true }
  })

  ipcMain.handle('gpio:close', async () => {
    if (!gpio) return { success: true }
    try {
      if (watching) gpio.unwatchAll()
      gpio.unexport()
    } finally {
      gpio = null
      watching = false
    }
    mainWindow?.webContents.send('gpio:closed')
    return { success: true }
  })

  ipcMain.handle('gpio:read', async () => {
    if (!gpio) throw new Error('GPIO not open')
    const val = gpio.readSync()
    return val
  })

  ipcMain.handle('gpio:write', async (_event, value: 0 | 1) => {
    if (!gpio) throw new Error('GPIO not open')
    gpio.writeSync(value)
    return { success: true }
  })

  ipcMain.handle('gpio:watch', async (_event, edge: 'none' | 'rising' | 'falling' | 'both') => {
    if (!gpio) throw new Error('GPIO not open')
    if (watching) {
      gpio.unwatchAll()
      watching = false
    }

    if (edge === 'none') return { success: true }

    // 注意：onoff 的 edge 需要在构造时指定，运行时改不了。
    // 这里采用简单策略：仅对当前 gpio 注册 watch（若未设置 edge，默认依赖驱动行为）。
    gpio.watch((err: Error, value: number) => {
      if (err) {
        mainWindow?.webContents.send('gpio:error', err.message)
        return
      }
      mainWindow?.webContents.send('gpio:data', value)
    })
    watching = true
    return { success: true }
  })
}

