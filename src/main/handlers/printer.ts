import { BrowserWindow, ipcMain } from 'electron'

export function setupPrinterHandlers(): void {
  ipcMain.handle('printer:list', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) {
      throw new Error('No active window for printer query')
    }
    const printers = await win.webContents.getPrintersAsync()
    return printers
  })
}

