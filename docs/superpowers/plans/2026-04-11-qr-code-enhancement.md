# QR Code Tool Enhancement Implementation Plan / 二维码工具增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance QR Code tool with instant generation, decoding, creative styles, and batch generation.

**Architecture:** Single-page React component with tabs for Generate/Decode/Batch modes. Custom Canvas rendering for creative styles. Uses jsqr for decoding, jszip for batch downloads.

**Tech Stack:** React, TypeScript, qrcode, jsqr, jszip, file-saver

---

## File Structure / 文件结构

| File | Purpose |
|------|---------|
| `src/renderer/src/pages/toolbox/tools/QrCodeToolPage.tsx` | Main component (rewrite) |
| `src/renderer/src/utils/qrStyles.ts` | Creative style rendering functions |
| `package.json` | Add dependencies |

---

## Task 1: Install Dependencies / 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install jsqr, jszip, file-saver**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
pnpm add jsqr jszip file-saver
pnpm add -D @types/file-saver
```

- [ ] **Step 2: Verify installation**

```bash
grep -E "jsqr|jszip|file-saver" package.json
```

Expected: All three packages listed in dependencies

---

## Task 2: Create QR Style Renderer Utility / 创建二维码样式渲染工具

**Files:**
- Create: `src/renderer/src/utils/qrStyles.ts`

- [ ] **Step 1: Create the style renderer module**

```typescript
// src/renderer/src/utils/qrStyles.ts
import QRCode from 'qrcode'

export type QrStyle = 'standard' | 'rounded' | 'dots' | 'gradient' | 'logo' | 'liquid' | 'mini' | 'random' | 'frame'

export interface QrStyleOptions {
  style: QrStyle
  size: number
  fgColor: string
  bgColor: string
  gradientStart?: string
  gradientEnd?: string
  logoImage?: HTMLImageElement
  logoSize?: number
  frameColor?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
}

interface QRModule {
  x: number
  y: number
  size: number
  isDark: boolean
  isFinder: boolean
}

// Get QR code module matrix
async function getQRMatrix(text: string, errorCorrection: 'L' | 'M' | 'Q' | 'H'): Promise<QRModule[][]> {
  const qr = QRCode.create(text, { errorCorrectionLevel: errorCorrection })
  const modules: QRModule[][] = []
  const size = qr.modules.size
  
  for (let row = 0; row < size; row++) {
    modules[row] = []
    for (let col = 0; col < size; col++) {
      const isDark = qr.modules.get(row, col)
      // Check if it's a finder pattern (corners)
      const isFinder = (row < 7 && col < 7) || 
                       (row < 7 && col >= size - 7) || 
                       (row >= size - 7 && col < 7)
      modules[row][col] = { x: col, y: row, size: 1, isDark, isFinder }
    }
  }
  
  return modules
}

// Draw standard QR
function drawStandard(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        ctx.fillRect(m.x * moduleSize, m.y * moduleSize, moduleSize, moduleSize)
      }
    })
  })
}

// Draw rounded QR
function drawRounded(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  const radius = moduleSize * 0.4
  
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        const x = m.x * moduleSize
        const y = m.y * moduleSize
        ctx.beginPath()
        ctx.roundRect(x, y, moduleSize, moduleSize, radius)
        ctx.fill()
      }
    })
  })
}

// Draw dots QR
function drawDots(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  const radius = moduleSize * 0.4
  
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        const cx = m.x * moduleSize + moduleSize / 2
        const cy = m.y * moduleSize + moduleSize / 2
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  })
}

// Draw gradient QR
function drawGradient(
  ctx: CanvasRenderingContext2D, 
  modules: QRModule[][], 
  moduleSize: number, 
  startColor: string, 
  endColor: string
) {
  const size = modules.length * moduleSize
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, startColor)
  gradient.addColorStop(1, endColor)
  
  ctx.fillStyle = gradient
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        ctx.fillRect(m.x * moduleSize, m.y * moduleSize, moduleSize, moduleSize)
      }
    })
  })
}

