import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

interface DnsRecord {
  type: string
  name: string
  value: string
  ttl: string
}

export default function DnsQueryToolPage() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [records, setRecords] = useState<DnsRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dnsServices = [
    { name: 'DNS Checker', url: 'https://dnschecker.org/' },
    { name: '站长工具 DNS', url: 'https://tool.chinaz.com/dns/' },
    { name: 'Google DNS', url: 'https://dns.google/' },
    { name: 'Cloudflare DNS', url: 'https://1.1.1.1/dns/' }
  ]

  const handleQuery = () => {
    if (!domain.trim()) {
      setError('请输入域名')
      return
    }

    setLoading(true)
    setError(null)

    // 由于浏览器无法直接进行 DNS 查询，这里显示说明信息
    setTimeout(() => {
      setRecords([
        {
          type: '说明',
          name: 'DNS 查询',
          value: '由于浏览器安全限制，无法直接进行 DNS 查询。请使用下方在线工具进行查询。',
          ttl: '-'
        }
      ])
      setLoading(false)
    }, 500)
  }

  const handleServiceClick = (service: typeof dnsServices[0]) => {
    if (domain.trim()) {
      const encodedDomain = encodeURIComponent(domain.trim())
      if (service.url.includes('dnschecker.org')) {
        window.open(`${service.url}#A/${encodedDomain}`, '_blank')
      } else if (service.url.includes('chinaz.com')) {
        window.open(`${service.url}?type=1&host=${encodedDomain}`, '_blank')
      } else {
        window.open(service.url, '_blank')
      }
    } else {
      window.open(service.url, '_blank')
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
              <option value="SOA">SOA</option>
            </select>
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleQuery} disabled={loading}>
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {records.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">查询结果</div>
            <div className="tool-result">
              {records.map((record, index) => (
                <p key={index}>{record.value}</p>
              ))}
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">在线 DNS 查询工具</div>
          <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {dnsServices.map((service) => (
              <button
                key={service.name}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleServiceClick(service)}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>

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
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>A</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向 IPv4 地址</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>AAAA</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向 IPv6 地址</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>CNAME</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>将域名指向另一个域名</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>MX</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>邮件交换记录</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>TXT</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>文本记录，常用于域名验证</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>NS</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>域名服务器记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
