import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/pool/connection', icon: '🔗', title: '连接池', desc: '数据库连接池、HTTP连接池，复用连接减少开销' },
  { to: '/frontend-toolbox/pool/thread', icon: '🧵', title: '线程池', desc: '任务队列、核心线程数、拒绝策略' },
  { to: '/frontend-toolbox/pool/object', icon: '📦', title: '对象池', desc: '复用对象、减少GC、提升性能' }
]

export default function PoolCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🔗 连接池</h1>
        <p>资源池化技术：连接池、线程池、对象池</p>
      </div>

      <div className="category-overview">
        <h2>池化技术对比</h2>
        <table className="comparison-table">
          <thead><tr><th>类型</th><th>作用</th><th>典型实现</th></tr></thead>
          <tbody>
            <tr><td>连接池</td><td>复用网络连接</td><td>HikariCP、Druid</td></tr>
            <tr><td>线程池</td><td>复用线程资源</td><td>ThreadPoolExecutor、goroutine</td></tr>
            <tr><td>对象池</td><td>复用对象实例</td><td>sync.Pool、Apache Pool</td></tr>
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
