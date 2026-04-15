import { useState } from 'react'
import './ToolPage.css'

export default function SecurityToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔒 安全配置</h1>
        <p>端口、权限、防火墙、SSL证书</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>安全要点</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>端口管理</h3><p>最小开放原则，非必要不开放</p></div>
              <div className="feature-card"><h3>权限控制</h3><p>最小权限原则，避免 root 运行</p></div>
              <div className="feature-card"><h3>防火墙</h3><p>iptables/ufw/firewalld</p></div>
              <div className="feature-card"><h3>SSL/TLS</h3><p>HTTPS 加密传输</p></div>
            </div>

            <h2>常用端口</h2>
            <table className="comparison-table">
              <thead><tr><th>端口</th><th>服务</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>22</td><td>SSH</td><td>远程登录</td></tr>
                <tr><td>80</td><td>HTTP</td><td>Web 服务</td></tr>
                <tr><td>443</td><td>HTTPS</td><td>安全 Web</td></tr>
                <tr><td>3306</td><td>MySQL</td><td>数据库</td></tr>
                <tr><td>6379</td><td>Redis</td><td>缓存</td></tr>
                <tr><td>8080</td><td>Tomcat</td><td>应用服务</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>防火墙配置</h2>
            <div className="code-block">
              <pre>{`# ufw (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# firewalld (CentOS)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports

# iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables-save > /etc/iptables/rules.v4`}</pre>
            </div>

            <h2>SSL 证书 (Let's Encrypt)</h2>
            <div className="code-block">
              <pre>{`# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期
sudo certbot renew --dry-run

# Nginx SSL 配置
server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
