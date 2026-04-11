import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/encoding/hash', icon: '#️⃣', title: 'Hash 计算', desc: 'MD5、SHA1、SHA256 等哈希值计算' },
  { to: '/frontend-toolbox/encoding/base64', icon: '📦', title: 'Base64 编解码', desc: 'Base64 编码与解码' },
  { to: '/frontend-toolbox/encoding/url', icon: '🔗', title: 'URL 编解码', desc: 'URL 编码与解码' },
  { to: '/frontend-toolbox/encoding/encrypt', icon: '🔒', title: '加密解密', desc: 'AES、DES、RSA 加密解密' },
  { to: '/frontend-toolbox/encoding/unicode', icon: '🌐', title: 'Unicode 编码', desc: 'Unicode、UTF-8、UTF-16 编码转换' }
]

export default function EncodingCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔐</span>
          <h1>编码与加解密</h1>
        </div>
        <p className="page-sub">Hash 计算、Base64、URL 编解码、加密解密、Unicode 编码</p>
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
