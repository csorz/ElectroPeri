import { ipcMain } from 'electron'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

async function ensurePsList() {
  const mod: any = await import('ps-list')
  return mod.default ?? mod
}

export function setupProcessHandlers(): void {
  ipcMain.handle('process:list', async () => {
    const psList = await ensurePsList()
    return psList()
  })

  ipcMain.handle('process:load', async () => {
    const si = await ensureSI()
    const [currentLoad, processes] = await Promise.all([si.currentLoad(), si.processes()])
    return { currentLoad, processes }
  })
}

