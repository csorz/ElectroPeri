import { useState } from 'react'
import './ToolPage.css'

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
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
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
    <div className="tool-page">
      <div className="tool-header">
        <h1>DNS 查询</h1>
        <p>DNS Query - 域名解析记录查询</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>多种记录类型</h3>
                <p>支持 A、AAAA、CNAME、MX、TXT、NS 等多种 DNS 记录类型查询</p>
              </div>
              <div className="feature-card">
                <h3>解析诊断</h3>
                <p>诊断域名解析问题，验证 DNS 配置是否正确</p>
              </div>
              <div className="feature-card">
                <h3>DNS 服务器检测</h3>
                <p>查看当前系统使用的 DNS 服务器配置</p>
              </div>
              <div className="feature-card">
                <h3>批量查询</h3>
                <p>一次性查询所有记录类型，全面了解域名 DNS 配置</p>
              </div>
            </div>

            <h2>DNS 解析原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    DNS 解析流程
    ┌─────────┐      ┌──────────┐      ┌────────────┐
    │  客户端  │ ───> │ 本地DNS   │ ───> │  根DNS服务器 │
    │         │      │  服务器   │      │ (.)         │
    └─────────┘      └──────────┘      └────────────┘
                            │                 │
                            │                 │ 返回 .com NS
                            │                 ▼
                            │         ┌────────────┐
                            │ <────── │ .com 顶级域 │
                            │         │ DNS 服务器  │
                            │                 │
                            │                 │ 返回 example.com NS
                            │                 ▼
                            │         ┌────────────┐
                            │ <────── │example.com │
                            │         │ 权威DNS服务器│
                            ▼         └────────────┘
                     ┌──────────┐
                     │  返回IP  │
                     │  结果缓存 │
                     └──────────┘
              `}</pre>
            </div>

            <h2>DNS 记录类型详解</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>说明</th>
                  <th>示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td>将域名指向 IPv4 地址</td>
                  <td>example.com → 93.184.216.34</td>
                </tr>
                <tr>
                  <td>AAAA</td>
                  <td>将域名指向 IPv6 地址</td>
                  <td>example.com → 2606:2800:220:1:248:1893:25c8:1946</td>
                </tr>
                <tr>
                  <td>CNAME</td>
                  <td>域名别名，指向另一个域名</td>
                  <td>www.example.com → example.com</td>
                </tr>
                <tr>
                  <td>MX</td>
                  <td>邮件交换记录</td>
                  <td>example.com → mail.example.com (优先级10)</td>
                </tr>
                <tr>
                  <td>TXT</td>
                  <td>文本记录，用于验证、SPF 等</td>
                  <td>v=spf1 include:_spf.google.com ~all</td>
                </tr>
                <tr>
                  <td>NS</td>
                  <td>域名服务器记录</td>
                  <td>example.com → ns1.example.com</td>
                </tr>
                <tr>
                  <td>SOA</td>
                  <td>起始授权机构记录</td>
                  <td>包含序列号、刷新时间等</td>
                </tr>
                <tr>
                  <td>SRV</td>
                  <td>服务记录</td>
                  <td>_sip._tcp.example.com</td>
                </tr>
              </tbody>
            </table>

            <h2>DNS 缓存机制</h2>
            <div className="info-box">
              <strong>TTL (Time To Live)</strong>
              <p>DNS 记录的缓存时间，单位为秒。常见的 TTL 设置：</p>
              <ul>
                <li><strong>300 (5分钟)</strong> - 需要快速切换的场景</li>
                <li><strong>3600 (1小时)</strong> - 一般用途</li>
                <li><strong>86400 (1天)</strong> - 稳定不变的记录</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网站部署</strong> - 验证域名解析是否生效</li>
              <li><strong>邮件配置</strong> - 检查 MX 记录配置</li>
              <li><strong>故障排查</strong> - 诊断 DNS 解析问题</li>
              <li><strong>安全检测</strong> - 验证 SPF、DKIM 配置</li>
              <li><strong>CDN 配置</strong> - 检查 CNAME 是否正确指向 CDN</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>DNS 查询</h2>
            <div className="connection-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>域名</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="输入域名，如：example.com"
                    style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  />
                </div>
                <div className="config-item">
                  <label>记录类型</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="CNAME">CNAME (别名)</option>
                    <option value="MX">MX (邮件)</option>
                    <option value="TXT">TXT (文本)</option>
                    <option value="NS">NS (域名服务器)</option>
                  </select>
                </div>
              </div>

              <div className="demo-controls" style={{ flexWrap: 'wrap' }}>
                <button onClick={handleQuery} disabled={loading}>
                  {loading ? '查询中...' : '查询单项'}
                </button>
                <button onClick={handleQueryAll} disabled={loading} style={{ background: '#4caf50' }}>
                  查询全部
                </button>
                <button onClick={handleGetServers} style={{ background: '#e0e0e0', color: '#333' }}>
                  查看 DNS 服务器
                </button>
              </div>

              {error && (
                <div className="result-box" style={{ marginTop: 16, background: '#ffebee', color: '#c62828' }}>
                  {error}
                </div>
              )}

              {dnsServers.length > 0 && (
                <div className="result-box" style={{ marginTop: 16 }}>
                  <h4>当前 DNS 服务器</h4>
                  <div style={{ textAlign: 'left' }}>
                    {dnsServers.map((server, i) => (
                      <div key={i} style={{ fontFamily: 'monospace', padding: '4px 0' }}>{server}</div>
                    ))}
                  </div>
                </div>
              )}

              {results && results.results.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  {results.results.map((result, i) => (
                    <div className="result-box" key={i} style={{ marginBottom: 16 }}>
                      <h4>{result.type} 记录</h4>
                      <div style={{ textAlign: 'left' }}>
                        {result.error ? (
                          <div style={{ color: '#888' }}>{result.error}</div>
                        ) : result.records.length > 0 ? (
                          result.records.map((record, j) => (
                            <div key={j} style={{ fontFamily: 'monospace', padding: '4px 0' }}>{record}</div>
                          ))
                        ) : (
                          <div style={{ color: '#888' }}>无记录</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>命令行示例</h2>
            <div className="code-block">
              <pre>{`# Windows nslookup