// Draw liquid QR (organic blob shapes)
function drawLiquid(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  
  modules.forEach((row, y) => {
    row.forEach((m, x) => {
      if (m.isDark) {
        const cx = x * moduleSize + moduleSize / 2
        const cy = y * moduleSize + moduleSize / 2
        const r = moduleSize * 0.45
        
        ctx.beginPath()
        // Create organic blob using bezier curves
        const points = 6
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2
          const variance = 0.1 + Math.random() * 0.1
          const px = cx + Math.cos(angle) * r * (1 + variance)
          const py = cy + Math.sin(angle) * r * (1 + variance)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
      }
    })
  })
}

// Draw mini squares QR
function drawMini(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  const innerSize = moduleSize * 0.4
  const innerOffset = (moduleSize - innerSize) / 2
  
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        const x = m.x * moduleSize
        const y = m.y * moduleSize
        // Outer square
        ctx.fillRect(x, y, moduleSize, moduleSize)
        // Inner square (background color will be drawn separately)
      }
    })
  })
}

// Draw random mix QR
function drawRandom(ctx: CanvasRenderingContext2D, modules: QRModule[][], moduleSize: number, fgColor: string) {
  ctx.fillStyle = fgColor
  const radius = moduleSize * 0.4
  
  modules.forEach(row => {
    row.forEach(m => {
      if (m.isDark) {
        const x = m.x * moduleSize
        const y = m.y * moduleSize
        if (Math.random() > 0.5) {
          // Square
          ctx.fillRect(x, y, moduleSize, moduleSize)
        } else {
          // Circle
          ctx.beginPath()
          ctx.arc(x + moduleSize / 2, y + moduleSize / 2, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })
  })
}

// Draw frame around QR
function drawFrame(ctx: CanvasRenderingContext2D, totalSize: number, frameColor: string, padding: number) {
  ctx.strokeStyle = frameColor
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(padding, padding, totalSize - padding * 2, totalSize - padding * 2, 12)
  ctx.stroke()
}

// Main render function
export async function renderQRCode(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrStyleOptions
): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas context')

  const { style, size, fgColor, bgColor, gradientStart, gradientEnd, logoImage, logoSize, frameColor, errorCorrection = 'M' } = options
  
  // Get QR matrix
  const modules = await getQRMatrix(text, errorCorrection)
  const moduleCount = modules.length
  const moduleSize = size / moduleCount
  
  // Set canvas size
  canvas.width = size
  canvas.height = size
  
  // Draw background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)
  
  // Draw QR based on style
  switch (style) {
    case 'standard':
      drawStandard(ctx, modules, moduleSize, fgColor)
      break
    case 'rounded':
      drawRounded(ctx, modules, moduleSize, fgColor)
      break
    case 'dots':
      drawDots(ctx, modules, moduleSize, fgColor)
      break
    case 'gradient':
      drawGradient(ctx, modules, moduleSize, gradientStart || fgColor, gradientEnd || fgColor)
      break
    case 'liquid':
      drawLiquid(ctx, modules, moduleSize, fgColor)
      break
    case 'mini':
      drawMini(ctx, modules, moduleSize, fgColor)
      // Redraw inner squares with background color
      ctx.fillStyle = bgColor
      const innerSize = moduleSize * 0.4
      const innerOffset = (moduleSize - innerSize) / 2
      modules.forEach(row => {
        row.forEach(m => {
          if (m.isDark) {
            ctx.fillRect(
              m.x * moduleSize + innerOffset,
              m.y * moduleSize + innerOffset,
              innerSize,
              innerSize
            )
          }
        })
      })
      break
    case 'random':
      drawRandom(ctx, modules, moduleSize, fgColor)
      break
    case 'logo':
      drawStandard(ctx, modules, moduleSize, fgColor)
      // Draw logo in center
      if (logoImage) {
        const logoW = logoSize || size * 0.2
        const logoH = logoSize || size * 0.2
        const logoX = (size - logoW) / 2
        const logoY = (size - logoH) / 2
        
        // Draw white background for logo
        ctx.fillStyle = bgColor
        ctx.fillRect(logoX - 4, logoY - 4, logoW + 8, logoH + 8)
        
        // Draw logo
        ctx.drawImage(logoImage, logoX, logoY, logoW, logoH)
      }
      break
    case 'frame':
      drawStandard(ctx, modules, moduleSize, fgColor)
      drawFrame(ctx, size, frameColor || fgColor, 8)
      break
  }
}

// Style display names
export const QR_STYLE_NAMES: Record<QrStyle, string> = {
  standard: '标准 Standard',
  rounded: '圆角 Rounded',
  dots: '圆点 Dots',
  gradient: '渐变 Gradient',
  logo: '中心Logo',
  liquid: '液态 Liquid',
  mini: '迷你 Mini',
  random: '随机 Random',
  frame: '边框 Frame'
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
npx tsc --noEmit src/renderer/src/utils/qrStyles.ts 2>&1 | head -20
```

Expected: No errors or only module resolution errors

---

## Task 3: Create Main QR Code Component / 创建主二维码组件

**Files:**
- Modify: `src/renderer/src/pages/toolbox/tools/QrCodeToolPage.tsx`

- [ ] **Step 1: Rewrite the component with tabs and instant generation**

```typescript
// src/renderer/src/pages/toolbox/tools/QrCodeToolPage.tsx
import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { copyToClipboard } from '../clipboard'
import { renderQRCode, QR_STYLE_NAMES, type QrStyle } from '../../../utils/qrStyles'
import '../toolbox.css'

type TabType = 'generate' | 'decode' | 'batch'

export default function QrCodeToolPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('generate')
  
  // Generate tab state
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [gradientStart, setGradientStart] = useState('#667eea')
  const [gradientEnd, setGradientEnd] = useState('#764ba2')
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [style, setStyle] = useState<QrStyle>('standard')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Decode tab state
  const [decodeImage, setDecodeImage] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [decoding, setDecoding] = useState(false)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const decodeInputRef = useRef<HTMLInputElement>(null)

  // Batch tab state
  const [batchText, setBatchText] = useState('')
  const [batchResults, setBatchResults] = useState<Array<{ text: string; url: string }>>([])
  const [batchGenerating, setBatchGenerating] = useState(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // Instant generation with debounce
  useEffect(() => {
    if (activeTab !== 'generate') return
    if (!text.trim()) {
      setResultUrl(null)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      generateQRCode()
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [text, size, fgColor, bgColor, style, errorCorrection, gradientStart, gradientEnd, logoImage, activeTab])

  // Load logo image
  useEffect(() => {
    if (!logoFile) {
      setLogoImage(null)
      return
    }

    const img = new Image()
    img.onload = () => setLogoImage(img)
    img.src = URL.createObjectURL(logoFile)
  }, [logoFile])

  const generateQRCode = async () => {
    if (!text.trim() || !canvasRef.current) return

    setGenerating(true)
    try {
      await renderQRCode(canvasRef.current, text, {
        style,
        size,
        fgColor,
        bgColor,
        gradientStart,
        gradientEnd,
        logoImage: style === 'logo' ? logoImage || undefined : undefined,
        logoSize: size * 0.2,
        frameColor: fgColor,
        errorCorrection: style === 'logo' ? 'H' : errorCorrection
      })

      const url = canvasRef.current.toDataURL('image/png')
      setResultUrl(url)
    } catch (err) {
      console.error('QR generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = `qrcode-${Date.now()}.png`
      a.click()
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
    }
  }

  // Decode functions
  const handleDecodeImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setDecodeImage(ev.target?.result as string)
        setDecodedText(null)
        setDecodeError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDecode = async () => {
    if (!decodeImage || !decodeCanvasRef.current) return

    setDecoding(true)
    setDecodeError(null)
    setDecodedText(null)

    try {
      const img = new Image()
      img.src = decodeImage
      await new Promise((resolve) => { img.onload = resolve })

      const canvas = decodeCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Cannot get canvas context')

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        setDecodedText(code.data)
      } else {
        setDecodeError('未找到二维码 / No QR code found')
      }
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : '解码失败 / Decode failed')
    } finally {
      setDecoding(false)
    }
  }

  // Batch functions
  const handleBatchGenerate = async () => {
    const lines = batchText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return

    setBatchGenerating(true)
    setBatchResults([])

    try {
      const results: Array<{ text: string; url: string }> = []
      const tempCanvas = document.createElement('canvas')

      for (const line of lines) {
        await renderQRCode(tempCanvas, line.trim(), {
          style: 'standard',
          size: 200,
          fgColor,
          bgColor,
          errorCorrection: 'M'
        })
        results.push({
          text: line.trim(),
          url: tempCanvas.toDataURL('image/png')
        })
      }

      setBatchResults(results)
    } catch (err) {
      console.error('Batch generation error:', err)
    } finally {
      setBatchGenerating(false)
    }
  }

  const handleBatchDownload = async () => {
    if (batchResults.length === 0) return

    const zip = new JSZip()
    
    for (let i = 0; i < batchResults.length; i++) {
      const { text, url } = batchResults[i]
      const base64 = url.split(',')[1]
      const filename = `qrcode-${i + 1}-${text.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`
      zip.file(filename, base64, { base64: true })
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `qrcodes-${Date.now()}.zip`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setDecodeImage(ev.target?.result as string)
        setDecodedText(null)
        setDecodeError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📱</span>
          <h1>二维码工具 QR Code</h1>
        </div>
        <p className="page-sub">生成、解析、批量处理二维码</p>
      </div>

      {/* Tabs */}
      <div className="tool-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('generate')}
        >
          生成 Generate
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('decode')}
        >
          解码 Decode
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'batch' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('batch')}
        >
          批量 Batch
        </button>
      </div>

      <section className="tool-card">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">输入内容 / Input</div>
              <textarea
                className="tool-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要生成二维码的文本或链接...&#10;Enter text or URL to generate QR code..."
                rows={4}
              />
              {generating && <div style={{ color: '#888', marginTop: 8 }}>生成中... Generating...</div>}
            </div>

            <div className="tool-block">
              <div className="tool-block-title">样式设置 / Style Settings</div>
              
              <div className="tool-row">
                <label className="tool-label">
                  样式 Style
                  <select value={style} onChange={(e) => setStyle(e.target.value as QrStyle)}>
                    {Object.entries(QR_STYLE_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="tool-inline">
                <label className="tool-label">
                  尺寸 Size
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value) || 256)}
                    min="100"
                    max="800"
                    style={{ width: '80px' }}
                  />
                </label>

                <label className="tool-label">
                  前景色 FG
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: '50px', height: '32px' }}
                  />
                </label>

                <label className="tool-label">
                  背景色 BG
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '50px', height: '32px' }}
                  />
                </label>
              </div>

              {style === 'gradient' && (
                <div className="tool-inline">
                  <label className="tool-label">
                    起始色 Start
                    <input
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      style={{ width: '50px', height: '32px' }}
                    />
                  </label>
                  <label className="tool-label">
                    结束色 End
                    <input
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      style={{ width: '50px', height: '32px' }}
                    />
                  </label>
                </div>
              )}

              {style === 'logo' && (
                <div className="tool-row">
                  <label className="tool-label">
                    Logo 图片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      style={{ marginTop: 4 }}
                    />
                  </label>
                </div>
              )}

              <div className="tool-row">
                <label className="tool-label">
                  纠错级别 Error Correction
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  >
                    <option value="L">L - 7%</option>
                    <option value="M">M - 15%</option>
                    <option value="Q">Q - 25%</option>
                    <option value="H">H - 30%</option>
                  </select>
                </label>
              </div>
            </div>

            {resultUrl && (
              <div className="tool-block">
                <div className="tool-block-title">预览 / Preview</div>
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={resultUrl}
                    alt="QR Code"
                    style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #eee' }}
                  />
                </div>
                <div className="tool-actions">
                  <button type="button" className="btn btn-primary" onClick={handleDownload}>
                    下载 Download
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(resultUrl)}>
                    复制 Data URL
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        )}

        {/* Decode Tab */}
        {activeTab === 'decode' && (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">上传图片 / Upload Image</div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => decodeInputRef.current?.click()}
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: 8,
                  padding: 40,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#fafafa'
                }}
              >
                {decodeImage ? (
                  <img src={decodeImage} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: 300 }} />
                ) : (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
                    <div>拖放图片或点击上传</div>
                    <div style={{ color: '#888', fontSize: 12 }}>Drop image or click to upload</div>
                  </div>
                )}
              </div>
              <input
                ref={decodeInputRef}
                type="file"
                accept="image/*"
                onChange={handleDecodeImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div className="tool-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDecode}
                disabled={!decodeImage || decoding}
              >
                {decoding ? '解码中... Decoding...' : '解码 Decode'}
              </button>
            </div>

            {decodeError && (
              <div className="error-message">
                <span>❌ {decodeError}</span>
              </div>
            )}

            {decodedText && (
              <div className="tool-block">
                <div className="tool-block-title">解码结果 / Result</div>
                <div className="tool-result">
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{decodedText}</pre>
                </div>
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(decodedText)}>
                    复制 Copy
                  </button>
                </div>
              </div>
            )}

            <canvas ref={decodeCanvasRef} style={{ display: 'none' }} />
          </>
        )}

        {/* Batch Tab */}
        {activeTab === 'batch' && (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">批量输入 / Batch Input</div>
              <textarea
                className="tool-textarea"
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="每行一个内容，批量生成二维码&#10;One item per line to generate QR codes"
                rows={8}
              />
            </div>

            <div className="tool-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBatchGenerate}
                disabled={!batchText.trim() || batchGenerating}
              >
                {batchGenerating ? '生成中... Generating...' : '生成全部 Generate All'}
              </button>
            </div>

            {batchResults.length > 0 && (
              <div className="tool-block">
                <div className="tool-block-title">
                  预览 / Preview ({batchResults.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                  {batchResults.map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <img src={item.url} alt={`QR ${i + 1}`} style={{ width: 100, height: 100 }} />
                      <div style={{ fontSize: 10, color: '#666', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tool-actions">
                  <button type="button" className="btn btn-primary" onClick={handleBatchDownload}>
                    下载ZIP Download ZIP
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
npx tsc --noEmit -p tsconfig.web.json 2>&1 | head -30
```

Expected: No errors

---

## Task 4: Build and Test / 构建和测试

**Files:**
- None (verification only)

- [ ] **Step 1: Run the build**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
pnpm run build
```

Expected: Build succeeds

- [ ] **Step 2: Test in dev mode**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
pnpm run dev
```

Manual test:
1. Navigate to QR Code tool
2. Test instant generation by typing text
3. Switch between all 8 styles
4. Test decode tab with a QR image
5. Test batch tab with multiple lines
6. Verify ZIP download works

---

## Task 5: Commit Changes / 提交变更

**Files:**
- All modified files

- [ ] **Step 1: Stage and commit**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
git add package.json pnpm-lock.yaml src/renderer/src/pages/toolbox/tools/QrCodeToolPage.tsx src/renderer/src/utils/qrStyles.ts
git commit -m "feat(qrcode): add instant generation, decode, creative styles, batch mode

- Add instant generation with debounce
- Add QR code decode from image (jsqr)
- Add 8 creative styles: rounded, dots, gradient, logo, liquid, mini, random, frame
- Add batch generation with ZIP download
- Add tabs UI for Generate/Decode/Batch modes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Expected: Commit succeeds
