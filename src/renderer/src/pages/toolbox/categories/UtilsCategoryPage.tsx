import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/utils/video', icon: '🎬', title: '视频解析', desc: '短视频去水印下载' },
  { to: '/frontend-toolbox/utils/file', icon: '📁', title: '文件传输', desc: '在线文件传输' },
  { to: '/frontend-toolbox/utils/phone', icon: '📱', title: '归属地查询', desc: '手机/身份证归属地查询' }
]

export default function UtilsCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔧</span>
          <h1>实用工具</h1>
        </div>
        <p className="page-sub">视频解析、文件传输、归属地查询</p>
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
