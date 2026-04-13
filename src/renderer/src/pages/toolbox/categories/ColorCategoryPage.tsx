import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/color/convert', icon: '🔄', title: '颜色转换', desc: 'RGB、HSL、CMYK 颜色转换' },
  { to: '/frontend-toolbox/color/palette', icon: '🎨', title: '调色板', desc: '生成配色方案' },
  { to: '/frontend-toolbox/color/gradient', icon: '🌈', title: '渐变生成', desc: 'CSS 渐变生成器' },
  { to: '/frontend-toolbox/color/contrast', icon: '👁️', title: '对比度计算', desc: '颜色对比度计算' },
  { to: '/frontend-toolbox/color/picker', icon: '🎯', title: '颜色提取', desc: '从图片提取颜色' }
]

export default function ColorCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🎨 颜色工具</h1>
        <p>颜色转换、调色板、渐变生成、对比度计算、颜色提取</p>
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
