import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null
let currentDevice: any | null = null

export function setupHidHandlers(): void {
  ipcMain.handle('hid:list', async () => {
    try {
      const HID = (await import('node-hid')).default ?? (await import('node-hid'))
      const devices = HID.devices()

      return devices.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        path: d.path,
        serialNumber: d.serialNumber,
        product: d.product,
        manufacturer: d.manufacturer,
        usage: d.usage,
        usagePage: d.usagePage
      }))
    } catch (error) {
      console.error('Failed to list HID devices:', error)
      throw error
    }
  })

  ipcMain.handle('hid:open', async (event, vendorId: number, productId: number) => {
    try {
      const HID = (await import('node-hid')).default ?? (await import('node-hid'))
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

      currentDevice = new HID.HID(vendorId, productId)

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
    } catch (error) {
      console.error('Failed to open HID device:', error)
      throw error
    }
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
        throw new Error('HID device not open')
      }

      const encoder = new TextEncoder()
      const payload = Array.from(encoder.encode(data))

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

