import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

export default function WhoisToolPage() {
  const [domain, setDomain] = useState('')

  const whoisServices = [
    { name: '阿里云 WHOIS', url: 'https://whois.aliyun.com/', icon: '🔍' },
    { name: '站长工具', url: 'https://whois.chinaz.com/', icon: '📊' },
    { name: 'WHOIS.NET', url: 'https://www.whois.net/', icon: '🌐' },
    { name: 'ICANN Lookup', url: 'https://lookup.icann.org/', icon: '🏛️' }
  ]

  const handleQuery = (serviceUrl: string) => {
    if (!domain.trim()) {
      alert('请输入域名')
      return
    }
    // 部分服务支持直接带参数跳转
    const encodedDomain = encodeURIComponent(domain.trim())
    if (serviceUrl.includes('chinaz.com')) {
      window.open(`${serviceUrl}${encodedDomain}`, '_blank')
    } else if (serviceUrl.includes('aliyun.com')) {
      window.open(`${serviceUrl}whois/domain/${encodedDomain}`, '_blank')
    } else {
      window.open(serviceUrl, '_blank')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/seo" className="toolbox-back">
        ← 返回 SEO 与站长工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📋</span>
          <h1>Whois 查询</h1>
        </div>
        <p className="page-sub">查询域名注册信息、注册商、到期时间等</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入域名</div>
          <input
            type="text"
            className="tool-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="输入域名，如：example.com"
          />
        </div>

        <div className="tool-block">
          <div className="tool-block-title">选择查询服务</div>
          <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {whoisServices.map((service) => (
              <button
                key={service.name}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuery(service.url)}
              >
                {service.icon} {service.name}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">什么是 Whois？</div>
          <div className="tool-result">
            <p>WHOIS 是一个查询和响应协议，广泛用于查询数据库以存储互联网资源的注册用户或受让人信息。</p>
            <p style={{ marginTop: '8px' }}>通过 Whois 查询可以获取：</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>域名注册商信息</li>
              <li>域名注册时间</li>
              <li>域名到期时间</li>
              <li>域名状态</li>
              <li>域名服务器 (DNS) 信息</li>
              <li>注册人联系信息（如有公开）</li>
            </ul>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用提示</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>部分域名开启了隐私保护，无法查看真实注册人信息</li>
              <li>不同查询服务商返回的信息可能略有差异</li>
              <li>建议使用多个查询服务交叉验证</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
