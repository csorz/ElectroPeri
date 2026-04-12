import { useState } from 'react'
import './ToolPage.css'

export default function LinuxToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐧 Linux 运维</h1>
        <p>常用命令、性能分析、故障排查</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>常用命令速查</h2>
            <table className="comparison-table">
              <thead><tr><th>类别</th><th>命令</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>文件</td><td>ls, cd, cp, mv, rm</td><td>文件操作</td></tr>
                <tr><td>查看</td><td>cat, less, head, tail</td><td>文件查看</td></tr>
                <tr><td>搜索</td><td>grep, find, awk, sed</td><td>文本处理</td></tr>
                <tr><td>进程</td><td>ps, top, htop, kill</td><td>进程管理</td></tr>
                <tr><td>网络</td><td>netstat, ss, curl, wget</td><td>网络诊断</td></tr>
                <tr><td>磁盘</td><td>df, du, mount, fdisk</td><td>磁盘管理</td></tr>
              </tbody>
            </table>

            <h2>性能分析</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>CPU</h4><p>top, mpstat, vmstat</p></div>
              <div className="scenario-card"><h4>内存</h4><p>free, vmstat, smem</p></div>
              <div className="scenario-card"><h4>磁盘</h4><p>iostat, iotop, df</p></div>
              <div className="scenario-card"><h4>网络</h4><p>iftop, nethogs, sar</p></div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>常用命令</h2>
            <div className="code-block">
              <pre>{`# 查看系统信息
uname -a              # 内核版本
cat /etc/os-release   # 系统版本

# CPU 信息
lscpu                 # CPU 详细信息
cat /proc/cpuinfo     # CPU 核心数

# 内存信息
free -h               # 内存使用情况
cat /proc/meminfo     # 内存详细信息

# 磁盘信息
df -h                 # 磁盘使用情况
du -sh *              # 目录大小

# 进程管理
ps aux | grep nginx   # 查找进程
kill -9 PID           # 强制终止
kill -HUP PID         # 平滑重启

# 网络诊断
netstat -tlnp         # 监听端口
ss -tlnp              # 现代替代
curl -I http://url    # HTTP 头

# 日志查看
tail -f /var/log/syslog  # 实时查看
grep "error" /var/log/*  # 搜索错误`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
