import { ipcMain } from 'electron'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupMediaHandlers(): void {
  ipcMain.handle('media:devices', async () => {
    const si = await ensureSI()
    const [audio, graphics, usb] = await Promise.all([si.audio(), si.graphics(), si.usb()])
    return { audio, graphics, usb }
  })
}

