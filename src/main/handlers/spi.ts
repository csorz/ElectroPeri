import { ipcMain } from 'electron'

let device: any | null = null

async function ensureSpiDevice() {
  const mod: any = await import('spi-device')
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

export function setupSpiHandlers(): void {
  ipcMain.handle('spi:open', async (_event, bus: number, cs: number) => {
    if (process.platform !== 'linux') {
      throw new Error('SPI 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    const spi = await ensureSpiDevice()
    if (device) {
      try {
        await new Promise<void>((resolve) => device.close(() => resolve()))
      } catch {
        // ignore
      }
      device = null
    }

    device = await new Promise<any>((resolve, reject) => {
      spi.open(bus, cs, (err: Error, d: any) => {
        if (err) reject(err)
        else resolve(d)
      })
    })
    return { success: true }
  })

  ipcMain.handle('spi:close', async () => {
    if (!device) return { success: true }
    await new Promise<void>((resolve) => device.close(() => resolve()))
    device = null
    return { success: true }
  })

  ipcMain.handle(
    'spi:transfer',
    async (
      _event,
      hexTx: string,
      rxLength: number,
      speedHz = 1_000_000,
      mode: 0 | 1 | 2 | 3 = 0
    ) => {
      if (!device) throw new Error('SPI not open')

      const sendBuffer = hexToBuffer(hexTx)
      const receiveBuffer = Buffer.alloc(rxLength)

      const message = [
        {
          sendBuffer,
          receiveBuffer,
          byteLength: Math.max(sendBuffer.length, receiveBuffer.length),
          speedHz,
          microSecondDelay: 0,
          bitsPerWord: 8,
          chipSelectChange: false,
          mode
        }
      ]

      await new Promise<void>((resolve, reject) => {
        device.transfer(message, (err: Error) => {
          if (err) reject(err)
          else resolve()
        })
      })

      return receiveBuffer.toString('hex')
    }
  )
}

