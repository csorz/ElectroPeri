import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/redis/cache', icon: '💾', title: '缓存策略', desc: '缓存模式、过期策略、内存淘汰' },
  { to: '/frontend-toolbox/redis/problems', icon: '⚠️', title: '缓存问题', desc: '缓存穿透、击穿、雪崩及解决方案' },
  { to: '/frontend-toolbox/redis/resilience', icon: '🛡️', title: '高可用机制', desc: '熔断、限流、降级保护系统' }
]

export default function RedisCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📦 Redis</h1>
        <p>缓存策略、常见问题、高可用机制</p>
      </div>

      <div className="category-overview">
        <h2>Redis 核心特性</h2>
        <table className="comparison-table">
          <thead><tr><th>特性</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>数据结构</td><td>String、Hash、List、Set、ZSet、Stream</td></tr>
            <tr><td>持久化</td><td>RDB 快照、AOF 日志</td></tr>
            <tr><td>高可用</td><td>主从复制、哨兵、集群</td></tr>
            <tr><td>性能</td><td>单线程、IO多路复用、10万+ QPS</td></tr>
          </tbody>
        </table>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info"><h3>{tool.title}</h3><p>{tool.desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
