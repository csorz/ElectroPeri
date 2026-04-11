import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

interface DnsResult {
  type: string
  records: string[]
  error?: string
}

interface DnsFullResult {
  domain: string
  results: DnsResult[]
}

export default function DnsQueryToolPage() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [results, setResults] = useState<DnsFullResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dnsServers, setDnsServers] = useState<string[]>([])

  const handleQuery = async () => {
    if (!domain.trim()) {
      setError('请输入域名')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const result = await window.api.dns.query(domain.trim(), recordType)
      setResults({
        domain: domain.trim(),
        results: [result]
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleQueryAll = async () => {
    if (!domain.trim()) {
      setError('请输入域名')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const result = await window.api.dns.queryAll(domain.trim())
      setResults(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGetServers = async () => {
    try {
      const servers = await window.api.dns.getServers()
      setDnsServers(servers)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/seo" className="toolbox-back">
        ← 返回 SEO 与站长工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📡</span>
          <h1>DNS 查询</h1>
        </div>
        <p className="page-sub">查询域名 DNS 解析记录</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入域名</div>
          <div className="tool-row">
            <input
              type="text"
              className="tool-input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="输入域名，如：example.com"
              style={{ flex: 1 }}
            />
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="tool-select"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX</option>
              <option value="TXT">TXT</option>
              <option value="NS">NS</option>
            </select>
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleQuery} disabled={loading}>
              {loading ? '查询中...' : '查询单项'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleQueryAll} disabled={loading}>
              查询全部
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleGetServers}>
              查看 DNS 服务器
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {dnsServers.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">当前 DNS 服务器</div>
            <div className="tool-result">
              {dnsServers.map((server, i) => (
                <div key={i} style={{ fontFamily: 'monospace' }}>{server}</div>
              ))}
            </div>
          </div>
        )}

        {results && results.results.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">查询结果 - {results.domain}</div>
            {results.results.map((result, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{result.type} 记录</div>
                {result.error ? (
                  <div style={{ color: '#888' }}>{result.error}</div>
                ) : result.records.length > 0 ? (
                  <div className="tool-result">
                    {result.records.map((record, j) => (
                      <div key={j} style={{ fontFamily: 'monospace', padding: '4px 0' }}>{record}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#888' }}>无记录</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">DNS 记录类型说明</div>
          <div className="tool-result">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>A</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向 IPv4 地址</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>AAAA</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向 IPv6 地址</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>CNAME</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向另一个域名</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>MX</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>邮件交换记录</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>TXT</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>文本记录，常用于域名验证</td></tr>
                <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>NS</td><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>域名服务器记录</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
