import { useState } from 'react'
import './ToolPage.css'

export default function DnsToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌐 DNS 解析</h1>
        <p>DNS 负载均衡、智能解析、故障切换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>DNS 解析流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  用户 ──▶ 本地DNS ──▶ 根DNS ──▶ 顶级DNS ──▶ 权威DNS
                                        │
                                        ▼
                                  返回IP地址

  DNS 负载均衡:
  example.com ──▶ 192.168.1.1 (北京)
              ──▶ 192.168.1.2 (上海)
              ──▶ 192.168.1.3 (广州)
              `}</pre>
            </div>

            <h2>DNS 负载均衡策略</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>轮询</h3><p>依次返回不同IP</p></div>
              <div className="feature-card"><h3>地理位置</h3><p>就近返回服务器IP</p></div>
              <div className="feature-card"><h3>权重</h3><p>按权重比例返回</p></div>
              <div className="feature-card"><h3>健康检查</h3><p>故障自动摘除</p></div>
            </div>

            <h2>DNS 记录类型</h2>
            <table className="comparison-table">
              <thead><tr><th>类型</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>A</td><td>域名 → IPv4</td></tr>
                <tr><td>AAAA</td><td>域名 → IPv6</td></tr>
                <tr><td>CNAME</td><td>域名别名</td></tr>
                <tr><td>MX</td><td>邮件服务器</td></tr>
                <tr><td>TXT</td><td>文本记录</td></tr>
                <tr><td>NS</td><td>域名服务器</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>DNS 配置示例</h2>
            <div className="code-block">
              <pre>{`# BIND DNS 配置
$TTL 300
@   IN  SOA ns1.example.com. admin.example.com. (
        2024010101  ; 序列号
        3600        ; 刷新
        1800        ; 重试
        604800      ; 过期
        300         ; 最小TTL
)

; NS 记录
@   IN  NS  ns1.example.com.
@   IN  NS  ns2.example.com.

; A 记录 (负载均衡)
@   IN  A   192.168.1.1
@   IN  A   192.168.1.2
@   IN  A   192.168.1.3

; CNAME
www IN  CNAME   example.com.

# dig 查询
dig example.com
dig @8.8.8.8 example.com
dig example.com A
dig example.com MX`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
