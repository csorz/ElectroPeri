import { useState } from 'react'
import './ToolPage.css'

export default function WhoisToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
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
    <div className="tool-page">
      <div className="tool-header">
        <h1>Whois 查询</h1>
        <p>WHOIS Protocol - 查询域名注册信息</p>
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
                <h3>注册信息查询</h3>
                <p>查询域名的注册商、注册时间、到期时间等关键信息</p>
              </div>
              <div className="feature-card">
                <h3>域名归属验证</h3>
                <p>验证域名所有权，确认域名是否可用或已注册</p>
              </div>
              <div className="feature-card">
                <h3>DNS 服务器信息</h3>
                <p>获取域名的权威 DNS 服务器配置信息</p>
              </div>
              <div className="feature-card">
                <h3>域名状态查询</h3>
                <p>了解域名当前状态（正常、锁定、过期、待删除等）</p>
              </div>
            </div>

            <h2>WHOIS 协议原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    WHOIS 查询流程
    ┌──────────┐          ┌──────────────┐          ┌──────────┐
    │  客户端   │  ──────> │  WHOIS 服务器 │  ──────> │  注册局   │
    │  查询请求 │          │   (端口43)    │          │  数据库   │
    └──────────┘          └──────────────┘          └──────────┘
           │                      │                       │
           │     查询命令         │      数据库查询        │
           │  "domain example.com"│                       │
           │                      │                       │
           │                      │<──────────────────────│
           │<─────────────────────│     返回注册信息       │
           │      WHOIS 响应       │                       │
           ▼
    ┌─────────────────────────────────────────┐
    │ Domain Name: EXAMPLE.COM                │
    │ Registrar: GoDaddy.com, LLC             │
    │ Created: 1995-08-13                     │
    │ Expires: 2025-08-12                     │
    │ Name Server: NS1.EXAMPLE.COM            │
    └─────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>WHOIS 信息字段</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>说明</th>
                  <th>重要性</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Domain Name</td>
                  <td>域名名称</td>
                  <td>核心信息</td>
                </tr>
                <tr>
                  <td>Registrar</td>
                  <td>注册商名称</td>
                  <td>重要</td>
                </tr>
                <tr>
                  <td>Creation Date</td>
                  <td>注册时间</td>
                  <td>重要</td>
                </tr>
                <tr>
                  <td>Expiration Date</td>
                  <td>到期时间</td>
                  <td>关键</td>
                </tr>
                <tr>
                  <td>Name Servers</td>
                  <td>DNS 服务器</td>
                  <td>重要</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>域名状态</td>
                  <td>关键</td>
                </tr>
                <tr>
                  <td>Registrant</td>
                  <td>注册人信息（可能隐藏）</td>
                  <td>参考</td>
                </tr>
              </tbody>
            </table>

            <h2>域名状态说明</h2>
            <div className="info-box">
              <strong>常见域名状态</strong>
              <ul>
                <li><strong>ok</strong> - 域名正常，可进行各种操作</li>
                <li><strong>clientTransferProhibited</strong> - 禁止转移，防止域名被恶意转走</li>
                <li><strong>clientUpdateProhibited</strong> - 禁止更新，锁定域名信息修改</li>
                <li><strong>clientDeleteProhibited</strong> - 禁止删除，防止域名被误删</li>
                <li><strong>serverHold</strong> - 注册局暂停，域名无法解析</li>
                <li><strong>inactive</strong> - 未激活，DNS 未配置</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>域名购买决策</strong> - 查询域名是否可注册</li>
              <li><strong>域名到期监控</strong> - 及时续费防止丢失</li>
              <li><strong>竞争对手分析</strong> - 了解竞争域名信息</li>
              <li><strong>品牌保护</strong> - 监控商标域名注册情况</li>
              <li><strong>网络安全调查</strong> - 追溯恶意网站归属</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>域名查询</h2>
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
              </div>

              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>选择查询服务</h4>
                <div className="demo-controls" style={{ flexWrap: 'wrap' }}>
                  {whoisServices.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => handleQuery(service.url)}
                      style={{ background: '#e0e0e0', color: '#333' }}
                    >
                      {service.icon} {service.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h2>使用提示</h2>
            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>部分域名开启了隐私保护，无法查看真实注册人信息</li>
                <li>不同查询服务商返回的信息可能略有差异</li>
                <li>建议使用多个查询服务交叉验证</li>
                <li>WHOIS 信息更新可能有延迟</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>命令行示例</h2>
            <div className="code-block">
              <pre>{`# Linux/macOS 内置 whois 命令
whois example.com

# 使用特定服务器查询
whois -h whois.internic.net example.com

# 仅查询注册商信息
whois -h whois.registrar.com example.com | grep -i "registrar"

# 批量查询
for domain in google.com facebook.com twitter.com; do
  echo "=== $domain ==="
  whois $domain | grep -E "(Registrar|Creation Date|Expiration)"
done`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import socket

def whois_query(domain: str, server: str = "whois.internic.net") -> str:
    """执行 WHOIS 查询"""
    # 创建 socket 连接
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((server, 43))

    # 发送查询
    sock.send(f"{domain}\\r\\n".encode())

    # 接收响应
    response = b""
    while True:
        data = sock.recv(4096)
        if not data:
            break
        response += data

    sock.close()
    return response.decode('utf-8', errors='ignore')

# 使用 python-whois 库 (pip install python-whois)
import whois

def get_domain_info(domain: str):
    """使用 python-whois 库查询"""
    result = whois.whois(domain)
    return {
        'domain': result.domain_name,
        'registrar': result.registrar,
        'created': result.creation_date,
        'expires': result.expiration_date,
        'nameservers': result.name_servers,
        'status': result.status
    }

# 使用示例
info = get_domain_info('google.com')
print(info)`}</pre>
            </div>

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`// 安装: npm install whois
const whois = require('whois');

// 基本查询
whois.lookup('example.com', function(err, data) {
  console.log(data);
});

// 使用 Promise
const whoisPromise = (domain) => {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

async function queryDomain(domain) {
  const data = await whoisPromise(domain);

  // 解析关键字段
  const result = {
    registrar: data.match(/Registrar:\\s*(.+)/i)?.[1],
    created: data.match(/Creation Date:\\s*(.+)/i)?.[1],
    expires: data.match(/Expiration Date:\\s*(.+)/i)?.[1],
    nameservers: data.match(/Name Server:\\s*(.+)/gi)
  };

  return result;
}

queryDomain('google.com').then(console.log);`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "net"
    "strings"
    "time"
)

func WhoisQuery(domain, server string) (string, error) {
    if server == "" {
        server = "whois.internic.net"
    }

    conn, err := net.DialTimeout("tcp", server+":43", 10*time.Second)
    if err != nil {
        return "", err
    }
    defer conn.Close()

    // 发送查询
    _, err = fmt.Fprintf(conn, "%s\\r\\n", domain)
    if err != nil {
        return "", err
    }

    // 读取响应
    buf := make([]byte, 4096)
    var result strings.Builder
    for {
        n, err := conn.Read(buf)
        if err != nil {
            break
        }
        result.Write(buf[:n])
    }

    return result.String(), nil
}

func main() {
    result, err := WhoisQuery("example.com", "")
    if err != nil {
        fmt.Println("错误:", err)
        return
    }
    fmt.Println(result)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
