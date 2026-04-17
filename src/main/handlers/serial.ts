import { ipcMain, BrowserWindow } from 'electron'
import type { SerialPort } from 'serialport'

// Store active connections by path
const activePorts: Map<string, SerialPort> = new Map()
let mainWindow: BrowserWindow | null = null

async function getSerialPort() {
  try {
    const module = await import('serialport')
    return module.SerialPort
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (errMsg.includes('Cannot find module') && errMsg.includes('bindings-cpp')) {
      throw new Error(
        '串口原生模块未安装。请运行: pnpm add @serialport/bindings-cpp && pnpm electron-builder install-app-deps'
      )
    }
    if (
      errMsg.includes('Could not locate the bindings file') ||
      errMsg.includes('Module version mismatch')
    ) {
      throw new Error('串口模块未正确编译。请运行: pnpm electron-builder install-app-deps')
    }
    if (errMsg.includes('Visual Studio')) {
      throw new Error(
        '缺少编译工具。请安装 Visual Studio Build Tools (C++ 工作负载)，然后运行: pnpm electron-builder install-app-deps'
      )
    }
    throw new Error(`串口模块加载失败: ${errMsg}`)
  }
}

export function setupSerialHandlers(): void {
  // Get main window for sending data back
  ipcMain.handle('serial:list', async () => {
    try {
      const SerialPort = await getSerialPort()
      const ports = await SerialPort.list()
      return ports.map((port) => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        vendorId: port.vendorId,
        productId: port.productId
      }))
    } catch (error) {
      console.error('Failed to list serial ports:', error)
      throw error
    }
  })

  ipcMain.handle(
    'serial:open',
    async (
      event,
      path: string,
      baudRate: number,
      dataBits: number,
      stopBits: number,
      parity: string
    ) => {
      try {
        const SerialPort = await getSerialPort()
        mainWindow = BrowserWindow.fromWebContents(event.sender)

        // Check if already connected to this port
        if (activePorts.has(path)) {
          const existingPort = activePorts.get(path)!
          if (existingPort.isOpen) {
            return { success: true, path, message: 'Already connected' }
          }
        }

        // Map parity string to SerialPort parity type
        const parityMap: Record<string, 'none' | 'even' | 'odd' | 'mark' | 'space'> = {
          none: 'none',
          even: 'even',
          odd: 'odd',
          mark: 'mark',
          space: 'space'
        }

        const options = {
          path,
          baudRate,
          dataBits: dataBits as 5 | 6 | 7 | 8,
          stopBits: stopBits as 1 | 1.5 | 2,
          parity: parityMap[parity] || 'none',
          autoOpen: false
        }

        const port = new SerialPort(options)

        await new Promise<void>((resolve, reject) => {
          port.open((err) => {
            if (err) reject(err)
            else resolve()
          })
        })

        // Listen for data - include path in the event
        port.on('data', (data: Buffer) => {
          const hexStr = data.toString('hex').toUpperCase()
          console.log(`[Serial RX] ${path}: (HEX: ${hexStr})`)
          mainWindow?.webContents.send('serial:data', { path, data: hexStr })
        })

        port.on('error', (err: Error) => {
          mainWindow?.webContents.send('serial:error', { path, error: err.message })
        })

        port.on('close', () => {
          mainWindow?.webContents.send('serial:closed', { path })
          activePorts.delete(path)
        })

        activePorts.set(path, port)
        console.log(`[Serial] Opened ${path}: ${baudRate} baud, ${dataBits} data bits, ${stopBits} stop bits, ${parity} parity`)
        return { success: true, path }
      } catch (error) {
        console.error('Failed to open serial port:', error)
        throw error
      }
    }
  )

  ipcMain.handle('serial:close', async (_event, path?: string) => {
    try {
      if (path) {
        // Close specific port
        const port = activePorts.get(path)
        if (port && port.isOpen) {
          await new Promise<void>((resolve) => port.close(() => resolve()))
          activePorts.delete(path)
        }
      } else {
        // Close all ports (legacy behavior)
        for (const port of activePorts.values()) {
          if (port.isOpen) {
            await new Promise<void>((resolve) => port.close(() => resolve()))
          }
        }
        activePorts.clear()
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to close serial port:', error)
      throw error
    }
  })

  ipcMain.handle('serial:write', async (_event, path: string, data: string, format: 'text' | 'hex' = 'text') => {
    try {
      const port = activePorts.get(path)
      if (!port || !port.isOpen) {
        throw new Error(`Serial port ${path} not open`)
      }

      let buffer: Buffer
      if (format === 'hex') {
        const hexStr = data.replace(/[\s,]/g, '')
        if (!/^[0-9a-fA-F]*$/.test(hexStr) || hexStr.length % 2 !== 0) {
          throw new Error('Invalid hex format')
        }
        buffer = Buffer.from(hexStr, 'hex')
      } else {
        buffer = Buffer.from(data, 'latin1')
      }

      const hexStr = buffer.toString('hex').toUpperCase()
      console.log(`[Serial TX] ${path}: (HEX: ${hexStr})`)

      await new Promise<void>((resolve, reject) => {
        port.write(buffer, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to write to serial port:', error)
      throw error
    }
  })

  ipcMain.handle('serial:isOpen', async (_event, path: string) => {
    const port = activePorts.get(path)
    return port?.isOpen ?? false
  })

  ipcMain.handle('serial:getOpenPorts', async () => {
    return Array.from(activePorts.keys())
  })
}
