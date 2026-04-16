import { ipcMain, powerMonitor } from 'electron'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupPowerHandlers(): void {
  ipcMain.handle('power:snapshot', async () => {
    const onBattery = powerMonitor.isOnBatteryPower()

    try {
      const si = await ensureSI()
      const battery = await si.battery()
      return {
        onBattery,
        percent: battery.percent || 0,
        charging: battery.charging || false,
        acConnected: battery.acConnected || false,
        timeRemaining: battery.timeRemaining || -1,
        type: battery.type || '',
        manufacturer: battery.manufacturer || '',
        model: battery.model || '',
        serial: battery.serial || '',
        cycleCount: battery.cycleCount || 0
      }
    } catch {
      // systeminformation battery may not be available on all systems
      return {
        onBattery,
        percent: 0,
        charging: false,
        acConnected: !onBattery,
        timeRemaining: -1,
        type: '',
        manufacturer: '',
        model: '',
        serial: '',
        cycleCount: 0
      }
    }
  })
}
