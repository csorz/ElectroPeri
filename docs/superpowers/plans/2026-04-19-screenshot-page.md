# 屏幕截图页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在"系统与终端能力"模块中新增屏幕截图页面，支持自由选取屏幕区域截图、预览、重新选取、选择保存位置下载。

**Architecture:** 主进程使用 `desktopCapturer.getSources()` 截取屏幕，创建无边框透明覆盖窗口让用户拖拽框选区域，通过 IPC 将选区坐标返回渲染进程，主进程裁剪 `NativeImage` 后返回 dataURL 预览，保存时用 `dialog.showSaveDialog()` 选择路径。

**Tech Stack:** Electron (desktopCapturer, NativeImage, BrowserWindow, dialog, ipcMain/ipcRenderer), React, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/main/handlers/screenshot.ts` | Create | IPC handlers: getSources, startCapture, cropRegion, save |
| `src/main/index.ts` | Modify | 注册 screenshot handler（动态 import） |
| `src/preload/index.ts` | Modify | 添加 screenshotApi |
| `src/preload/index.d.ts` | Modify | 添加 ScreenshotApi 类型 |
| `src/renderer/src/pages/system/ScreenshotPage.tsx` | Create | 页面组件 |
| `src/renderer/src/pages/system/ScreenshotPage.css` | Create | 页面样式 |
| `src/renderer/src/App.tsx` | Modify | 添加路由 `/screenshot` |
| `src/renderer/src/components/Layout.tsx` | Modify | 侧边栏 p2 组添加入口 |
| `src/renderer/src/pages/HomePage.tsx` | Modify | 首页 P2 卡片添加入口 |

---

### Task 1: 主进程 screenshot handler

**Files:**
- Create: `src/main/handlers/screenshot.ts`
- Modify: `src/main/index.ts:208-232`

- [ ] **Step 1: 创建 screenshot handler 文件**

创建 `src/main/handlers/screenshot.ts`：

```typescript
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

    // 获取高分辨率截图用于裁剪
    const fullSources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 0, height: 0 },
      fetchWindowIcons: false
    })
    const fullSource = fullSources.find((s) => s.id === sourceId)
    if (fullSource) {
      capturedSources = fullSources
    }

    // 确定目标显示器
    const displays = screen.getAllDisplays()
    const targetDisplay = displays.find((d) => source.id.includes(String(d.id))) || displays[0]

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
      const display = displays[0]
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
```

- [ ] **Step 2: 在主进程注册 handler**

修改 `src/main/index.ts`：

在 `handlers` 数组（第 208-232 行）中，在 `{ name: 'media', ... }` 行后添加：

```typescript
      { name: 'screenshot', setup: () => import('./handlers/screenshot').then(m => m.setupScreenshotHandlers(mainWindow)) },
```

注意：这里 `mainWindow` 尚未创建。需要将 handler 注册移到 `createWindow()` 之后，或者在 handler 注册时使用 `BrowserWindow.getAllWindows()[0]`。

**实际做法：** 将 screenshot handler 的注册移到 `createWindow()` 调用之后。在 `createWindow()` 函数末尾（`startupLog.info('Window setup complete')` 之前），添加：

```typescript
    // 注册 screenshot handler（需要 mainWindow 引用）
    try {
      const { setupScreenshotHandlers } = await import('./handlers/screenshot')
      setupScreenshotHandlers(mainWindow)
      startupLog.debug('Handler loaded: screenshot')
    } catch (err) {
      startupLog.warn('Failed to load handler screenshot:', err)
    }
