import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/ocr/text', icon: '📝', title: '文字识别', desc: 'OCR 图片文字识别' },
  { to: '/frontend-toolbox/ocr/svg', icon: '🎨', title: 'SVG 编辑', desc: 'SVG 在线编辑优化' }
]

export default function OcrCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>👁️ OCR 与识别</h1>
        <p>文字识别、SVG 编辑</p>
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
