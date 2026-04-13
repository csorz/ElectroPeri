import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/image/compress', icon: '🗜️', title: '图片压缩', desc: '在线图片压缩' },
  { to: '/frontend-toolbox/image/convert', icon: '🔄', title: '格式转换', desc: '图片格式转换' },
  { to: '/frontend-toolbox/image/base64', icon: '📦', title: '图片 Base64', desc: '图片与 Base64 互转' },
  { to: '/frontend-toolbox/image/watermark', icon: '💧', title: '图片水印', desc: '添加图片水印' },
  { to: '/frontend-toolbox/image/qrcode', icon: '📱', title: '二维码生成', desc: '生成二维码图片' }
]

export default function ImageCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🖼️ 图片工具</h1>
        <p>图片压缩、格式转换、Base64、水印、二维码生成</p>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info">
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
