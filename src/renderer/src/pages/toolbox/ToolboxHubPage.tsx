import { Link } from 'react-router-dom'
import './toolbox.css'

const cards = [
  {
    to: '/frontend-toolbox/encoding',
    title: '1. 编码与加解密',
    desc: '字符串 / 文件 Hash：MD5、SHA1、SHA256'
  },
  {
    to: '/frontend-toolbox/json',
    title: '2. JSON 处理',
    desc: '格式化、压缩、校验'
  },
  {
    to: '/frontend-toolbox/url',
    title: '3. URL 与参数',
    desc: 'URL 编码解码、Base64、Query 解析为对象'
  },
  {
    to: '/frontend-toolbox/time',
    title: '4. 时间与时间戳',
    desc: '时间戳与本地 / ISO 互转、当前时间'
  },
  {
    to: '/frontend-toolbox/http',
    title: '5. 请求调试',
    desc: 'HTTP 请求（fetch）、WebSocket 简易收发'
  },
  {
    to: '/frontend-toolbox/text',
    title: '6. 文本与数据转换',
    desc: '正则匹配、行级 Diff、CSV 转 JSON、YAML ↔ JSON'
  }
]

export default function ToolboxHubPage() {
  return (
    <div className="toolbox-page">
      <div className="page-header">
        <h1>P3 前端工具箱</h1>
        <p className="page-sub">按文档第 1～6 节拆分为独立页面，点击下方卡片进入。</p>
      </div>

      <div className="toolbox-hub-grid">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="toolbox-hub-card">
            <div className="toolbox-hub-card-title">{c.title}</div>
            <div className="toolbox-hub-card-desc">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
