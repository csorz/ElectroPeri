import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/ocr/text', icon: '📝', title: '文字识别', desc: 'OCR 图片文字识别' },
  { to: '/frontend-toolbox/ocr/svg', icon: '🎨', title: 'SVG 编辑', desc: 'SVG 在线编辑优化' }
]

export default function OcrCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">👁️</span>
          <h1>OCR 与识别</h1>
        </div>
        <p className="page-sub">文字识别、SVG 编辑</p>
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
