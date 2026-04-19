import { ipcMain, desktopCapturer, BrowserWindow, dialog, nativeImage, screen } from 'electron'
import path from 'path'
import fs from 'fs'

// 存储截图源数据，供裁剪时使用
let capturedSources: Electron.DesktopCapturerSource[] = []

// 主窗口引用，由 setup 函数注入
let mainWindowRef: BrowserWindow | null = null

export function setupScreenshotHandlers(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow

  // 获取所有屏幕截图源
  ipcMain.handle('screenshot:getSources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 320, height: 180 }
    })
    capturedSources = sources
    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL()
    }))
  })

  // 开始截图：创建覆盖窗口
  ipcMain.handle('screenshot:startCapture', async (_event, sourceId: string) => {
    const source = capturedSources.find((s) => s.id === sourceId)
    if (!source) return

    // 确定目标显示器
    const displays = screen.getAllDisplays()
    const targetDisplay = displays.find((d) => source.id.includes(String(d.id))) || displays[0]

    // 获取高分辨率截图用于裁剪（thumbnailSize 不能为 0x0，否则返回空图像）
    const captureWidth = targetDisplay.bounds.width * targetDisplay.scaleFactor
    const captureHeight = targetDisplay.bounds.height * targetDisplay.scaleFactor
    const fullSources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: captureWidth, height: captureHeight },
      fetchWindowIcons: false
    })
    const fullSource = fullSources.find((s) => s.id === sourceId)
    if (fullSource) {
      capturedSources = fullSources
    }

    // 创建覆盖窗口
    const overlay = new BrowserWindow({
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      fullscreen: true,
      hasShadow: false,
      x: targetDisplay.bounds.x,
      y: targetDisplay.bounds.y,
      width: targetDisplay.bounds.width,
      height: targetDisplay.bounds.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    const screenshotDataURL = (fullSource || source).thumbnail.toDataURL()

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; cursor: crosshair; user-select: none; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="overlay"></canvas>
<script>
const { ipcRenderer } = require('electron')
const canvas = document.getElementById('overlay')
const ctx = canvas.getContext('2d')

let screenshotImg = null
let isSelecting = false
let startX = 0, startY = 0, endX = 0, endY = 0

const screenshotSrc = '${screenshotDataURL}'

function init() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    draw()
  })

  const img = new Image()
  img.onload = () => {
    screenshotImg = img
    draw()
  }
  img.src = screenshotSrc
}

function draw() {
  if (!screenshotImg) return
  const w = canvas.width
  const h = canvas.height

  ctx.drawImage(screenshotImg, 0, 0, w, h)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.fillRect(0, 0, w, h)

  if (isSelecting) {
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const rw = Math.abs(endX - startX)
    const rh = Math.abs(endY - startY)

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, rw, rh)
    ctx.clip()
    ctx.drawImage(screenshotImg, 0, 0, w, h)
    ctx.restore()

    ctx.strokeStyle = '#4fc3f7'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, rw, rh)

    if (rw > 30 && rh > 20) {
      const label = rw + ' x ' + rh
      ctx.font = '12px sans-serif'
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      const tm = ctx.measureText(label)
      const lx = x + rw / 2 - tm.width / 2 - 4
      const ly = y + rh + 6
      ctx.fillRect(lx, ly, tm.width + 8, 18)
      ctx.fillStyle = '#fff'
      ctx.fillText(label, lx + 4, ly + 13)
    }
  }
}

canvas.addEventListener('mousedown', (e) => {
  isSelecting = true
  startX = e.clientX
  startY = e.clientY
  endX = e.clientX
  endY = e.clientY
})

canvas.addEventListener('mousemove', (e) => {
  if (!isSelecting) return
  endX = e.clientX
  endY = e.clientY
  draw()
})

canvas.addEventListener('mouseup', (e) => {
  if (!isSelecting) return
  isSelecting = false
  endX = e.clientX
  endY = e.clientY

  const x = Math.min(startX, endX)
  const y = Math.min(startY, endY)
  const w = Math.abs(endX - startX)
  const h = Math.abs(endY - startY)

  if (w < 5 || h < 5) {
    ipcRenderer.send('screenshot:captureCancelled')
  } else {
    ipcRenderer.send('screenshot:regionSelected', { x, y, width: w, height: h })
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ipcRenderer.send('screenshot:captureCancelled')
  }
})

init()
</script>
</body>
</html>`

    overlay.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    ipcMain.once('screenshot:regionSelected', (_e, region) => {
      overlay.close()
      if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        mainWindowRef.webContents.send('screenshot:regionSelected', region)
      }
    })

    ipcMain.once('screenshot:captureCancelled', () => {
      overlay.close()
      if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        mainWindowRef.webContents.send('screenshot:captureCancelled')
      }
    })
  })

  // 裁剪指定区域
  ipcMain.handle(
    'screenshot:cropRegion',
    async (_event, args: { sourceId: string; x: number; y: number; width: number; height: number }) => {
      const source = capturedSources.find((s) => s.id === args.sourceId)
      if (!source) return ''

      const fullImg = nativeImage.createFromDataURL(source.thumbnail.toDataURL())
      const size = fullImg.getSize()

      const displays = screen.getAllDisplays()
      const display = displays.find((d) => args.sourceId.includes(String(d.id))) || displays[0]
      const scaleX = size.width / display.bounds.width
      const scaleY = size.height / display.bounds.height

      const cropX = Math.round(args.x * scaleX)
      const cropY = Math.round(args.y * scaleY)
      const cropW = Math.round(args.width * scaleX)
      const cropH = Math.round(args.height * scaleY)

      const cropped = fullImg.crop({ x: cropX, y: cropY, width: cropW, height: cropH })
      return cropped.toDataURL()
    }
  )

  // 保存截图
  ipcMain.handle(
    'screenshot:save',
    async (_event, args: { dataURL: string; defaultName: string }) => {
      if (!mainWindowRef) return { success: false, error: 'No main window' }

      const result = await dialog.showSaveDialog(mainWindowRef, {
        defaultPath: args.defaultName || 'screenshot.png',
        filters: [
          { name: 'PNG', extensions: ['png'] },
          { name: 'JPEG', extensions: ['jpg'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { success: false }
      }

      try {
        const img = nativeImage.createFromDataURL(args.dataURL)
        const ext = path.extname(result.filePath).toLowerCase()
        const buffer = ext === '.jpg' || ext === '.jpeg' ? img.toJPEG(90) : img.toPNG()
        fs.writeFileSync(result.filePath, buffer)
        return { success: true, path: result.filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )
}
