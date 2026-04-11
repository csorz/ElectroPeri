import { ipcMain, powerMonitor } from 'electron'

export function setupPowerHandlers(): void {
  ipcMain.handle('power:snapshot', async () => {
    return {
      onBattery: powerMonitor.isOnBatteryPower()
    }
  })
}

