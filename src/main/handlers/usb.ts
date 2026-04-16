import { BrowserWindow, ipcMain } from 'electron'

// Store current connection
let currentDevice: any = null
let currentInterface: any = null
let mainWindow: BrowserWindow | null = null

let usbAvailable = false
let usbModuleError: string | null = null
let usbModule: any = null

async function getUsb() {
  if (usbAvailable && usbModule) return usbModule
  if (usbModuleError) throw new Error(usbModuleError)

  try {
    const mod: any = await import('usb')
    usbModule = mod.default ?? mod
    usbAvailable = true
    return usbModule
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (errMsg.includes('Could not locate the bindings file') ||
        errMsg.includes('Module version mismatch') ||
        errMsg.includes('usb is not available')) {
      usbModuleError = 'USB模块未安装或编译失败。Windows需要安装 Visual Studio Build Tools 后运行: pnpm rebuild usb'
    } else {
      usbModuleError = `USB模块加载失败: ${errMsg}`
    }
    throw new Error(usbModuleError)
  }
}

// 检查USB模块是否可用
async function checkUsbAvailable(): Promise<{ available: boolean; error?: string }> {
  if (usbAvailable) return { available: true }
  if (usbModuleError) return { available: false, error: usbModuleError }

  try {
    await getUsb()
    return { available: true }
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export function setupUsbHandlers(): void {
  // 检查USB模块状态
  ipcMain.handle('usb:check', async () => {
    return checkUsbAvailable()
  })

  ipcMain.handle('usb:list', async () => {
    const usb = await getUsb()
    const devices = usb.getDeviceList()

    return devices.map((device: any) => {
      const desc = device.deviceDescriptor
      return {
        deviceAddress: device.deviceAddress,
        busNumber: device.busNumber,
        vendorId: desc.idVendor,
        productId: desc.idProduct,
        deviceClass: desc.bDeviceClass,
        deviceSubclass: desc.bDeviceSubClass,
        deviceProtocol: desc.bDeviceProtocol,
        // manufacturer/product/serialNumber require opening the device
        // which may fail for system devices, so we read them lazily
        manufacturer: '',
        product: '',
        serialNumber: '',
        interfaces: desc.iConfiguration
      }
    })
  })

  ipcMain.handle('usb:open', async (event, vendorId: number, productId: number) => {
    const usb = await getUsb()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    const devices = usb.getDeviceList()
    const device = devices.find((d: any) => {
      const desc = d.deviceDescriptor
      return desc.idVendor === vendorId && desc.idProduct === productId
    })

    if (!device) {
      throw new Error('Device not found')
    }

    // Close previous connection
    if (currentDevice) {
      try {
        if (currentInterface) {
          currentInterface.release()
          currentInterface = null
        }
        currentDevice.close()
      } catch {
        // ignore
      }
      currentDevice = null
    }

    device.open()

    // Try to read string descriptors for device info
    try {
      const desc = device.deviceDescriptor
      if (desc.iManufacturer) {
        device.getStringDescriptor(desc.iManufacturer, (err: Error | undefined, data: string | undefined) => {
          if (!err && data) device._manufacturer = data
        })
      }
      if (desc.iProduct) {
        device.getStringDescriptor(desc.iProduct, (err: Error | undefined, data: string | undefined) => {
          if (!err && data) device._product = data
        })
      }
    } catch {
      // String descriptor reads may fail, non-critical
    }

    currentDevice = device

    // Claim the first interface if available
    try {
      const interfaces = device.interfaces
      if (interfaces && interfaces.length > 0) {
        const iface = interfaces[0]
        if (iface.isKernelDriverActive()) {
          iface.detachKernelDriver()
        }
        iface.claim()
        currentInterface = iface

        // Set up interrupt or bulk transfer listeners for data
        const endpoints = iface.endpoints
        const inEndpoint = endpoints.find((ep: any) => ep.direction === 'in')
        if (inEndpoint) {
          inEndpoint.on('data', (data: Buffer) => {
            const hex = Array.from(data)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(' ')
            mainWindow?.webContents.send('usb:data', hex)
          })
          inEndpoint.on('error', (err: Error) => {
            console.error('USB IN endpoint error:', err.message)
          })
          // Start listening
          try {
            inEndpoint.startPoll()
          } catch {
            // Some endpoints don't support polling
          }
        }
      }
    } catch (err) {
      // Interface claim may fail for some devices
      console.error('Failed to claim interface:', err instanceof Error ? err.message : String(err))
    }

    return { success: true }
  })

  ipcMain.handle('usb:close', async () => {
    try {
      if (currentDevice) {
        if (currentInterface) {
          try {
            const endpoints = currentInterface.endpoints
            const inEndpoint = endpoints.find((ep: any) => ep.direction === 'in')
            if (inEndpoint) {
              try { inEndpoint.stopPoll() } catch { /* ignore */ }
            }
            currentInterface.release()
          } catch {
            // ignore
          }
          currentInterface = null
        }
        currentDevice.close()
        currentDevice = null
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to close USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:write', async (_event, endpointNumber: number, data: string) => {
    try {
      if (!currentDevice || !currentInterface) {
        throw new Error('USB device not open')
      }

      const endpoints = currentInterface.endpoints
      const outEndpoint = endpoints.find(
        (ep: any) => ep.direction === 'out' && ep.endpointNumber === endpointNumber
      ) || endpoints.find((ep: any) => ep.direction === 'out')

      if (!outEndpoint) {
        throw new Error('No OUT endpoint available')
      }

      // Support both hex string and plain text
      let buffer: Buffer
      if (/^[0-9a-fA-F\s]+$/.test(data) && data.trim().length > 0) {
        // Hex string like "01 02 03" or "010203"
        const hex = data.replace(/\s/g, '')
        buffer = Buffer.from(hex, 'hex')
      } else {
        buffer = Buffer.from(data, 'utf8')
      }

      await new Promise<void>((resolve, reject) => {
        outEndpoint.transfer(buffer, (err: Error | undefined) => {
          if (err) reject(err)
          else resolve()
        })
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to write to USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:read', async (_event, endpointNumber: number, length = 64) => {
    try {
      if (!currentDevice || !currentInterface) {
        throw new Error('USB device not open')
      }

      const endpoints = currentInterface.endpoints
      const inEndpoint = endpoints.find(
        (ep: any) => ep.direction === 'in' && ep.endpointNumber === endpointNumber
      ) || endpoints.find((ep: any) => ep.direction === 'in')

      if (!inEndpoint) {
        throw new Error('No IN endpoint available')
      }

      const data = await new Promise<Buffer>((resolve, reject) => {
        inEndpoint.transfer(length, (err: Error | undefined, receivedData: Buffer | undefined) => {
          if (err) reject(err)
          else resolve(receivedData || Buffer.alloc(0))
        })
      })

      return Array.from(data)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')
    } catch (error) {
      console.error('Failed to read from USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:controlTransfer', async (_event, setup: {
    requestType: 'standard' | 'class' | 'vendor'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
    data?: string
    length?: number
  }) => {
    try {
      if (!currentDevice) {
        throw new Error('USB device not open')
      }

      const bmRequestType = (() => {
        const dir = 0x80 // host-to-device for OUT, device-to-host for IN
        const typeMap = { standard: 0x00, class: 0x20, vendor: 0x40 }
        const recipMap = { device: 0x00, interface: 0x01, endpoint: 0x02, other: 0x03 }
        return dir | (typeMap[setup.requestType] || 0) | (recipMap[setup.recipient] || 0)
      })()

      if (setup.data) {
        // OUT control transfer
        const hex = setup.data.replace(/\s/g, '')
        const buffer = Buffer.from(hex, 'hex')
        await new Promise<void>((resolve, reject) => {
          currentDevice.controlTransfer(bmRequestType, setup.request, setup.value, setup.index, buffer, (err: Error | undefined) => {
            if (err) reject(err)
            else resolve()
          })
        })
        return ''
      } else {
        // IN control transfer
        const len = setup.length || 64
        const data = await new Promise<Buffer>((resolve, reject) => {
          currentDevice.controlTransfer(bmRequestType | 0x80, setup.request, setup.value, setup.index, len, (err: Error | undefined, receivedData: Buffer | undefined) => {
            if (err) reject(err)
            else resolve(receivedData || Buffer.alloc(0))
          })
        })
        return Array.from(data)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      }
    } catch (error) {
      console.error('Failed USB control transfer:', error)
      throw error
    }
  })
}
