import { BrowserWindow, ipcMain } from 'electron'

type BluetoothDeviceInfo = {
  id: string
  name: string
  address: string
  rssi?: number
  deviceClass?: number
  connected: boolean
  services?: string[]
}

let noble: any | null = null
let mainWindow: BrowserWindow | null = null

let scanning = false
const peripherals = new Map<string, any>()

let currentPeripheral: any | null = null
let currentWriteChar: any | null = null
let currentNotifyChar: any | null = null

async function ensureNoble() {
  if (noble) return noble
  try {
    const mod: any = await import('@abandonware/noble')
    noble = mod.default ?? mod
    return noble
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (errMsg.includes('Could not locate the bindings file') || errMsg.includes('Module version mismatch')) {
      throw new Error(
        '蓝牙模块未正确编译。请运行: pnpm electron-builder install-app-deps 或 pnpm rebuild @abandonware/noble'
      )
    }
    throw new Error(`蓝牙模块加载失败: ${errMsg}`)
  }
}

async function waitPoweredOn(n: any) {
  if (n.state === 'poweredOn') return
  await new Promise<void>((resolve, reject) => {
    const onChange = (state: string) => {
      if (state === 'poweredOn') resolve()
      else if (state === 'unsupported' || state === 'unauthorized') {
        reject(new Error(`Bluetooth state: ${state}`))
      }
    }
    n.once('stateChange', onChange)
  })
}

export function setupBluetoothHandlers(): void {
  ipcMain.handle('bluetooth:scan', async (event) => {
    const n = await ensureNoble()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    await waitPoweredOn(n)

    const results = new Map<string, any>()

    const onDiscover = (peripheral: any) => {
      peripherals.set(peripheral.id, peripheral)
      results.set(peripheral.id, peripheral)
    }

    n.on('discover', onDiscover)
    try {
      peripherals.clear()
      results.clear()

      n.startScanning([], true)
      scanning = true

      // 简单扫描 3 秒
      await new Promise((r) => setTimeout(r, 3000))

      n.stopScanning()
      scanning = false

      const list: BluetoothDeviceInfo[] = Array.from(results.values()).map((p: any) => ({
        id: p.id,
        name: p.advertisement?.localName || 'BLE 设备',
        address: p.address || p.id,
        rssi: p.rssi,
        deviceClass: 0,
        connected: p.state === 'connected',
        services: []
      }))

      return list
    } finally {
      n.removeListener('discover', onDiscover)
    }
  })

  ipcMain.handle('bluetooth:stopScan', async () => {
    const n = await ensureNoble()
    if (scanning) {
      n.stopScanning()
      scanning = false
    }
    return { success: true }
  })

  ipcMain.handle('bluetooth:connect', async (event, deviceId: string) => {
    const n = await ensureNoble()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    await waitPoweredOn(n)

    const peripheral = peripherals.get(deviceId)
    if (!peripheral) throw new Error('Device not found')

    if (currentPeripheral && currentPeripheral.id !== peripheral.id) {
      try {
        await new Promise<void>((resolve) => currentPeripheral.disconnect(() => resolve()))
      } catch {
        // ignore
      }
      currentPeripheral = null
      currentWriteChar = null
      currentNotifyChar = null
    }

    await new Promise<void>((resolve, reject) => {
      peripheral.connect((err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
    currentPeripheral = peripheral

    const { services, characteristics } = await new Promise<{
      services: any[]
      characteristics: any[]
    }>((resolve, reject) => {
      peripheral.discoverAllServicesAndCharacteristics(
        (err: Error, svcs: any[], chars: any[]) => {
          if (err) reject(err)
          else resolve({ services: svcs, characteristics: chars })
        }
      )
    })

    // 选择一条可写特征 + 一条可通知特征（尽量通用）
    currentWriteChar =
      characteristics.find((c) => c.properties?.includes('write')) ||
      characteristics.find((c) => c.properties?.includes('writeWithoutResponse')) ||
      null
    currentNotifyChar = characteristics.find((c) => c.properties?.includes('notify')) || null

    if (currentNotifyChar) {
      currentNotifyChar.removeAllListeners('data')
      currentNotifyChar.on('data', (data: Buffer) => {
        // 这里先按 utf8 尝试输出；如需 hex 可以在页面层切换展示
        mainWindow?.webContents.send('bluetooth:data', data.toString('utf8'))
      })
      await new Promise<void>((resolve, reject) => {
        currentNotifyChar.subscribe((err: Error) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

    // 将服务列表返回给 discoverServices 复用（也可直接返回）
    peripheral.__services = services.map((s) => s.uuid)

    return { success: true }
  })

  ipcMain.handle('bluetooth:disconnect', async () => {
    if (!currentPeripheral) return { success: true }

    const p = currentPeripheral
    currentPeripheral = null
    currentWriteChar = null
    currentNotifyChar = null

    await new Promise<void>((resolve) => p.disconnect(() => resolve()))
    return { success: true }
  })

  ipcMain.handle('bluetooth:write', async (_event, data: string) => {
    if (!currentPeripheral) throw new Error('Not connected')
    if (!currentWriteChar) throw new Error('No writable characteristic available')

    const buf = Buffer.from(data, 'utf8')
    const withoutResponse = currentWriteChar.properties?.includes('writeWithoutResponse') ?? false

    await new Promise<void>((resolve, reject) => {
      currentWriteChar.write(buf, withoutResponse, (err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })

    return { success: true }
  })

  ipcMain.handle('bluetooth:discoverServices', async () => {
    if (!currentPeripheral) return []
    if (Array.isArray(currentPeripheral.__services)) return currentPeripheral.__services

    const services = await new Promise<any[]>((resolve, reject) => {
      currentPeripheral.discoverServices([], (err: Error, svcs: any[]) => {
        if (err) reject(err)
        else resolve(svcs)
      })
    })
    return services.map((s) => s.uuid)
  })
}
