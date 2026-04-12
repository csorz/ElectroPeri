import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  {
    to: '/frontend-toolbox/network/tcp',
    icon: '🔗',
    title: 'TCP 协议',
    desc: '传输控制协议，面向连接、可靠传输、流量控制、拥塞控制'
  },
  {
    to: '/frontend-toolbox/network/udp',
    icon: '📡',
    title: 'UDP 协议',
    desc: '用户数据报协议，无连接、不可靠、低延迟、适合实时应用'
  },
  {
    to: '/frontend-toolbox/network/kcp',
    icon: '⚡',
    title: 'KCP 协议',
    desc: '快速可靠协议，低延迟、可配置可靠性、游戏/直播首选'
  }
]

export default function NetworkCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🌐 网络编程</h1>
        <p>传输层协议详解：TCP、UDP、KCP 的原理、特性与应用场景</p>
      </div>

      <div className="category-overview">
        <h2>协议对比总览</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>TCP</th>
              <th>UDP</th>
              <th>KCP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>连接方式</td>
              <td>面向连接</td>
              <td>无连接</td>
              <td>无连接（可靠）</td>
            </tr>
            <tr>
              <td>可靠性</td>
              <td>高（确认重传）</td>
              <td>低（不保证）</td>
              <td>可配置</td>
            </tr>
            <tr>
              <td>延迟</td>
              <td>较高</td>
              <td>最低</td>
              <td>低（比TCP低30-40%）</td>
            </tr>
            <tr>
              <td>流量控制</td>
              <td>滑动窗口</td>
              <td>无</td>
              <td>可配置窗口</td>
            </tr>
            <tr>
              <td>适用场景</td>
              <td>Web、文件传输、邮件</td>
              <td>视频直播、DNS、游戏</td>
              <td>实时游戏、直播推流</td>
            </tr>
          </tbody>
        </table>
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
