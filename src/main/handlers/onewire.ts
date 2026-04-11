import { ipcMain } from 'electron'

async function ensureDs18b20() {
  const mod: any = await import('ds18b20')
  return mod.default ?? mod
}

export function setupOnewireHandlers(): void {
  ipcMain.handle('onewire:list', async () => {
    if (process.platform !== 'linux') {
      throw new Error('1-Wire 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    const ds = await ensureDs18b20()
    const ids: string[] = await new Promise((resolve, reject) => {
      ds.sensors((err: Error, sensors: string[]) => {
        if (err) reject(err)
        else resolve(sensors)
      })
    })
    return ids
  })

  ipcMain.handle('onewire:read', async (_event, sensorId: string) => {
    if (process.platform !== 'linux') {
      throw new Error('1-Wire 仅支持 Linux（如树莓派）。当前系统不支持。')
    }
    const ds = await ensureDs18b20()
    const celsius: number = await new Promise((resolve, reject) => {
      ds.temperature(sensorId, (err: Error, value: number) => {
        if (err) reject(err)
        else resolve(value)
      })
    })
    return celsius
  })
}

