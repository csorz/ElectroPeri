import { ipcMain, BrowserWindow } from 'electron'
import type { SerialPort } from 'serialport'

// Store active connections
const activePorts: Map<string, SerialPort> = new Map()
let currentPort: SerialPort | null = null
let mainWindow: BrowserWindow | null = null

async function getSerialPort() {
  try {
    const module = await import('serialport')
    return module.SerialPort
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (errMsg.includes('Cannot find module') && errMsg.includes('bindings-cpp')) {
      throw new Error('串口原生模块未安装。请运行: pnpm add @serialport/bindings-cpp && pnpm electron-builder install-app-deps')
    }
    if (errMsg.includes('Could not locate the bindings file') || errMsg.includes('Module version mismatch')) {
      throw new Error('串口模块未正确编译。请运行: pnpm electron-builder install-app-deps')
    }
    if (errMsg.includes('Visual Studio')) {
      throw new Error('缺少编译工具。请安装 Visual Studio Build Tools (C++ 工作负载)，然后运行: pnpm electron-builder install-app-deps')
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

  ipcMain.handle('serial:open', async (event, path: string, baudRate: number) => {
    try {
      const SerialPort = await getSerialPort()
      mainWindow = BrowserWindow.fromWebContents(event.sender)

      if (currentPort && currentPort.isOpen) {
        await new Promise<void>((resolve) => currentPort!.close(() => resolve()))
      }

      currentPort = new SerialPort({
        path,
        baudRate,
        autoOpen: false
      })

      await new Promise<void>((resolve, reject) => {
        currentPort!.open((err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Listen for data
      currentPort.on('data', (data: Buffer) => {
        mainWindow?.webContents.send('serial:data', data.toString())
      })

      currentPort.on('error', (err: Error) => {
        mainWindow?.webContents.send('serial:error', err.message)
      })

      currentPort.on('close', () => {
        mainWindow?.webContents.send('serial:closed')
        currentPort = null
      })

      activePorts.set(path, currentPort)
      return { success: true }
    } catch (error) {
      console.error('Failed to open serial port:', error)
      throw error
    }
  })

  ipcMain.handle('serial:close', async () => {
    try {
      if (currentPort && currentPort.isOpen) {
        await new Promise<void>((resolve) => currentPort!.close(() => resolve()))
        currentPort = null
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to close serial port:', error)
      throw error
    }
  })

  ipcMain.handle('serial:write', async (_event, data: string) => {
    try {
      if (!currentPort || !currentPort.isOpen) {
        throw new Error('Serial port not open')
      }

      await new Promise<void>((resolve, reject) => {
        currentPort!.write(data, (err) => {
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
}
