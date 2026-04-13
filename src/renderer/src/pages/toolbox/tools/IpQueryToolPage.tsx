import { useCallback, useEffect, useState } from 'react'
import './ToolPage.css'

interface IpInfo {
  ip: string
  country: string
  region: string
  city: string
  isp: string
}

export default function IpQueryToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [localIp, setLocalIp] = useState<string>('')
  const [queryIp, setQueryIp] = useState('')
  const [result, setResult] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void navigator.clipboard.writeText(t), [])

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>IP 查询</h1>
        <p>IP Address Query - 查询 IP 地址归属地信息</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>IP 地址定位</h3>
                <p>通过 IP 地址查询其地理位置信息，包括国家、省份、城市等</p>
              </div>
              <div className="feature-card">
                <h3>运营商识别</h3>
                <p>识别 IP 地址所属的运营商（ISP），了解网络接入商信息</p>
              </div>
              <div className="feature-card">
                <h3>IPv4/IPv6 支持</h3>
                <p>支持 IPv4 和 IPv6 地址查询，覆盖当前主流网络协议</p>
              </div>
              <div className="feature-card">
                <h3>实时查询</h3>
                <p>基于在线 API 实时查询，获取最新的 IP 地理位置数据</p>
              </div>
            </div>

            <h2>IP 地址原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    IPv4 地址结构 (32位)
    ┌─────────────────────────────────────────┐
    │   网络号 (Network)    │   主机号 (Host)   │
    │   标识网络           │   标识主机        │
    └─────────────────────────────────────────┘
                    ↓
    示例: 192.168.1.100
          ├─────┤ ├───┤
          网络部分  主机部分

    IPv6 地址结构 (128位)
    ┌────────────────────────────────────────────────────────────┐
    │  前缀 (64位)              │  接口标识符 (64位)              │
    │  网络标识                  │  主机标识                      │
    └────────────────────────────────────────────────────────────┘
                    ↓
    示例: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
              `}</pre>
            </div>

            <h2>IP 定位技术</h2>
            <div className="info-box">
              <strong>定位原理</strong>
              <p>IP 地理位置数据库通过以下方式构建：</p>
              <ul>
                <li><strong>运营商数据</strong> - ISP 分配 IP 时记录地理位置</li>
                <li><strong>BGP 路由信息</strong> - 分析路由表推断网络范围</li>
                <li><strong>基准测试</strong> - 通过延迟测量估算物理距离</li>
                <li><strong>用户贡献</strong> - 用户主动提供的位置信息</li>
              </ul>
            </div>

            <h2>IP 地址分类</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>类别</th>
                  <th>范围</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A 类</td>
                  <td>1.0.0.0 - 126.255.255.255</td>
                  <td>大型网络，支持约 1600 万主机</td>
                </tr>
                <tr>
                  <td>B 类</td>
                  <td>128.0.0.0 - 191.255.255.255</td>
                  <td>中型网络，支持约 65000 主机</td>
                </tr>
                <tr>
                  <td>C 类</td>
                  <td>192.0.0.0 - 223.255.255.255</td>
                  <td>小型网络，支持 254 主机</td>
                </tr>
                <tr>
                  <td>私有地址</td>
                  <td>10.x.x.x / 172.16-31.x.x / 192.168.x.x</td>
                  <td>内网使用，不可在公网路由</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网络安全</strong> - 识别恶意 IP，进行访问控制</li>
              <li><strong>内容分发</strong> - 根据用户位置提供就近服务</li>
              <li><strong>数据分析</strong> - 统计用户地域分布</li>
              <li><strong>合规审计</strong> - 满足数据本地化法规要求</li>
              <li><strong>故障排查</strong> - 定位网络问题来源</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>本机 IP</h2>
            <div className="connection-demo">
              <div className="step-info">
                <h4>当前公网 IP</h4>
                <p className="mono" style={{ fontSize: 18, color: '#4fc3f7' }}>
                  {localIp || '获取中...'}
                </p>
                {localIp && localIp !== '获取失败' && (
                  <button
                    style={{ marginTop: 8, padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => onCopy(localIp)}
                  >
                    复制
                  </button>
                )}
              </div>
            </div>

            <h2>IP 查询</h2>
            <div className="connection-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>IP 地址</label>
                  <input
                    type="text"
                    value={queryIp}
                    onChange={(e) => setQueryIp(e.target.value)}
                    placeholder="输入 IP，如：8.8.8.8"
                    style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  />
                </div>
              </div>

              <div className="demo-controls">
                <button onClick={handleQuery} disabled={loading}>
                  {loading ? '查询中...' : '查询'}
                </button>
              </div>

              {error && (
                <div className="result-box" style={{ marginTop: 16, background: '#ffebee', color: '#c62828' }}>
                  {error}
                </div>
              )}

              {result && (
                <div className="result-box" style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 12 }}>查询结果</h4>
                  <div style={{ textAlign: 'left' }}>
                    <p><strong>IP 地址：</strong>{result.ip}</p>
                    <p><strong>国家/地区：</strong>{result.country}</p>
                    <p><strong>省份：</strong>{result.region}</p>
                    <p><strong>城市：</strong>{result.city}</p>
                    <p><strong>运营商：</strong>{result.isp}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 fetch 查询 IP 信息
async function queryIp(ip) {
  try {
    const response = await fetch(
      \`http://ip-api.com/json/\${ip}?lang=zh-CN\`
    );
    const data = await response.json();

    if (data.status === 'success') {
      return {
        ip: data.query,
        country: data.country,
        region: data.regionName,
        city: data.city,
        isp: data.isp,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone
      };
    }
    throw new Error('查询失败');
  } catch (error) {
    console.error('IP 查询错误:', error);
    return null;
  }
}

// 使用示例
const info = await queryIp('8.8.8.8');
console.log(info);
// { ip: "8.8.8.8", country: "United States", ... }`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import requests

