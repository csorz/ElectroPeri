import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null
let currentDevice: any = null

let hidAvailable = false
let hidModuleError: string | null = null
let hidModule: any = null

async function getHID(): Promise<any> {
  if (hidAvailable && hidModule) return hidModule
  if (hidModuleError) throw new Error(hidModuleError)

  try {
    const mod = await import('node-hid')
    hidModule = mod.default ?? mod
    hidAvailable = true
    return hidModule
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (
      errMsg.includes('Could not locate the bindings file') ||
      errMsg.includes('Module version mismatch') ||
      errMsg.includes('node-hid is not available')
    ) {
      hidModuleError =
        'HID模块未安装或编译失败。Windows需要安装 Visual Studio Build Tools 后运行: pnpm rebuild node-hid'
    } else {
      hidModuleError = `HID模块加载失败: ${errMsg}`
    }
    throw new Error(hidModuleError)
  }
}

// 检查HID模块是否可用
async function checkHidAvailable(): Promise<{ available: boolean; error?: string }> {
  if (hidAvailable) return { available: true }
  if (hidModuleError) return { available: false, error: hidModuleError }

  try {
    await getHID()
    return { available: true }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// System HID devices that should be excluded (keyboards, mice, system controls)
// These are typically locked by the OS and cannot be opened
const SYSTEM_USAGE_PAGE_COMBOS = [
  { usagePage: 0x01, usage: 0x02 }, // Mouse
  { usagePage: 0x01, usage: 0x06 }, // Keyboard
  { usagePage: 0x01, usage: 0x80 }  // System Control
]

function isSystemHidDevice(device: any): boolean {
  // Filter out devices that are likely system keyboards/mice
  for (const combo of SYSTEM_USAGE_PAGE_COMBOS) {
    if (device.usagePage === combo.usagePage && device.usage === combo.usage) {
      return true
    }
  }
  return false
}

export function setupHidHandlers(): void {
  // 检查HID模块状态
  ipcMain.handle('hid:check', async () => {
    return checkHidAvailable()
  })

  ipcMain.handle('hid:list', async () => {
    const HID = await getHID()
    const devices = HID.devices()

    // Filter out system keyboards/mice that can't be opened exclusively
    return devices
      .filter((d: any) => !isSystemHidDevice(d))
      .map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        path: d.path,
        serialNumber: d.serialNumber,
        product: d.product,
        manufacturer: d.manufacturer,
        usage: d.usage,
        usagePage: d.usagePage
      }))
  })

  ipcMain.handle('hid:open', async (event, vendorId: number, productId: number) => {
    const HID = await getHID()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (currentDevice) {
      currentDevice.removeAllListeners()
      try {
        currentDevice.close()
      } catch {
        // ignore
      }
      currentDevice = null
    }

    // Try to find a non-system device with matching VID/PID
    const devices = HID.devices()
    const targetDevices = devices.filter(
      (d: any) => d.vendorId === vendorId && d.productId === productId && !isSystemHidDevice(d)
    )

    if (targetDevices.length === 0) {
      throw new Error(`未找到 HID 设备 (VID:0x${vendorId.toString(16).toUpperCase()}, PID:0x${productId.toString(16).toUpperCase()})`)
    }

    // Open by path to get a specific device (not just first VID/PID match)
    const devicePath = targetDevices[0].path
    try {
      currentDevice = new HID.HID(devicePath)
    } catch (err) {
      throw new Error(
        `无法打开 HID 设备: ${err instanceof Error ? err.message : String(err)}。设备可能被其他程序占用。`
      )
    }

    currentDevice.on('data', (data: Buffer) => {
      const hex = Array.from(data)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')
      mainWindow?.webContents.send('hid:data', hex)
    })

    currentDevice.on('error', (err: Error) => {
      mainWindow?.webContents.send('hid:error', err.message)
    })

    return { success: true }
  })

  ipcMain.handle('hid:close', async () => {
    try {
      if (currentDevice) {
        currentDevice.removeAllListeners()
        try {
          currentDevice.close()
        } catch {
          // ignore
        }
        currentDevice = null
      }
      mainWindow?.webContents.send('hid:closed')
      return { success: true }
    } catch (error) {
      console.error('Failed to close HID device:', error)
      throw error
    }
  })

  ipcMain.handle('hid:send', async (_event, reportId: number, data: string) => {
    try {
      if (!currentDevice) {
        throw new Error('HID 设备未打开')
      }

      // Support hex string input like "01 02 03" or "010203"
      let payload: number[]
      if (/^[0-9a-fA-F\s]+$/.test(data) && data.trim().length > 0) {
        const hex = data.replace(/\s/g, '')
        const buf = Buffer.from(hex, 'hex')
        payload = Array.from(buf)
      } else {
        payload = Array.from(Buffer.from(data, 'utf8'))
      }

      // node-hid expects first byte as reportId
      const buffer = [reportId, ...payload]
      currentDevice.write(buffer)

      return { success: true }
    } catch (error) {
      console.error('Failed to write HID data:', error)
      throw error
    }
  })
}