nslookup example.com
nslookup -type=MX example.com
nslookup -type=TXT example.com

# Linux/macOS dig
dig example.com
dig example.com A
dig example.com MX
dig @8.8.8.8 example.com  # 指定 DNS 服务器

# 查询所有记录
dig example.com ANY

# 反向查询
dig -x 8.8.8.8

# 详细输出
dig +trace example.com

# host 命令
host example.com
host -t MX example.com`}</pre>
            </div>

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`import dns from 'dns/promises';

// 查询 A 记录
async function queryA(domain) {
  const addresses = await dns.resolve(domain, 'A');
  return addresses;
}

// 查询所有类型
async function queryAll(domain) {
  const results = {};

  const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];

  for (const type of types) {
    try {
      results[type] = await dns.resolve(domain, type);
    } catch (e) {
      results[type] = [];
    }
  }

  return results;
}

// 反向解析
async function reverse(ip) {
  const hostnames = await dns.reverse(ip);
  return hostnames;
}

// 获取 DNS 服务器
console.log(dns.getServers());
// ['8.8.8.8', '8.8.4.4']

// 使用示例
async function main() {
  const info = await queryAll('google.com');
  console.log('A:', info.A);
  console.log('MX:', info.MX);
  console.log('TXT:', info.TXT);
}

main();`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import dns.resolver  # pip install dnspython

def query_dns(domain: str, record_type: str = 'A') -> list:
    """查询 DNS 记录"""
    try:
        answers = dns.resolver.resolve(domain, record_type)
        return [str(rdata) for rdata in answers]
    except dns.resolver.NoAnswer:
        return []
    except dns.resolver.NXDOMAIN:
        return ['域名不存在']

def query_all(domain: str) -> dict:
    """查询所有记录类型"""
    results = {}
    types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']

    for rtype in types:
        try:
            answers = dns.resolver.resolve(domain, rtype)
            results[rtype] = [str(rdata) for rdata in answers]
        except Exception:
            results[rtype] = []

    return results

# 反向解析
def reverse_lookup(ip: str) -> list:
    """反向 DNS 查询"""
    try:
        answers = dns.resolver.resolve_address(ip)
        return [str(rdata) for rdata in answers]
    except Exception:
        return []

# 使用示例
if __name__ == '__main__':
    print("A 记录:", query_dns('google.com', 'A'))
    print("MX 记录:", query_dns('google.com', 'MX'))
    print("所有记录:", query_all('google.com'))`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "net"
    "context"
    "time"
)

// DNS 查询结构体
type DNSQuery struct {
    Domain string
    Type   string
}

// 查询 A 记录
func QueryA(domain string) ([]string, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    ips, err := net.DefaultResolver.LookupIPAddr(ctx, domain)
    if err != nil {
        return nil, err
    }

    var results []string
    for _, ip := range ips {
        if ip.IP.To4() != nil {
            results = append(results, ip.IP.String())
        }
    }
    return results, nil
}

// 查询 MX 记录
func QueryMX(domain string) ([]*net.MX, error) {
    mxs, err := net.LookupMX(domain)
    if err != nil {
        return nil, err
    }
    return mxs, nil
}

// 查询 TXT 记录
func QueryTXT(domain string) ([]string, error) {
    txts, err := net.LookupTXT(domain)
    if err != nil {
        return nil, err
    }
    return txts, nil
}

// 查询 NS 记录
func QueryNS(domain string) ([]*net.NS, error) {
    nss, err := net.LookupNS(domain)
    if err != nil {
        return nil, err
    }
    return nss, nil
}

// 反向解析
func ReverseLookup(ip string) ([]string, error) {
    names, err := net.LookupAddr(ip)
    if err != nil {
        return nil, err
    }
    return names, nil
}

func main() {
    domain := "google.com"

    // A 记录
    if ips, err := QueryA(domain); err == nil {
        fmt.Println("A:", ips)
    }

    // MX 记录
    if mxs, err := QueryMX(domain); err == nil {
        for _, mx := range mxs {
            fmt.Printf("MX: %s (优先级: %d)\\n", mx.Host, mx.Pref)
        }
    }

    // TXT 记录
    if txts, err := QueryTXT(domain); err == nil {
        fmt.Println("TXT:", txts)
    }
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

public class DNSQuery {

    private static DirContext createDnsContext() throws NamingException {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY,
                "com.sun.jndi.dns.DnsContextFactory");
        return new InitialDirContext(env);
    }

    public static void query(String domain, String... types) {
        try {
            DirContext ctx = createDnsContext();
            Attributes attrs = ctx.getAttributes(domain, types);

            for (String type : types) {
                Attribute attr = attrs.get(type);
                if (attr != null) {
                    System.out.println(type + " 记录:");
                    for (int i = 0; i < attr.size(); i++) {
                        System.out.println("  " + attr.get(i));
                    }
                }
            }
        } catch (NamingException e) {
            System.err.println("查询失败: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        String domain = "google.com";

        // 查询单种记录
        query(domain, "A");
        query(domain, "MX");

        // 查询多种记录
        query(domain, "A", "AAAA", "MX", "TXT", "NS");
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
