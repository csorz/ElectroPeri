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
  canonical: string
  robots: string
}

export default function MetaCheckerToolPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metaInfo, setMetaInfo] = useState<MetaInfo | null>(null)

  const handleCheck = async () => {
    if (!url.trim()) {
      setError('请输入网址')
      return
    }

    setLoading(true)
    setError(null)
    setMetaInfo(null)

    try {
      // 由于跨域限制，这里提供模拟检测功能
      // 实际项目中需要通过后端代理或使用 CORS 代理
      const targetUrl = url.trim()

      // 模拟检测结果
      setMetaInfo({
        title: '检测功能说明',
        description: '由于浏览器跨域限制，Meta 检测需要后端服务支持。请使用以下在线工具进行检测：',
        keywords: '',
        author: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonical: targetUrl,
        robots: ''
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '检测失败')
    } finally {
      setLoading(false)
    }
  }

  const onlineTools = [
    { name: 'SEO Site Checkup', url: 'https://seositecheckup.com/' },
    { name: 'Meta Tag Analyzer', url: 'https://www.seoptimer.com/meta-tag-checker' },
    { name: 'Google Rich Results', url: 'https://search.google.com/test/rich-results' }
  ]

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

        {metaInfo && (
          <div className="tool-block">
            <div className="tool-block-title">检测结果</div>
            <div className="tool-result">
              <p style={{ marginBottom: '12px' }}>{metaInfo.description}</p>
              <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {onlineTools.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    {tool.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
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
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>title</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>页面标题，显示在浏览器标签和搜索结果中</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>description</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>页面描述，显示在搜索结果摘要中</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>keywords</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>页面关键词（现代 SEO 作用较小）</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>og:* 系列</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Open Graph 标签，用于社交媒体分享展示</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>robots</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>控制搜索引擎爬虫行为</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
