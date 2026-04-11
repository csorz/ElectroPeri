import { ipcMain } from 'electron'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupStorageHandlers(): void {
  ipcMain.handle('storage:fs', async () => {
    const si = await ensureSI()
    const [fsSize, disks, block] = await Promise.all([si.fsSize(), si.diskLayout(), si.blockDevices()])
    return { fsSize, disks, block }
  })
}

