import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/image/compress', icon: '🗜️', title: '图片压缩', desc: '在线图片压缩' },
  { to: '/frontend-toolbox/image/convert', icon: '🔄', title: '格式转换', desc: '图片格式转换' },
  { to: '/frontend-toolbox/image/base64', icon: '📦', title: '图片 Base64', desc: '图片与 Base64 互转' },
  { to: '/frontend-toolbox/image/watermark', icon: '💧', title: '图片水印', desc: '添加图片水印' },
  { to: '/frontend-toolbox/image/qrcode', icon: '📱', title: '二维码生成', desc: '生成二维码图片' }
]

export default function ImageCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🖼️</span>
          <h1>图片工具</h1>
        </div>
        <p className="page-sub">图片压缩、格式转换、Base64、水印、二维码生成</p>
      </div>

      <div className="toolbox-category-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="toolbox-tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info">
              <div className="tool-title">{tool.title}</div>
              <div className="tool-desc">{tool.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
