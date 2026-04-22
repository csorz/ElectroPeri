import { BrowserWindow, ipcMain } from 'electron'

let advlibBleManufacturers: any = null

async function getAdvlib() {
  if (!advlibBleManufacturers) {
    try {
      advlibBleManufacturers = await import('advlib-ble-manufacturers')
    } catch {
      // advlib not available, parsedData will be null
    }
  }
  return advlibBleManufacturers
}

type BluetoothDeviceInfo = {
  id: string
  name: string
  address: string
  rssi?: number
  deviceClass?: number
  connected: boolean
  services?: string[]
}

let noble: any = null
let mainWindow: BrowserWindow | null = null

let scanning = false
const peripherals = new Map<string, any>()

let currentPeripheral: any = null
let currentWriteChar: any = null
let currentNotifyChar: any = null

let bluetoothAvailable = false
let bluetoothModuleError: string | null = null

// BLE 广播扫描状态
let bleScanActive = false
let bleScanDiscoverHandler: ((peripheral: any) => void) | null = null

async function ensureNoble(): Promise<any> {
  if (bluetoothAvailable && noble) return noble
  if (bluetoothModuleError) throw new Error(bluetoothModuleError)

  try {
    const mod: any = await import('@abandonware/noble')
    noble = mod.default ?? mod
    bluetoothAvailable = true
    return noble
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (
      errMsg.includes('Could not locate the bindings file') ||
      errMsg.includes('Module version mismatch') ||
      errMsg.includes('Cannot find module')
    ) {
      bluetoothModuleError =
        '蓝牙模块未安装或编译失败。Windows需要安装 Visual Studio Build Tools 后运行: pnpm rebuild @abandonware/noble'
    } else {
      bluetoothModuleError = `蓝牙模块加载失败: ${errMsg}`
    }
    throw new Error(bluetoothModuleError)
  }
}

// 检查蓝牙模块是否可用
async function checkBluetoothAvailable(): Promise<{ available: boolean; error?: string }> {
  if (bluetoothAvailable) return { available: true }
  if (bluetoothModuleError) return { available: false, error: bluetoothModuleError }

  try {
    await ensureNoble()
    return { available: true }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function waitPoweredOn(n: any): Promise<void> {
  if (n.state === 'poweredOn') return
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`蓝牙适配器状态超时: 当前状态 ${n.state}。请确认蓝牙已开启且适配器可用。`))
    }, 10000)

    const onChange = (state: string) => {
      if (state === 'poweredOn') {
        clearTimeout(timeout)
        resolve()
      } else if (state === 'unsupported' || state === 'unauthorized') {
        clearTimeout(timeout)
        reject(
          new Error(
            `蓝牙状态: ${state}。${state === 'unsupported' ? '蓝牙适配器不受支持' : '蓝牙未授权，请在系统设置中开启蓝牙'}`
          )
        )
      }
    }
    n.once('stateChange', onChange)
  })
}