def query_ip(ip: str) -> dict:
    """查询 IP 地址信息"""
    url = f"http://ip-api.com/json/{ip}?lang=zh-CN"

    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if data['status'] == 'success':
            return {
                'ip': data['query'],
                'country': data['country'],
                'region': data['regionName'],
                'city': data['city'],
                'isp': data['isp'],
                'lat': data['lat'],
                'lon': data['lon']
            }
        return {'error': '查询失败'}
    except Exception as e:
        return {'error': str(e)}

# 使用示例
info = query_ip('8.8.8.8')
print(info)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type IPInfo struct {
    Query       string  \`json:"query"\`
    Status      string  \`json:"status"\`
    Country     string  \`json:"country"\`
    RegionName  string  \`json:"regionName"\`
    City        string  \`json:"city"\`
    ISP         string  \`json:"isp"\`
    Lat         float64 \`json:"lat"\`
    Lon         float64 \`json:"lon"\`
}

func QueryIP(ip string) (*IPInfo, error) {
    url := fmt.Sprintf("http://ip-api.com/json/%s?lang=zh-CN", ip)

    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)

    var info IPInfo
    if err := json.Unmarshal(body, &info); err != nil {
        return nil, err
    }

    if info.Status != "success" {
        return nil, fmt.Errorf("查询失败")
    }

    return &info, nil
}

func main() {
    info, err := QueryIP("8.8.8.8")
    if err != nil {
        fmt.Println("错误:", err)
        return
    }
    fmt.Printf("%+v\\n", info)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class IpQuery {
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    public static JsonObject queryIp(String ip) throws Exception {
        String url = "http://ip-api.com/json/" + ip + "?lang=zh-CN";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .build();

        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        return gson.fromJson(response.body(), JsonObject.class);
    }

    public static void main(String[] args) throws Exception {
        JsonObject info = queryIp("8.8.8.8");
        System.out.println("IP: " + info.get("query"));
        System.out.println("国家: " + info.get("country"));
        System.out.println("城市: " + info.get("city"));
        System.out.println("ISP: " + info.get("isp"));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
