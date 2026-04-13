import { useState } from 'react'
import './ToolPage.css'

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
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
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
    <div className="tool-page">
      <div className="tool-header">
        <h1>Meta 检测</h1>
        <p>Meta Tag Checker - 网页元信息检测工具</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>SEO 分析</h3>
                <p>检测 title、description、keywords 等 SEO 关键标签，优化搜索引擎排名</p>
              </div>
              <div className="feature-card">
                <h3>社交媒体优化</h3>
                <p>检查 Open Graph 和 Twitter Card 标签，确保分享效果最佳</p>
              </div>
              <div className="feature-card">
                <h3>语义化检测</h3>
                <p>分析 H1-H6 标题层级，确保页面结构合理</p>
              </div>
              <div className="feature-card">
                <h3>可访问性检查</h3>
                <p>检测图片 alt 属性等，提升网站可访问性</p>
              </div>
            </div>

            <h2>Meta 标签体系</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    HTML 文档结构中的 Meta 标签
    ┌─────────────────────────────────────────────────────┐
    │  <head>                                              │
    │    ├── <title>页面标题</title>                        │
    │    │                                                 │
    │    ├── 基础 Meta                                     │
    │    │   <meta name="description" content="...">       │
    │    │   <meta name="keywords" content="...">          │
    │    │   <meta name="author" content="...">            │
    │    │                                                 │
    │    ├── SEO 相关                                      │
    │    │   <meta name="robots" content="index,follow">   │
    │    │   <link rel="canonical" href="...">            │
    │    │                                                 │
    │    ├── Open Graph (社交分享)                         │
    │    │   <meta property="og:title" content="...">      │
    │    │   <meta property="og:description" content="...">│
    │    │   <meta property="og:image" content="...">      │
    │    │                                                 │
    │    └── Twitter Card                                  │
    │        <meta name="twitter:card" content="...">      │
    │        <meta name="twitter:title" content="...">     │
    │  </head>                                             │
    └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>Meta 标签详解</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>标签</th>
                  <th>作用</th>
                  <th>SEO 重要性</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>title</td>
                  <td>页面标题，显示在浏览器标签和搜索结果</td>
                  <td>极高</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>页面描述，显示在搜索结果摘要</td>
                  <td>高</td>
                </tr>
                <tr>
                  <td>keywords</td>
                  <td>关键词，大部分搜索引擎已忽略</td>
                  <td>低</td>
                </tr>
                <tr>
                  <td>og:*</td>
                  <td>Open Graph 社交分享标签</td>
                  <td>中</td>
                </tr>
                <tr>
                  <td>twitter:*</td>
                  <td>Twitter 卡片标签</td>
                  <td>中</td>
                </tr>
                <tr>
                  <td>canonical</td>
                  <td>规范链接，避免重复内容</td>
                  <td>高</td>
                </tr>
                <tr>
                  <td>robots</td>
                  <td>控制爬虫行为</td>
                  <td>高</td>
                </tr>
              </tbody>
            </table>

            <h2>SEO 最佳实践</h2>
            <div className="info-box">
              <strong>标题优化建议</strong>
              <ul>
                <li>长度控制在 50-60 字符以内</li>
                <li>重要关键词放在前面</li>
                <li>每个页面标题应唯一</li>
                <li>品牌名称可放在末尾</li>
              </ul>
            </div>

            <div className="info-box warning">
              <strong>描述优化建议</strong>
              <ul>
                <li>长度控制在 150-160 字符以内</li>
                <li>包含目标关键词</li>
                <li>具有吸引力的文案</li>
                <li>准确描述页面内容</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>SEO 审计</strong> - 定期检查网站 Meta 标签完整性</li>
              <li><strong>竞品分析</strong> - 分析竞争对手的 SEO 策略</li>
              <li><strong>内容优化</strong> - 改进页面元信息提升排名</li>
              <li><strong>社交分享</strong> - 确保分享时展示正确信息</li>
              <li><strong>技术迁移</strong> - 网站改版后验证 Meta 完整性</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Meta 检测</h2>
            <div className="connection-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>网址 URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="输入网址，如：https://example.com"
                    style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  />
                </div>
              </div>

              <div className="demo-controls">
                <button onClick={handleCheck} disabled={loading}>
                  {loading ? '检测中...' : '检测'}
                </button>
              </div>

              {error && (
                <div className="result-box" style={{ marginTop: 16, background: '#ffebee', color: '#c62828' }}>
                  {error}
                </div>
              )}

              {result && result.meta && (
                <div style={{ marginTop: 20 }}>
                  <div className="result-box" style={{ marginBottom: 16 }}>
                    <h4>基本信息</h4>
                    <div style={{ textAlign: 'left' }}>
                      <p><strong>URL:</strong> {result.url}</p>
                      <p><strong>状态码:</strong> {result.statusCode}</p>
                      <p><strong>语言:</strong> {result.meta.language || '未设置'}</p>
                      <p><strong>字符集:</strong> {result.meta.charset || '未检测'}</p>
                    </div>
                  </div>

                  <div className="result-box" style={{ marginBottom: 16 }}>
                    <h4>页面标题</h4>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{result.meta.title || '未设置'}</div>
                      {result.meta.title && (
                        <div style={{ color: result.meta.title.length > 60 ? '#f44336' : '#4caf50', marginTop: 4 }}>
                          {result.meta.title.length} 字符 {result.meta.title.length > 60 && '(建议不超过60字符)'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="result-box" style={{ marginBottom: 16 }}>
                    <h4>Meta 描述</h4>
                    <div style={{ textAlign: 'left' }}>
                      <div>{result.meta.description || '未设置'}</div>
                      {result.meta.description && (
                        <div style={{ color: result.meta.description.length > 160 ? '#f44336' : '#4caf50', marginTop: 4 }}>
                          {result.meta.description.length} 字符 {result.meta.description.length > 160 && '(建议不超过160字符)'}
                        </div>
                      )}
                    </div>
                  </div>

                  {result.meta.keywords && (
                    <div className="result-box" style={{ marginBottom: 16 }}>
                      <h4>关键词</h4>
                      <div style={{ textAlign: 'left' }}>{result.meta.keywords}</div>
                    </div>
                  )}

                  {(result.meta.ogTitle || result.meta.ogDescription || result.meta.ogImage) && (
                    <div className="result-box" style={{ marginBottom: 16 }}>
                      <h4>Open Graph</h4>
                      <div style={{ textAlign: 'left' }}>
                        {result.meta.ogTitle && <p><strong>og:title:</strong> {result.meta.ogTitle}</p>}
                        {result.meta.ogDescription && <p><strong>og:description:</strong> {result.meta.ogDescription}</p>}
                        {result.meta.ogImage && <p><strong>og:image:</strong> {result.meta.ogImage}</p>}
                        {result.meta.ogType && <p><strong>og:type:</strong> {result.meta.ogType}</p>}
                      </div>
                    </div>
                  )}

                  {result.meta.h1 && result.meta.h1.length > 0 && (
                    <div className="result-box" style={{ marginBottom: 16 }}>
                      <h4>H1 标题 ({result.meta.h1.length})</h4>
                      <div style={{ textAlign: 'left' }}>
                        {result.meta.h1.map((h, i) => (
                          <div key={i}>{h}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.meta.images && result.meta.images.length > 0 && (
                    <div className="result-box" style={{ marginBottom: 16 }}>
                      <h4>图片 ({result.meta.images.length})</h4>
                      <div style={{ textAlign: 'left' }}>
                        {result.meta.images.slice(0, 10).map((img, i) => (
                          <div key={i} style={{ marginBottom: 4 }}>
                            {img.alt ? `✅ ${img.alt}` : '⚠️ 缺少 alt'}: {img.src.substring(0, 50)}...
                          </div>
                        ))}
                        {result.meta.images.length > 10 && <div>...还有 {result.meta.images.length - 10} 张图片</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>HTML Meta 标签示例</h2>
            <div className="code-block">
              <pre>{`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 基础 Meta -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="这是一个SEO优化的示例页面">
  <meta name="keywords" content="SEO, meta, 优化">
  <meta name="author" content="Your Name">
  <meta name="robots" content="index, follow">

  <!-- 页面标题 -->
  <title>页面标题 - 网站名称</title>

  <!-- 规范链接 -->
  <link rel="canonical" href="https://example.com/page">

  <!-- Open Graph -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="页面标题">
  <meta name="twitter:description" content="页面描述">
  <meta name="twitter:image" content="https://example.com/image.jpg">
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>`}</pre>
            </div>

            <h2>JavaScript 解析 Meta</h2>
            <div className="code-block">
              <pre>{`// 解析页面 Meta 信息
function parseMeta() {
  const getMeta = (name) => {
    const el = document.querySelector(
      \`meta[name="\${name}"], meta[property="\${name}"]\`
    );
    return el?.getAttribute('content') || '';
  };

  return {
    title: document.title,
    description: getMeta('description'),
    keywords: getMeta('keywords'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent),
    images: Array.from(document.querySelectorAll('img')).map(img => ({
      alt: img.alt,
      src: img.src
    }))
  };
}

console.log(parseMeta());`}</pre>
            </div>

            <h2>Python 爬取 Meta</h2>
            <div className="code-block">
              <pre>{`import requests
from bs4 import BeautifulSoup

def get_meta_info(url: str) -> dict:
    """获取网页 Meta 信息"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }

    response = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(response.text, 'html.parser')

    def get_meta(name: str) -> str:
        tag = soup.find('meta', attrs={'name': name}) or \
              soup.find('meta', attrs={'property': name})
        return tag.get('content', '') if tag else ''

    return {
        'title': soup.title.string if soup.title else '',
        'description': get_meta('description'),
        'keywords': get_meta('keywords'),
        'og_title': get_meta('og:title'),
        'og_description': get_meta('og:description'),
        'og_image': get_meta('og:image'),
        'canonical': soup.find('link', rel='canonical').get('href', '')
                     if soup.find('link', rel='canonical') else '',
        'h1': [h.get_text(strip=True) for h in soup.find_all('h1')],
        'images': [{'alt': img.get('alt', ''), 'src': img.get('src', '')}
                   for img in soup.find_all('img') if img.get('src')]
    }

# 使用示例
info = get_meta_info('https://example.com')
print(info)`}</pre>
            </div>

            <h2>Node.js 服务端检测</h2>
            <div className="code-block">
              <pre>{`const cheerio = require('cheerio');

async function checkMeta(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const getMeta = (name) => {
    return $(\`meta[name="\${name}"], meta[property="\${name}"]\`)
      .attr('content') || '';
  };

  return {
    statusCode: response.status,
    title: $('title').text(),
    description: getMeta('description'),
    keywords: getMeta('keywords'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    h1: $('h1').map((i, el) => $(el).text()).get(),
    images: $('img').map((i, el) => ({
      alt: $(el).attr('alt') || '',
      src: $(el).attr('src') || ''
    })).get()
  };
}

// 使用示例
checkMeta('https://example.com').then(console.log);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
