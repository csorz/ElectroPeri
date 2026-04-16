import { ipcMain } from 'electron'
import os from 'node:os'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupSystemHandlers(): void {
  ipcMain.handle('system:basic', async () => {
    const si = await ensureSI()
    const [cpu, mem, osInfo, time, load, temp] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.time(),
      si.currentLoad(),
      si.cpuTemperature().catch(() => ({ main: 0, cores: [] as number[] }))
    ])
    return {
      cpu,
      mem,
      osInfo,
      time,
      load,
      temp,
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: process.platform
    }
  })
}
