import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

export default function VideoParserToolPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [result, setResult] = useState<{ platform: string; note: string } | null>(null)

  const platforms = [
    {
      name: '抖音',
      icon: '🎵',
      pattern: /douyin\.com|iesdouyin\.com/,
      tools: [
        { name: '抖音解析', url: 'https://www.douyin.com/' }
      ]
    },
    {
      name: '快手',
      icon: '⚡',
      pattern: /kuaishou\.com|gif\.kuaishou\.com/,
      tools: [
        { name: '快手解析', url: 'https://www.kuaishou.com/' }
      ]
    },
    {
      name: 'TikTok',
      icon: '🎬',
      pattern: /tiktok\.com/,
      tools: [
        { name: 'TikTok解析', url: 'https://www.tiktok.com/' }
      ]
    },
    {
      name: 'YouTube',
      icon: '▶️',
      pattern: /youtube\.com|youtu\.be/,
      tools: [
        { name: 'YouTube下载', url: 'https://www.youtube.com/' }
      ]
    }
  ]

  const onlineTools = [
    { name: '短视频解析', url: 'https://www.douyin.com/', desc: '支持抖音、快手等' },
    { name: 'YouTube 下载', url: 'https://www.y2mate.com/', desc: 'YouTube 视频下载' },
    { name: '微博视频', url: 'https://weibo.com/', desc: '微博视频下载' }
  ]

  const handleAnalyze = () => {
    if (!videoUrl.trim()) {
      setResult(null)
      return
    }

    for (const platform of platforms) {
      if (platform.pattern.test(videoUrl)) {
        setResult({
          platform: `${platform.icon} ${platform.name}`,
          note: `检测到 ${platform.name} 平台链接，请使用对应工具解析`
        })
        return
      }
    }

    setResult({
      platform: '未知平台',
      note: '未能识别视频平台，请尝试使用通用解析工具'
    })
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/utils" className="toolbox-back">
        ← 返回实用工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎬</span>
          <h1>视频解析</h1>
        </div>
        <p className="page-sub">解析短视频链接，获取无水印视频</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入视频链接</div>
          <textarea
            className="tool-textarea"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="粘贴短视频分享链接..."
            rows={3}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleAnalyze}>
              识别平台
            </button>
          </div>
        </div>

        {result && (
          <div className="tool-block">
            <div className="tool-block-title">识别结果</div>
            <div className="tool-result">
              <p><strong>平台：</strong>{result.platform}</p>
              <p><strong>说明：</strong>{result.note}</p>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">在线解析工具</div>
          <div className="tool-result">
            {onlineTools.map((tool) => (
              <div key={tool.name} style={{ marginBottom: '12px' }}>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ marginRight: '8px' }}
                >
                  {tool.name}
                </a>
                <span style={{ color: '#666' }}>{tool.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <p>视频解析功能说明：</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>由于浏览器安全限制，无法直接解析视频</li>
              <li>请复制链接到上方推荐的专业解析网站</li>
              <li>支持抖音、快手、TikTok 等主流短视频平台</li>
              <li>解析后的视频可无水印下载</li>
            </ul>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">支持的分享链接格式</div>
          <div className="tool-result">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>平台</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>链接示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>抖音</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>https://v.douyin.com/xxx</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>快手</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>https://v.kuaishou.com/xxx</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>TikTok</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>https://vm.tiktok.com/xxx</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>YouTube</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>https://youtu.be/xxx</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
