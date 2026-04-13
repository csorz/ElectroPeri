import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/utils/video', icon: '🎬', title: '视频解析', desc: '短视频去水印下载' },
  { to: '/frontend-toolbox/utils/file', icon: '📁', title: '文件传输', desc: '在线文件传输' },
  { to: '/frontend-toolbox/utils/phone', icon: '📱', title: '归属地查询', desc: '手机/身份证归属地查询' }
]

export default function UtilsCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🔧 实用工具</h1>
        <p>视频解析、文件传输、归属地查询</p>
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