export function setupBluetoothHandlers(): void {
  // 检查蓝牙模块状态
  ipcMain.handle('bluetooth:check', async () => {
    return checkBluetoothAvailable()
  })

  ipcMain.handle('bluetooth:scan', async (event) => {
    const n = await ensureNoble()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    await waitPoweredOn(n)

    const results = new Map<string, any>()

    const onDiscover = (peripheral: any) => {
      // Don't clear peripherals - keep them for connect
      peripherals.set(peripheral.id, peripheral)
      results.set(peripheral.id, peripheral)
    }

    n.on('discover', onDiscover)
    try {
      // Don't clear peripherals - connected devices may still be there
      results.clear()

      // false = allow duplicates so we get updated RSSI and don't miss devices
      n.startScanning([], false)
      scanning = true

      // Scan for 5 seconds (increased from 3 for better discovery)
      await new Promise((r) => setTimeout(r, 5000))

      n.stopScanning()
      scanning = false

      const list: BluetoothDeviceInfo[] = Array.from(results.values()).map((p: any) => ({
        id: p.id,
        name: p.advertisement?.localName || '',
        address: p.address || p.id,
        rssi: p.rssi,
        deviceClass: 0,
        connected: p.state === 'connected',
        services: p.advertisement?.serviceUuids || []
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
    if (!peripheral) throw new Error('设备未找到，请重新扫描')

    // Disconnect previous peripheral if different
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
      peripheral.connect((err: Error | null) => {
        if (err) reject(new Error(`蓝牙连接失败: ${err.message}`))
        else resolve()
      })
    })
    currentPeripheral = peripheral

    const { services, characteristics } = await new Promise<{
      services: any[]
      characteristics: any[]
    }>((resolve, reject) => {
      peripheral.discoverAllServicesAndCharacteristics(
        (err: Error | null, svcs: any[], chars: any[]) => {
          if (err) reject(new Error(`发现服务失败: ${err.message}`))
          else resolve({ services: svcs, characteristics: chars })
        }
      )
    })

    // 选择可写特征 + 可通知特征
    currentWriteChar =
      characteristics.find((c) => c.properties?.includes('write')) ||
      characteristics.find((c) => c.properties?.includes('writeWithoutResponse')) ||
      null
    currentNotifyChar = characteristics.find((c) => c.properties?.includes('notify')) || null

    if (currentNotifyChar) {
      currentNotifyChar.removeAllListeners('data')
      currentNotifyChar.on('data', (data: Buffer) => {
        const hex = Array.from(data)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
        mainWindow?.webContents.send('bluetooth:data', hex)
      })
      await new Promise<void>((resolve, reject) => {
        currentNotifyChar.subscribe((err: Error | null) => {
          if (err) reject(new Error(`订阅通知失败: ${err.message}`))
          else resolve()
        })
      })
    }

    // Store service UUIDs for discoverServices
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
    if (!currentPeripheral) throw new Error('未连接蓝牙设备')
    if (!currentWriteChar) throw new Error('无可写特征可用')

    // Support hex string input like "01 02 03" or "010203"
    let buf: Buffer
    if (/^[0-9a-fA-F\s]+$/.test(data) && data.trim().length > 0) {
      const hex = data.replace(/\s/g, '')
      buf = Buffer.from(hex, 'hex')
    } else {
      buf = Buffer.from(data, 'utf8')
    }

    const withoutResponse =
      currentWriteChar.properties?.includes('writeWithoutResponse') ?? false

    await new Promise<void>((resolve, reject) => {
      currentWriteChar.write(buf, withoutResponse, (err: Error | null) => {
        if (err) reject(new Error(`写入失败: ${err.message}`))
        else resolve()
      })
    })

    return { success: true }
  })

  ipcMain.handle('bluetooth:discoverServices', async (_event, serviceUuid?: string) => {
    if (!currentPeripheral) return []

    // If we already discovered services during connect, return them
    if (Array.isArray(currentPeripheral.__services)) {
      if (serviceUuid) {
        return currentPeripheral.__services.filter((u: string) =>
          u.includes(serviceUuid.toLowerCase())
        )
      }
      return currentPeripheral.__services
    }

    const services = await new Promise<any[]>((resolve, reject) => {
      const uuids = serviceUuid ? [serviceUuid] : []
      currentPeripheral.discoverServices(uuids, (err: Error | null, svcs: any[]) => {
        if (err) reject(new Error(`发现服务失败: ${err.message}`))
        else resolve(svcs)
      })
    })
    return services.map((s) => s.uuid)
  })

  // BLE 广播扫描 - 开始
  ipcMain.handle('ble-scan:start', async (event, companyIdStr: string, targetName: string) => {
    const n = await ensureNoble()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (bleScanActive) {
      return { success: true, message: 'already scanning' }
    }

    await waitPoweredOn(n)

    // 解析 companyId，支持 "0x1012" 和 "4114" 两种格式
    const companyId = companyIdStr.startsWith('0x') || companyIdStr.startsWith('0X')
      ? parseInt(companyIdStr, 16)
      : parseInt(companyIdStr, 10)

    if (isNaN(companyId)) {
      throw new Error(`无效的 Company ID: ${companyIdStr}`)
    }

    // 预加载 advlib 解析模块
    const advlib = await getAdvlib()

    bleScanDiscoverHandler = (peripheral: any) => {
      const ad = peripheral.advertisement
      const addr = peripheral.address || peripheral.id

      // 过滤逻辑：companyId 匹配 manufacturerData 或 name 前缀匹配
      let matched = false

      if (targetName && ad.localName && ad.localName.startsWith(targetName)) {
        matched = true
      }

      if (!matched && ad.manufacturerData && ad.manufacturerData.length >= 2) {
        const buf = Buffer.isBuffer(ad.manufacturerData) ? ad.manufacturerData : Buffer.from(ad.manufacturerData)
        const mfrCompanyId = buf.readUInt16LE(0)
        if (mfrCompanyId === companyId) {
          matched = true
        }
      }

      if (!matched) return

            // 构造推送数据
      const mfrDataHex = ad.manufacturerData
        ? (Buffer.isBuffer(ad.manufacturerData) ? ad.manufacturerData : Buffer.from(ad.manufacturerData)).toString('hex')
        : ''

      // 使用 advlib 解析 manufacturerData
      let parsedData: any = null
      if (ad.manufacturerData && ad.manufacturerData.length >= 2) {
        const buf = Buffer.isBuffer(ad.manufacturerData) ? ad.manufacturerData : Buffer.from(ad.manufacturerData)
        const mfrCode = buf.readUInt16LE(0)
        if (advlib) {
          try {
            parsedData = advlib.processManufacturerSpecificData(mfrCode, mfrDataHex)
          } catch {
            // ignore parse errors
          }
        }
      }

      mainWindow?.webContents.send('ble-scan:data', {
        mac: addr,
        name: ad.localName || '',
        rssi: peripheral.rssi,
        manufacturerData: mfrDataHex,
        parsedData,
        timestamp: new Date().toISOString()
      })
    }

    n.on('discover', bleScanDiscoverHandler)
    n.startScanning([], true) // true = allow duplicates
    bleScanActive = true

    return { success: true }
  })

  // BLE 广播扫描 - 停止
  ipcMain.handle('ble-scan:stop', async () => {
    const n = await ensureNoble()

    if (!bleScanActive) {
      return { success: true, message: 'not scanning' }
    }

    if (bleScanDiscoverHandler) {
      n.removeListener('discover', bleScanDiscoverHandler)
      bleScanDiscoverHandler = null
    }

    n.stopScanning()
    bleScanActive = false

    return { success: true }
  })
}
