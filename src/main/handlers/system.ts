import { ipcMain } from 'electron'
import os from 'node:os'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupSystemHandlers(): void {
  ipcMain.handle('system:basic', async () => {
    const si = await ensureSI()
    const [cpu, mem, osInfo, time, load] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.time(),
      si.currentLoad()
    ])
    return { cpu, mem, osInfo, time, load, hostname: os.hostname(), platform: process.platform }
  })
}

