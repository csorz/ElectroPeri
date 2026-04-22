import { ipcMain, desktopCapturer, BrowserWindow, dialog } from 'electron'
import fs from 'fs'

let mainWindowRef: BrowserWindow | null = null

export function setupMixerHandlers(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow

  // 枚举屏幕和窗口源
  ipcMain.handle('mixer:getSources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true
    })
    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL(),
      type: s.id.startsWith('screen:') ? 'screen' : 'window',
      appIcon: s.appIcon && !s.appIcon.isEmpty() ? s.appIcon.toDataURL() : null
    }))
  })

  // 选择本地视频文件
  ipcMain.handle('mixer:selectVideo', async () => {
    if (!mainWindowRef) return { canceled: true }
    const result = await dialog.showOpenDialog(mainWindowRef, {
      properties: ['openFile'],
      filters: [
        { name: 'Video', extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }
    return { canceled: false, path: result.filePaths[0] }
  })

  // 保存录制文件
  ipcMain.handle('mixer:saveRecording', async (_event, args: { defaultName: string }) => {
    if (!mainWindowRef) return { success: false, error: 'No main window' }

    const result = await dialog.showSaveDialog(mainWindowRef, {
      defaultPath: args.defaultName || 'recording.webm',
      filters: [{ name: 'WebM', extensions: ['webm'] }]
    })

    if (result.canceled || !result.filePath) {
      return { success: false }
    }

    return { success: true, path: result.filePath }
  })

  // 写入录制文件数据
  ipcMain.handle('mixer:writeFile', async (_event, args: { path: string; data: number[] }) => {
    try {
      const buffer = Buffer.from(args.data)
      fs.writeFileSync(args.path, buffer)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}