```

- [ ] **Step 3: 验证编译通过**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无新增错误

- [ ] **Step 4: Commit**

```bash
git add src/main/handlers/screenshot.ts src/main/index.ts
git commit -m "feat: add screenshot IPC handlers (getSources, startCapture, cropRegion, save)"
```

---

### Task 2: Preload API 暴露

**Files:**
- Modify: `src/preload/index.ts:186-188`
- Modify: `src/preload/index.d.ts:183-185`

- [ ] **Step 1: 在 preload 添加 screenshotApi**

修改 `src/preload/index.ts`：

在 `mediaApi` 定义（第 186-188 行）之后添加：

```typescript
const screenshotApi = {
  getSources: () => ipcRenderer.invoke('screenshot:getSources'),
  startCapture: (sourceId: string) => ipcRenderer.invoke('screenshot:startCapture', sourceId),
  cropRegion: (args: { sourceId: string; x: number; y: number; width: number; height: number }) =>
    ipcRenderer.invoke('screenshot:cropRegion', args),
  save: (args: { dataURL: string; defaultName: string }) =>
    ipcRenderer.invoke('screenshot:save', args),
  onRegionSelected: (callback: (region: { x: number; y: number; width: number; height: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, region: { x: number; y: number; width: number; height: number }) => callback(region)
    ipcRenderer.on('screenshot:regionSelected', handler)
    return () => ipcRenderer.removeListener('screenshot:regionSelected', handler)
  },
  onCaptureCancelled: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('screenshot:captureCancelled', handler)
    return () => ipcRenderer.removeListener('screenshot:captureCancelled', handler)
  }
}
```

在 `api` 对象（第 272-296 行）中，在 `media: mediaApi,` 行后添加：

```typescript
  screenshot: screenshotApi,
```

- [ ] **Step 2: 在类型定义中添加 ScreenshotApi**

修改 `src/preload/index.d.ts`：

在 `MediaApi` 接口（第 183-185 行）之后添加：

```typescript
interface ScreenshotApi {
  getSources: () => Promise<{ id: string; name: string; thumbnail: string }[]>
  startCapture: (sourceId: string) => Promise<void>
  cropRegion: (args: { sourceId: string; x: number; y: number; width: number; height: number }) => Promise<string>
  save: (args: { dataURL: string; defaultName: string }) => Promise<{ success: boolean; path?: string; error?: string }>
  onRegionSelected: (callback: (region: { x: number; y: number; width: number; height: number }) => void) => () => void
  onCaptureCancelled: (callback: () => void) => () => void
}
```

在 `Api` 接口（第 285-309 行）中，在 `media: MediaApi,` 行后添加：

```typescript
  screenshot: ScreenshotApi
```

- [ ] **Step 3: 验证编译通过**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无新增错误

- [ ] **Step 4: Commit**

```bash
git add src/preload/index.ts src/preload/index.d.ts
git commit -m "feat: add screenshot API to preload"
```

---

### Task 3: 截图页面组件

**Files:**
- Create: `src/renderer/src/pages/system/ScreenshotPage.tsx`
- Create: `src/renderer/src/pages/system/ScreenshotPage.css`

- [ ] **Step 1: 创建页面样式文件**

创建 `src/renderer/src/pages/system/ScreenshotPage.css`：

```css
.screenshot-page {
  padding: 20px;
}

.screenshot-page .page-header {
  margin-bottom: 20px;
}

.screenshot-page .page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.screenshot-page .page-header p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.screenshot-page .demo-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.screenshot-page .capture-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #4fc3f7;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.screenshot-page .capture-btn:hover {
  background: #29b6f6;
}

