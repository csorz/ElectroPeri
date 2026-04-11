import { ipcMain } from 'electron'

let i2c: any | null = null
let busNumber: number | null = null

async function ensureI2cBus() {
  const mod: any = await import('i2c-bus')
  return mod.default ?? mod
}

function hexToBuffer(hex: string) {
  const cleaned = hex.replaceAll(' ', '').replace(/^0x/i, '')
  if (cleaned.length % 2 !== 0) throw new Error('Invalid hex length')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16)
  }
  return Buffer.from(bytes)
}

export function setupI2cHandlers(): void {
  ipcMain.handle('i2c:open', async (_event, bus: number) => {
    if (process.platform !== 'linux') {
      throw new Error('I2C 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    const mod = await ensureI2cBus()
    if (i2c) {
      try {
        i2c.closeSync()
      } catch {
        // ignore
      }
      i2c = null
      busNumber = null
    }
    i2c = mod.openSync(bus)
    busNumber = bus
    return { success: true }
  })

  ipcMain.handle('i2c:close', async () => {
    if (i2c) {
      try {
        i2c.closeSync()
      } finally {
        i2c = null
        busNumber = null
      }
    }
    return { success: true }
  })

  ipcMain.handle('i2c:scan', async (_event, bus: number) => {
    if (process.platform !== 'linux') {
      throw new Error('I2C 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    const mod = await ensureI2cBus()
    const b = mod.openSync(bus)
    try {
      const found: number[] = []
      for (let addr = 0x03; addr <= 0x77; addr++) {
        try {
          b.receiveByteSync(addr)
          found.push(addr)
        } catch {
          // ignore
        }
      }
      return found
    } finally {
      try {
        b.closeSync()
      } catch {
        // ignore
      }
    }
  })

  ipcMain.handle('i2c:write', async (_event, addr: number, hex: string) => {
    if (!i2c || busNumber === null) throw new Error('I2C not open')
    const buf = hexToBuffer(hex)
    i2c.i2cWriteSync(addr, buf.length, buf)
    return { success: true }
  })

  ipcMain.handle('i2c:read', async (_event, addr: number, length: number) => {
    if (!i2c || busNumber === null) throw new Error('I2C not open')
    const buf = Buffer.alloc(length)
    const read = i2c.i2cReadSync(addr, length, buf)
    return buf.subarray(0, read).toString('hex')
  })
}

