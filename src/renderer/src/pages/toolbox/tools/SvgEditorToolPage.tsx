import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function SvgEditorToolPage() {
  const [svgCode, setSvgCode] = useState(`<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#4A90D9" stroke="#2E5B8B" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="24" font-family="Arial">SVG</text>
</svg>`)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFormat = () => {
    try {
      setError(null)
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgCode, 'image/svg+xml')
      const errorNode = doc.querySelector('parsererror')
      if (errorNode) {
        setError('SVG 格式错误，请检查代码')
        return
      }
      const serializer = new XMLSerializer()
      const formatted = serializer.serializeToString(doc.documentElement)
      setSvgCode(formatted)
    } catch (e) {
      setError('格式化失败')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleMinify = () => {
    try {
      setError(null)
      const minified = svgCode
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\s*([{};:,>])\s*/g, '$1')
        .trim()
      setSvgCode(minified)
    } catch (e) {
      setError('压缩失败')
    }
  }

  const presets = [
    {
      name: '圆形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#4A90D9"/>
</svg>`
    },
    {
      name: '矩形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="#E74C3C" rx="10"/>
</svg>`
    },
    {
      name: '三角形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,10 90,90 10,90" fill="#2ECC71"/>
</svg>`
    },
    {
      name: '星形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#F1C40F"/>
</svg>`
    }
  ]

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/ocr" className="toolbox-back">
        ← 返回 OCR 与识别
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎨</span>
          <h1>SVG 编辑器</h1>
        </div>
        <p className="page-sub">编辑、预览和导出 SVG 图像</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">预设形状</div>
          <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="btn btn-secondary"
                onClick={() => setSvgCode(preset.code)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">SVG 代码</div>
          <textarea
            className="tool-textarea mono"
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            placeholder="输入 SVG 代码..."
            rows={10}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleFormat}>
            格式化
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleMinify}>
            压缩
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onCopy(svgCode)}>
            复制代码
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDownload}>
            下载 SVG
          </button>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">预览</div>
          <div
            className="tool-result"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '150px',
              backgroundColor: '#f5f5f5'
            }}
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </div>

        <div className="tool-block">
          <div className="tool-block-title">SVG 常用元素</div>
          <div className="tool-result">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>元素</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;rect&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>矩形</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;circle&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>圆形</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;ellipse&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>椭圆</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;line&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>直线</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;path&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>路径（最灵活）</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;text&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>文本</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>&lt;polygon&gt;</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>多边形</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
