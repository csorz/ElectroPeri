import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface IpInfo {
  ip: string
  country: string
  region: string
  city: string
  isp: string
}

export default function IpQueryToolPage() {
  const [localIp, setLocalIp] = useState<string>('')
  const [queryIp, setQueryIp] = useState('')
  const [result, setResult] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 获取本机 IP
  useEffect(() => {
    const fetchLocalIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setLocalIp(data.ip)
      } catch {
        setLocalIp('获取失败')
      }
    }
    fetchLocalIp()
  }, [])

  // 查询 IP 信息
  const handleQuery = async () => {
    if (!queryIp.trim()) {
      setError('请输入 IP 地址')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`http://ip-api.com/json/${queryIp}?lang=zh-CN`)
      const data = await res.json()
      if (data.status === 'success') {
        setResult({
          ip: data.query,
          country: data.country,
          region: data.regionName,
          city: data.city,
          isp: data.isp
        })
      } else {
        setError('查询失败，请检查 IP 地址是否正确')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/seo" className="toolbox-back">
        ← 返回 SEO 与站长工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🌐</span>
          <h1>IP 查询</h1>
        </div>
        <p className="page-sub">查询 IP 地址归属地信息</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">本机 IP</div>
          <div className="tool-result" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="mono">{localIp || '获取中...'}</span>
            {localIp && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(localIp)}>
                复制
              </button>
            )}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">IP 查询</div>
          <input
            type="text"
            className="tool-input"
            value={queryIp}
            onChange={(e) => setQueryIp(e.target.value)}
            placeholder="输入要查询的 IP 地址，如：8.8.8.8"
          />
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

        {result && (
          <div className="tool-block">
            <div className="tool-block-title">查询结果</div>
            <div className="tool-result">
              <p><strong>IP 地址：</strong>{result.ip}</p>
              <p><strong>国家/地区：</strong>{result.country}</p>
              <p><strong>省份：</strong>{result.region}</p>
              <p><strong>城市：</strong>{result.city}</p>
              <p><strong>运营商：</strong>{result.isp}</p>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">API 接口说明</div>
          <div className="tool-result">
            <p>本工具使用 ip-api.com 免费接口，支持以下功能：</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>查询 IP 地址归属地信息</li>
              <li>支持 IPv4 和 IPv6</li>
              <li>返回国家、省份、城市、运营商等信息</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
