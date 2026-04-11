import { app, ipcMain, screen } from 'electron'

async function ensureSI() {
  const mod: any = await import('systeminformation')
  return mod.default ?? mod
}

export function setupDisplayHandlers(): void {
  ipcMain.handle('display:info', async () => {
    const displays = screen.getAllDisplays().map((d) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      rotation: d.rotation,
      size: d.size,
      displayFrequency: (d as any).displayFrequency
    }))

    const gpu = await app.getGPUInfo('complete')
    const si = await ensureSI()
    const graphics = await si.graphics()

    return { displays, gpu, graphics }
  })
}

