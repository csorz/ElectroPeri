import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

export default function DisplayPage() {
  return (
    <ElectronOnly>
      <DisplayPageContent />
    </ElectronOnly>
  )
}

function DisplayPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.display.info()
      setData(res)
      setPageSnapshot('display', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('display', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.display
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>显示设备 / GPU</h1>
        <p>Display & GPU - 显示器与图形处理器信息</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>显示器信息</h3>
                <p>获取分辨率、刷新率、缩放比例、色彩深度等显示参数</p>
              </div>
              <div className="feature-card">
                <h3>GPU 信息</h3>
                <p>获取显卡型号、显存、驱动版本、核心频率等信息</p>
              </div>
              <div className="feature-card">
                <h3>多屏支持</h3>
                <p>支持多显示器环境，获取每个显示器的独立配置</p>
              </div>
              <div className="feature-card">
                <h3>图形性能</h3>
                <p>监控 GPU 负载、温度、显存使用等性能指标</p>
              </div>
            </div>

            <h2>显示系统架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------------+     +------------------+
  |     GPU 核心     |     |     显存 VRAM    |
  +------------------+     +------------------+
  | - 渲染管线       |     | - 帧缓冲区       |
  | - 光栅化单元     |     | - 纹理缓存       |
  | - 计算单元       |     | - 顶点缓存       |
  +------------------+     +------------------+
            |                       |
            +-----------+-----------+
                        |
                        v
  +------------------------------------------------+
  |              显示输出接口                       |
  +------------------------------------------------+
  |  HDMI  |  DisplayPort  |  DVI  |  VGA (旧)    |
  +--------+---------------+-------+--------------+
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
  +------------+  +------------+  +------------+
  |  显示器 1  |  |  显示器 2  |  |  显示器 3  |
  +------------+  +------------+  +------------+
  | 1920x1080  |  | 2560x1440  |  | 3840x2160  |
  |  60 Hz     |  |  144 Hz    |  |  60 Hz     |
  +------------+  +------------+  +------------+
              `}</pre>
            </div>

            <h2>常见显示接口</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>接口</th>
                  <th>最大分辨率</th>
                  <th>刷新率</th>
                  <th>特点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HDMI 2.1</td>
                  <td>10K</td>
                  <td>120 Hz</td>
                  <td>支持 HDR、eARC、游戏模式</td>
                </tr>
                <tr>
                  <td>DP 2.0</td>
                  <td>16K</td>
                  <td>60 Hz</td>
                  <td>高带宽、支持多流传输</td>
                </tr>
                <tr>
                  <td>Thunderbolt</td>
                  <td>8K</td>
                  <td>60 Hz</td>
                  <td>数据+视频+供电</td>
                </tr>
                <tr>
                  <td>DVI-D</td>
                  <td>2560x1600</td>
                  <td>60 Hz</td>
                  <td>仅视频，逐渐淘汰</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>分辨率检测</h4>
                <p>自动检测最佳分辨率，优化显示效果</p>
              </div>
              <div className="scenario-card">
                <h4>GPU 监控</h4>
                <p>实时监控显卡负载，优化游戏或渲染性能</p>
              </div>
              <div className="scenario-card">
                <h4>多屏布局</h4>
                <p>检测多显示器配置，支持窗口管理优化</p>
              </div>
              <div className="scenario-card">
                <h4>硬件诊断</h4>
                <p>检测显卡型号和驱动版本，排查兼容性问题</p>
              </div>
            </div>

            <h2>GPU 厂商对比</h2>
            <div className="info-box">
              <strong>主流 GPU 厂商</strong>
              <ul>
                <li><strong>NVIDIA</strong> - GeForce/Quadro 系列，CUDA 加速，DLSS 技术</li>
                <li><strong>AMD</strong> - Radeon 系列，ROCm 开源生态，FSR 技术</li>
                <li><strong>Intel</strong> - Arc/Iris 系列，集成显卡，Quick Sync Video</li>
                <li><strong>Apple Silicon</strong> - M 系列芯片，Metal API，统一内存架构</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>显示设备信息采集</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '采集中...' : '采集'}
                </button>
              </div>

              {error && (
                <div className="step-info" style={{ background: '#ffebee', borderColor: '#ef5350' }}>
                  <p style={{ color: '#c62828' }}>错误: {error}</p>
                </div>
              )}

              {!data ? (
                <div className="step-info">
                  <p>点击"采集"获取显示器信息、GPU 信息</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>显示器</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>分辨率</th>
                        <th>缩放</th>
                        <th>旋转</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.displays || []).map((d: any) => (
                        <tr key={d.id}>
                          <td>{d.id}</td>
                          <td>
                            {d.size?.width} x {d.size?.height}
                          </td>
                          <td>{d.scaleFactor}</td>
                          <td>{d.rotation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h3 style={{ margin: '20px 0 12px', fontSize: '16px' }}>GPU 控制器</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {(data.graphics?.controllers || []).map((g: any, i: number) => (
                      <li key={i} style={{ padding: '10px', background: '#f5f5f5', marginBottom: '8px', borderRadius: '6px' }}>
                        {g.model || g.vendor || 'Unknown GPU'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const si = require('systeminformation');

// 获取显示器信息（Electron 环境）
const { screen } = require('electron');
const displays = screen.getAllDisplays();
displays.forEach(d => {
  console.log(\`显示器 ID: \${d.id}\`);
  console.log(\`  分辨率: \${d.size.width} x \${d.size.height}\`);
  console.log(\`  缩放比例: \${d.scaleFactor}\`);
  console.log(\`  旋转角度: \${d.rotation}\`);
});

// 获取 GPU 信息
async function getGpuInfo() {
  const graphics = await si.graphics();
  graphics.controllers.forEach(gpu => {
    console.log(\`GPU: \${gpu.model}\`);
    console.log(\`  厂商: \${gpu.vendor}\`);
    console.log(\`  显存: \${gpu.vram} MB\`);
    console.log(\`  驱动版本: \${gpu.driverVersion}\`);
  });
}

// 执行
getGpuInfo();`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import subprocess
import json

# Windows: 使用 wmic 获取 GPU 信息
def get_gpu_info_windows():
    result = subprocess.run(
        ['wmic', 'path', 'win32_VideoController', 'get', 'name,vram,driverversion', '/format:json'],
        capture_output=True, text=True
    )
    print(result.stdout)

# Linux: 读取 /proc 和 lspci
def get_gpu_info_linux():
    # 使用 lspci
    result = subprocess.run(['lspci'], capture_output=True, text=True)
    for line in result.stdout.split('\\n'):
        if 'VGA' in line or '3D' in line:
            print(f"GPU: {line}")

# macOS: 使用 system_profiler
def get_gpu_info_macos():
    result = subprocess.run(
        ['system_profiler', 'SPDisplaysDataType'],
        capture_output=True, text=True
    )
    print(result.stdout)

# 根据平台执行
import platform
if platform.system() == 'Windows':
    get_gpu_info_windows()
elif platform.system() == 'Linux':
    get_gpu_info_linux()
elif platform.system() == 'Darwin':
    get_gpu_info_macos()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain, screen } from 'electron';
import si from 'systeminformation';

// 注册 IPC 处理器
ipcMain.handle('display:info', async () => {
  const displays = screen.getAllDisplays();
  const graphics = await si.graphics();

  return {
    displays,
    graphics
  };
});

// 渲染进程调用
const result = await window.api.display.info();
console.log('显示设备信息:', result);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
