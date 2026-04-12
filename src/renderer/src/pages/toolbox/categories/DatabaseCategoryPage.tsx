import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  {
    to: '/frontend-toolbox/database/mysql',
    icon: '🐬',
    title: 'MySQL',
    desc: '最流行的关系型数据库，事务支持、索引优化、主从复制'
  },
  {
    to: '/frontend-toolbox/database/postgresql',
    icon: '🐘',
    title: 'PostgreSQL',
    desc: '功能强大的开源数据库，JSON支持、扩展丰富'
  },
  {
    to: '/frontend-toolbox/database/mongodb',
    icon: '🍃',
    title: 'MongoDB',
    desc: '文档型NoSQL数据库，灵活schema、水平扩展'
  },
  {
    to: '/frontend-toolbox/database/sharding',
    icon: '📊',
    title: '分库分表',
    desc: '水平拆分策略、分片键选择、数据迁移方案'
  },
  {
    to: '/frontend-toolbox/database/index',
    icon: '🔍',
    title: '索引优化',
    desc: '索引类型、索引设计原则、慢查询分析'
  },
  {
    to: '/frontend-toolbox/database/replication',
    icon: '🔄',
    title: '读写分离',
    desc: '主从复制、读写路由、数据一致性保证'
  }
]

export default function DatabaseCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🗄️ 数据库</h1>
        <p>关系型与NoSQL数据库、分库分表、索引优化、读写分离</p>
      </div>

      <div className="category-overview">
        <h2>数据库选型对比</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>MySQL</th>
              <th>PostgreSQL</th>
              <th>MongoDB</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>类型</td>
              <td>关系型</td>
              <td>关系型</td>
              <td>文档型 NoSQL</td>
            </tr>
            <tr>
              <td>事务</td>
              <td>支持（InnoDB）</td>
              <td>完整支持</td>
              <td>支持（4.0+）</td>
            </tr>
            <tr>
              <td>JSON</td>
              <td>支持（5.7+）</td>
              <td>原生支持</td>
              <td>原生 BSON</td>
            </tr>
            <tr>
              <td>扩展性</td>
              <td>垂直为主</td>
              <td>垂直为主</td>
              <td>水平扩展</td>
            </tr>
            <tr>
              <td>适用场景</td>
              <td>Web应用、电商</td>
              <td>复杂查询、GIS</td>
              <td>内容管理、日志</td>
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