.screenshot-page .capture-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.screenshot-page .preview-area {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.screenshot-page .preview-placeholder {
  color: #aaa;
  font-size: 14px;
  text-align: center;
}

.screenshot-page .preview-placeholder .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.screenshot-page .preview-image-wrapper {
  width: 100%;
  text-align: center;
}

.screenshot-page .preview-image-wrapper img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.screenshot-page .preview-info {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.screenshot-page .preview-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.screenshot-page .preview-actions button {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
}

.screenshot-page .preview-actions button:hover {
  border-color: #4fc3f7;
  color: #4fc3f7;
}

.screenshot-page .preview-actions .save-btn {
  background: #4fc3f7;
  color: #fff;
  border-color: #4fc3f7;
}

.screenshot-page .preview-actions .save-btn:hover {
  background: #29b6f6;
  border-color: #29b6f6;
  color: #fff;
}

.screenshot-page .source-selector {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.screenshot-page .source-selector h4 {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: #333;
}

.screenshot-page .source-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.screenshot-page .source-card {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: center;
  min-width: 180px;
}

.screenshot-page .source-card:hover {
  border-color: #4fc3f7;
}

.screenshot-page .source-card.selected {
  border-color: #4fc3f7;
  background: #e1f5fe;
}

.screenshot-page .source-card img {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 6px;
}

.screenshot-page .source-card .source-name {
  font-size: 12px;
  color: #555;
}

.screenshot-page .source-card .source-primary {
  font-size: 11px;
  color: #4fc3f7;
}

.screenshot-page .status-msg {
  font-size: 13px;
  color: #888;
  margin-left: 8px;
}
```

- [ ] **Step 2: 创建页面组件**

创建 `src/renderer/src/pages/system/ScreenshotPage.tsx`：

```tsx
import { useState, useEffect, useCallback } from 'react'
import '../toolbox/tools/ToolPage.css'
import { ElectronOnly } from '../../components/ElectronOnly'
import './ScreenshotPage.css'

interface ScreenSource {
  id: string
  name: string
  thumbnail: string
}

interface CaptureRegion {
  x: number
  y: number
  width: number
  height: number
}

export default function ScreenshotPage() {
  return (
    <ElectronOnly>
      <ScreenshotPageContent />
    </ElectronOnly>
  )
}

function ScreenshotPageContent() {
  const [activeTab, setActiveTab] = useState<'demo' | 'concept' | 'code'>('demo')
  const [sources, setSources] = useState<ScreenSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewDataURL, setPreviewDataURL] = useState<string>('')
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null)
  const [statusMsg, setStatusMsg] = useState('')

  // 监听框选结果
  useEffect(() => {
    const unsubRegion = window.api.screenshot.onRegionSelected(async (region: CaptureRegion) => {
      setIsCapturing(false)
      setStatusMsg('正在裁剪...')
      try {
        const dataURL = await window.api.screenshot.cropRegion({
          sourceId: selectedSourceId,
          ...region
        })
        if (dataURL) {
          setPreviewDataURL(dataURL)
          const img = new Image()
          img.onload = () => {
            setPreviewSize({ width: img.naturalWidth, height: img.naturalHeight })
          }
          img.src = dataURL
          setStatusMsg('')
        } else {
          setStatusMsg('裁剪失败')
        }
      } catch {
        setStatusMsg('裁剪失败')
      }
    })

    const unsubCancel = window.api.screenshot.onCaptureCancelled(() => {
      setIsCapturing(false)
      setStatusMsg('')
    })

    return () => {
      unsubRegion()
      unsubCancel()
    }
  }, [selectedSourceId])

  const handleGetSources = useCallback(async () => {
    try {
      const list = await window.api.screenshot.getSources()
      setSources(list)
      if (list.length === 1) {
        setSelectedSourceId(list[0].id)
      } else if (list.length > 1) {
        setSelectedSourceId('')
      }
    } catch {
      setStatusMsg('获取屏幕信息失败，请检查权限')
    }
  }, [])

  const handleStartCapture = useCallback(async () => {
    if (!selectedSourceId) return
    setIsCapturing(true)
    setStatusMsg('请在屏幕上框选截图区域...')
    setPreviewDataURL('')
    setPreviewSize(null)
    try {
      await window.api.screenshot.startCapture(selectedSourceId)
    } catch {
      setIsCapturing(false)
      setStatusMsg('截图失败')
    }
  }, [selectedSourceId])

  const handleSave = useCallback(async () => {
    if (!previewDataURL) return
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const result = await window.api.screenshot.save({
        dataURL: previewDataURL,
        defaultName: `screenshot-${timestamp}.png`
      })
      if (result.success) {
        setStatusMsg(`已保存至: ${result.path}`)
      } else if (result.error) {
        setStatusMsg(`保存失败: ${result.error}`)
      }
    } catch {
      setStatusMsg('保存失败')
    }
  }, [previewDataURL])

  const handleRecapture = useCallback(() => {
    setPreviewDataURL('')
    setPreviewSize(null)
    setStatusMsg('')
    handleStartCapture()
  }, [handleStartCapture])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>屏幕截图</h1>
        <p>Screenshot - 自由选取屏幕区域截图，支持多显示器与即时预览</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>屏幕截图</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <button className="capture-btn" onClick={handleGetSources} disabled={isCapturing}>
                  📷 截图
                </button>
                {isCapturing && <span className="status-msg">请在屏幕上框选区域...</span>}
                {statusMsg && !isCapturing && <span className="status-msg">{statusMsg}</span>}
              </div>

              {sources.length > 1 && !selectedSourceId && (
                <div className="source-selector">
                  <h4>选择截图显示器</h4>
                  <div className="source-list">
                    {sources.map((s) => (
                      <div key={s.id} className="source-card" onClick={() => setSelectedSourceId(s.id)}>
                        <img src={s.thumbnail} alt={s.name} />
                        <div className="source-name">{s.name}</div>
                        {s.name.includes('Primary') && <div className="source-primary">主显示器</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSourceId && sources.length > 1 && !previewDataURL && !isCapturing && (
                <div className="source-selector">
                  <h4>当前显示器</h4>
                  <div className="source-list">
                    {sources.map((s) => (
                      <div
                        key={s.id}
                        className={`source-card${s.id === selectedSourceId ? ' selected' : ''}`}
                        onClick={() => setSelectedSourceId(s.id)}
                      >
                        <img src={s.thumbnail} alt={s.name} />
                        <div className="source-name">{s.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="preview-area">
                {!previewDataURL && !isCapturing && (
                  <div className="preview-placeholder">
                    <div className="icon">🖥️</div>
                    <div>点击"截图"按钮，选择显示器后在屏幕上框选截图区域</div>
                  </div>
                )}
                {previewDataURL && (
                  <div className="preview-image-wrapper">
                    <img src={previewDataURL} alt="截图预览" />
                    {previewSize && (
                      <div className="preview-info">
                        <span>尺寸: {previewSize.width} x {previewSize.height}</span>
                      </div>
                    )}
                    <div className="preview-actions">
                      <button onClick={handleRecapture}>🔄 重新截图</button>
                      <button className="save-btn" onClick={handleSave}>💾 下载</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>区域截图</h3><p>自由选取屏幕任意区域进行截图</p></div>
              <div className="feature-card"><h3>多屏支持</h3><p>自动识别多显示器，可选择目标屏幕</p></div>
              <div className="feature-card"><h3>即时预览</h3><p>截图后立即预览，不满意可重新选取</p></div>
              <div className="feature-card"><h3>灵活保存</h3><p>支持 PNG/JPEG 格式，可选择保存位置</p></div>
            </div>
            <h2>技术架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  desktopCapturer.getSources()
          |
          v
  透明覆盖窗口 (用户拖拽框选)
          |
          v
  NativeImage.crop() (裁剪指定区域)
          |
          v
  预览 / dialog.showSaveDialog() (保存文件)
              `}</pre>
            </div>
            <h2>关键 API</h2>
            <div className="info-box">
              <strong>Electron 截图相关 API</strong>
              <ul>
                <li><strong>desktopCapturer</strong> — 获取屏幕和窗口的截图</li>
                <li><strong>NativeImage</strong> — 原生图像对象，支持 crop() 裁剪</li>
                <li><strong>BrowserWindow</strong> — 创建无边框透明窗口实现覆盖层</li>
                <li><strong>dialog.showSaveDialog()</strong> — 系统原生保存对话框</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>获取屏幕截图源</h2>
            <div className="code-block">
              <pre>{`const { desktopCapturer } = require('electron')

const sources = await desktopCapturer.getSources({
  types: ['screen'],
  thumbnailSize: { width: 1920, height: 1080 }
})

sources.forEach(source => {
  console.log(source.id, source.name)
  const dataURL = source.thumbnail.toDataURL()
})`}</pre>
            </div>
            <h2>裁剪图片区域</h2>
            <div className="code-block">
              <pre>{`const { nativeImage } = require('electron')

const image = nativeImage.createFromDataURL(dataURL)
const cropped = image.crop({ x: 100, y: 100, width: 800, height: 600 })

const pngBuffer = cropped.toPNG()
const jpegBuffer = cropped.toJPEG(90)`}</pre>
            </div>
            <h2>保存文件对话框</h2>
            <div className="code-block">
              <pre>{`const { dialog, fs } = require('electron')

const result = await dialog.showSaveDialog({
  defaultPath: 'screenshot.png',
  filters: [
    { name: 'PNG', extensions: ['png'] },
    { name: 'JPEG', extensions: ['jpg'] }
  ]
})

if (!result.canceled && result.filePath) {
  fs.writeFileSync(result.filePath, imageBuffer)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 验证编译通过**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无新增错误

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/pages/system/ScreenshotPage.tsx src/renderer/src/pages/system/ScreenshotPage.css
git commit -m "feat: add ScreenshotPage component with preview and save"
```

---

### Task 4: 路由、侧边栏与首页入口

**Files:**
- Modify: `src/renderer/src/App.tsx:186-192,218-224`
- Modify: `src/renderer/src/components/Layout.tsx:298-310`
- Modify: `src/renderer/src/pages/HomePage.tsx:49-59`

- [ ] **Step 1: 添加路由**

修改 `src/renderer/src/App.tsx`：

在 P2 import 区域（第 186-192 行），在 `MediaPage` import 后添加：
```typescript
import ScreenshotPage from './pages/system/ScreenshotPage'
```

在 Routes 中 P2 路由区域（第 218-224 行），在 `<Route path="media" .../>` 行后添加：
```tsx
          <Route path="screenshot" element={<ScreenshotPage />} />
```

- [ ] **Step 2: 添加侧边栏菜单入口**

修改 `src/renderer/src/components/Layout.tsx`：

在 p2 navGroup 的 items 数组（第 301-308 行）中，在 `{ to: '/media', icon: '🎙️', label: '音视频/外设' }` 行后添加：
```typescript
      { to: '/screenshot', icon: '📷', label: '屏幕截图' }
```

- [ ] **Step 3: 添加首页卡片入口**

修改 `src/renderer/src/pages/HomePage.tsx`：

在 P2 组的 items 数组（第 51-58 行）中，在 `{ to: '/media', ... }` 行后添加：
```typescript
      { to: '/screenshot', label: '屏幕截图', desc: '区域截图、多屏支持与即时预览' }
```

- [ ] **Step 4: 验证编译通过**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无新增错误

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/App.tsx src/renderer/src/components/Layout.tsx src/renderer/src/pages/HomePage.tsx
git commit -m "feat: add screenshot page route, sidebar entry, and home card"
```

---

### Task 5: 端到端验证

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

- [ ] **Step 2: 验证侧边栏入口**

在应用左侧菜单"系统与终端能力"下应能看到"📷 屏幕截图"菜单项，点击应跳转到截图页面。

- [ ] **Step 3: 验证截图流程**

1. 点击"📷 截图"按钮
2. 如果有多显示器，选择一个
3. 屏幕上应出现透明覆盖窗口，鼠标变为十字光标
4. 拖拽框选区域，松开鼠标确认
5. 页面应显示裁剪后的预览图
6. 点击"🔄 重新截图"可重新选取
7. 点击"💾 下载"应弹出系统保存对话框
8. 选择位置保存后，页面应显示保存路径

- [ ] **Step 4: 验证取消操作**

1. 点击"📷 截图"
2. 在覆盖窗口按 Esc 键
3. 应返回截图页面，无预览图

- [ ] **Step 5: 验证概念详解和代码示例 Tab**

1. 切换到"概念详解"Tab，确认内容正常显示
2. 切换到"代码示例"Tab，确认代码示例正常显示