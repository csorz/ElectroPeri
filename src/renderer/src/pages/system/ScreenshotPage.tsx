import { useState, useEffect } from 'react'
import '../toolbox/tools/ToolPage.css'
import './ScreenshotPage.css'
import { ElectronOnly } from '../../components/ElectronOnly'

interface SourceInfo {
  id: string
  name: string
  thumbnail: string
}

export default function ScreenshotPage() {
  return (
    <ElectronOnly>
      <ScreenshotPageContent />
    </ElectronOnly>
  )
}

function ScreenshotPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [sources, setSources] = useState<SourceInfo[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewDataURL, setPreviewDataURL] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [showSourceSelector, setShowSourceSelector] = useState(false)

  useEffect(() => {
    const unsub1 = window.api.screenshot.onRegionSelected((region) => {
      setIsCapturing(false)
      if (selectedSourceId) {
        window.api.screenshot
          .cropRegion({ sourceId: selectedSourceId, ...region })
          .then((dataURL) => {
            if (dataURL) {
              setPreviewDataURL(dataURL)
              const img = new Image()
              img.onload = () => setPreviewSize({ width: img.naturalWidth, height: img.naturalHeight })
              img.src = dataURL
              setStatusMsg(null)
            }
          })
          .catch(() => setStatusMsg('裁剪失败'))
      }
    })
    const unsub2 = window.api.screenshot.onCaptureCancelled(() => {
      setIsCapturing(false)
      setStatusMsg('截图已取消')
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [selectedSourceId])

  const handleStartCapture = async () => {
    setStatusMsg(null)
    try {
      const list = await window.api.screenshot.getSources()
      setSources(list)
      if (list.length === 0) {
        setStatusMsg('未检测到可用显示器')
        return
      }
      if (list.length === 1) {
        setSelectedSourceId(list[0].id)
        setIsCapturing(true)
        await window.api.screenshot.startCapture(list[0].id)
      } else {
        setShowSourceSelector(true)
      }
    } catch {
      setStatusMsg('屏幕录制权限未授权，请在系统设置中开启')
    }
  }

  const handleSelectSource = async (sourceId: string) => {
    setShowSourceSelector(false)
    setSelectedSourceId(sourceId)
    setIsCapturing(true)
    await window.api.screenshot.startCapture(sourceId)
  }

  const handleSave = async () => {
    if (!previewDataURL) return
    const result = await window.api.screenshot.save({
      dataURL: previewDataURL,
      defaultName: `screenshot_${Date.now()}.png`
    })
    if (result.success) {
      setStatusMsg(`已保存: ${result.path}`)
    } else if (result.error) {
      setStatusMsg(`保存失败: ${result.error}`)
    }
  }

  const handleRecapture = () => {
    setPreviewDataURL(null)
    setPreviewSize(null)
    setStatusMsg(null)
    handleStartCapture()
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>屏幕截图</h1>
        <p>Screenshot - 区域截图、多屏支持与即时预览</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>区域截图</h3><p>通过透明覆盖窗口自由拖拽框选屏幕区域</p></div>
              <div className="feature-card"><h3>多屏支持</h3><p>自动检测多显示器，支持选择目标屏幕截图</p></div>
              <div className="feature-card"><h3>即时预览</h3><p>截图后立即预览，不满意可重新选取</p></div>
              <div className="feature-card"><h3>灵活保存</h3><p>系统原生保存对话框，支持 PNG/JPEG 格式</p></div>
            </div>
            <h2>技术架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  desktopCapturer          NativeImage           覆盖窗口
       │                      │                    │
       ▼                      │                    │
  getSources() ──────► 缩略图展示 ──────► 用户选择显示器
       │                      │                    │
       ▼                      ▼                    ▼
  高分辨率截图 ──► 加载到覆盖窗口 ──► 拖拽框选区域
                            │                    │
                            ▼                    │
                       crop() 裁剪 ◄─────────────┘
                            │
                            ▼
                      渲染进程预览 ──► 保存/重新截图
              `}</pre>
            </div>
            <h2>Electron 截图 API</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>desktopCapturer</h4><p>Electron 主进程 API，获取屏幕和窗口的截图源</p></div>
              <div className="scenario-card"><h4>NativeImage</h4><p>Electron 原生图像对象，支持裁剪、缩放、格式转换</p></div>
              <div className="scenario-card"><h4>BrowserWindow</h4><p>创建无边框透明覆盖窗口实现区域选择交互</p></div>
              <div className="scenario-card"><h4>dialog</h4><p>系统原生对话框，让用户选择保存位置和格式</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>区域截图</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <button onClick={handleStartCapture} disabled={isCapturing}>
                  {isCapturing ? '截图中...' : '📷 截图'}
                </button>
              </div>

              {statusMsg && (
                <div className="step-info" style={{ background: statusMsg.includes('失败') || statusMsg.includes('取消') || statusMsg.includes('未授权') ? '#ffebee' : '#e8f5e9', borderColor: statusMsg.includes('失败') || statusMsg.includes('取消') || statusMsg.includes('未授权') ? '#ef5350' : '#4caf50' }}>
                  <p style={{ color: statusMsg.includes('失败') || statusMsg.includes('取消') || statusMsg.includes('未授权') ? '#c62828' : '#2e7d32' }}>{statusMsg}</p>
                </div>
              )}

              {showSourceSelector && (
                <div className="source-selector">
                  <h3>选择截图显示器</h3>
                  <div className="source-cards">
                    {sources.map((s) => (
                      <div key={s.id} className="source-card" onClick={() => handleSelectSource(s.id)}>
                        <img src={s.thumbnail} alt={s.name} />
                        <span className="source-name">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!previewDataURL && !isCapturing && !showSourceSelector && (
                <div className="step-info">
                  <p>点击"截图"按钮，选择显示器后在屏幕上拖拽框选截图区域</p>
                </div>
              )}

              {isCapturing && (
                <div className="step-info">
                  <p>请在屏幕上拖拽框选截图区域，按 Esc 取消</p>
                </div>
              )}

              {previewDataURL && (
                <div className="preview-area">
                  <div className="preview-image-wrapper">
                    <img src={previewDataURL} alt="截图预览" />
                  </div>
                  <div className="preview-info">
                    {previewSize && <span>尺寸: {previewSize.width} x {previewSize.height}</span>}
                    <span>大小: {Math.round((previewDataURL.length * 3) / 4 / 1024)}KB</span>
                  </div>
                  <div className="preview-actions">
                    <button onClick={handleRecapture}>🔄 重新截图</button>
                    <button onClick={handleSave} className="primary">💾 下载</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Electron desktopCapturer 示例</h2>
            <div className="code-block">
              <pre>{`// 主进程：获取屏幕截图源
const { desktopCapturer } = require('electron')

async function captureScreen() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 }
  })
  sources.forEach(s => {
    console.log(s.id, s.name, s.thumbnail.getSize())
  })
  return sources
}

// 主进程：裁剪区域
const { nativeImage } = require('electron')

function cropRegion(source, x, y, w, h) {
  const img = nativeImage.createFromDataURL(
    source.thumbnail.toDataURL()
  )
  return img.crop({ x, y, width: w, height: h })
}

// 主进程：保存文件
const { dialog } = require('electron')
const fs = require('fs')

async function saveScreenshot(mainWindow, dataURL) {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'screenshot.png',
    filters: [
      { name: 'PNG', extensions: ['png'] },
      { name: 'JPEG', extensions: ['jpg'] }
    ]
  })
  if (!result.canceled && result.filePath) {
    const img = nativeImage.createFromDataURL(dataURL)
    const buf = result.filePath.endsWith('.jpg')
      ? img.toJPEG(90) : img.toPNG()
    fs.writeFileSync(result.filePath, buf)
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
