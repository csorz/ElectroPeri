import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

interface MetaInfo {
  title: string
  description: string
  keywords: string
  author: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  twitterCard: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical: string
  robots: string
  viewport: string
  charset: string
  language: string
  favicon: string
  h1: string[]
  h2: string[]
  images: { alt: string; src: string }[]
  links: { text: string; href: string }[]
}

interface CheckResult {
  success: boolean
  url?: string
  meta?: MetaInfo
  statusCode?: number
  error?: string
}

export default function MetaCheckerToolPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)

  const handleCheck = async () => {
    if (!url.trim()) {
      setError('请输入网址')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await window.api.meta.check(url.trim())
      if (res.success) {
        setResult(res)
      } else {
        setError(res.error || '检测失败')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '检测失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/seo" className="toolbox-back">
        ← 返回 SEO 与站长工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🏷️</span>
          <h1>Meta 检测</h1>
        </div>
        <p className="page-sub">检测网页的 Meta 标签信息，优化 SEO</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入网址</div>
          <input
            type="text"
            className="tool-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入要检测的网址，如：https://example.com"
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleCheck} disabled={loading}>
              {loading ? '检测中...' : '检测'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {result && result.meta && (
          <>
            <div className="tool-block">
              <div className="tool-block-title">基本信息</div>
              <div className="tool-result">
                <div><strong>URL:</strong> {result.url}</div>
                <div><strong>状态码:</strong> {result.statusCode}</div>
                <div><strong>语言:</strong> {result.meta.language || '未设置'}</div>
                <div><strong>字符集:</strong> {result.meta.charset || '未检测'}</div>
              </div>
            </div>

            <div className="tool-block">
              <div className="tool-block-title">页面标题</div>
              <div className="tool-result">
                <div style={{ fontSize: 18, fontWeight: 600 }}>{result.meta.title || '未设置'}</div>
                {result.meta.title && (
                  <div style={{ color: result.meta.title.length > 60 ? '#f44336' : '#4caf50', marginTop: 4 }}>
                    {result.meta.title.length} 字符 {result.meta.title.length > 60 && '(建议不超过60字符)'}
                  </div>
                )}
              </div>
            </div>

            <div className="tool-block">
              <div className="tool-block-title">Meta 描述</div>
              <div className="tool-result">
                <div>{result.meta.description || '未设置'}</div>
                {result.meta.description && (
                  <div style={{ color: result.meta.description.length > 160 ? '#f44336' : '#4caf50', marginTop: 4 }}>
                    {result.meta.description.length} 字符 {result.meta.description.length > 160 && '(建议不超过160字符)'}
                  </div>
                )}
              </div>
            </div>

            {result.meta.keywords && (
              <div className="tool-block">
                <div className="tool-block-title">关键词</div>
                <div className="tool-result">{result.meta.keywords}</div>
              </div>
            )}

            {(result.meta.ogTitle || result.meta.ogDescription || result.meta.ogImage) && (
              <div className="tool-block">
                <div className="tool-block-title">Open Graph</div>
                <div className="tool-result">
                  {result.meta.ogTitle && <div><strong>og:title:</strong> {result.meta.ogTitle}</div>}
                  {result.meta.ogDescription && <div><strong>og:description:</strong> {result.meta.ogDescription}</div>}
                  {result.meta.ogImage && <div><strong>og:image:</strong> {result.meta.ogImage}</div>}
                  {result.meta.ogType && <div><strong>og:type:</strong> {result.meta.ogType}</div>}
                </div>
              </div>
            )}

            {result.meta.h1 && result.meta.h1.length > 0 && (
              <div className="tool-block">
                <div className="tool-block-title">H1 标题 ({result.meta.h1.length})</div>
                <div className="tool-result">
                  {result.meta.h1.map((h, i) => (
                    <div key={i}>{h}</div>
                  ))}
                </div>
              </div>
            )}

            {result.meta.images && result.meta.images.length > 0 && (
              <div className="tool-block">
                <div className="tool-block-title">图片 ({result.meta.images.length})</div>
                <div className="tool-result">
                  {result.meta.images.slice(0, 10).map((img, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {img.alt ? `✅ ${img.alt}` : '⚠️ 缺少 alt'}: {img.src.substring(0, 50)}...
                    </div>
                  ))}
                  {result.meta.images.length > 10 && <div>...还有 {result.meta.images.length - 10} 张图片</div>}
                </div>
              </div>
            )}
          </>
        )}

        <div className="tool-block">
          <div className="tool-block-title">常见 Meta 标签</div>
          <div className="tool-result">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>标签</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>作用</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>title</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>页面标题，显示在浏览器标签和搜索结果中</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>description</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>页面描述，显示在搜索结果摘要中</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>og:* 系列</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Open Graph 标签，用于社交媒体分享展示</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>robots</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>控制搜索引擎爬虫行为</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
