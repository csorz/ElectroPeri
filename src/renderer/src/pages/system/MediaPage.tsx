import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

export default function MediaPage() {
  return (
    <ElectronOnly>
      <MediaPageContent />
    </ElectronOnly>
  )
}

function MediaPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.media.devices()
      setData(res)
      setPageSnapshot('media', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('media', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.media
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
        <h1>音视频/外设</h1>
        <p>Media & Peripherals - 音频、视频设备与外设管理</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>音频设备</h3>
                <p>获取输入/输出音频设备，如麦克风、扬声器</p>
              </div>
              <div className="feature-card">
                <h3>视频设备</h3>
                <p>获取摄像头、采集卡等视频输入设备信息</p>
              </div>
              <div className="feature-card">
                <h3>USB 设备</h3>
                <p>列出所有 USB 设备，获取厂商、型号、VID/PID</p>
              </div>
              <div className="feature-card">
                <h3>图形设备</h3>
                <p>获取 GPU、显卡等图形处理设备信息</p>
              </div>
            </div>

            <h2>设备层次结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------------------------------------------+
  |                   系统总线                     |
  +------------------------------------------------+
          |                |                |
          v                v                v
  +---------------+ +---------------+ +---------------+
  |    USB 总线   | |   PCIe 总线   | |  音频控制器   |
  +---------------+ +---------------+ +---------------+
          |                |                |
    +-----+-----+    +-----+-----+    +-----+-----+
    |     |     |    |     |     |    |     |     |
    v     v     v    v     v     v    v     v     v
  +---+ +---+ +---++---+ +---+ +---++---+ +---+ +---+
  |键 | |鼠 | |摄 ||GPU| |网卡| |声 ||扬 | |麦 | |蓝 |
  |盘 | |标 | |像 ||   | |   | |卡 ||声 | |克 | |牙 |
  +---+ +---+ +---++---+ +---+ +---++---+ +---+ +---+
  |HID| |HID| |UVC||PCI| |PCI| |PCI||HDA| |HDA| |USB|
  +---+ +---+ +---++---+ +---+ +---++---+ +---+ +---+
              `}</pre>
            </div>

            <h2>设备类型对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>设备类型</th>
                  <th>接口</th>
                  <th>驱动</th>
                  <th>特点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>键盘/鼠标</td>
                  <td>USB/蓝牙</td>
                  <td>HID</td>
                  <td>低延迟，即插即用</td>
                </tr>
                <tr>
                  <td>摄像头</td>
                  <td>USB 3.0</td>
                  <td>UVC</td>
                  <td>标准协议，跨平台</td>
                </tr>
                <tr>
                  <td>音频设备</td>
                  <td>USB/HDA</td>
                  <td>USB Audio</td>
                  <td>数字/模拟混合</td>
                </tr>
                <tr>
                  <td>存储设备</td>
                  <td>USB/NVMe</td>
                  <td>Mass Storage</td>
                  <td>大容量，高速传输</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>音视频通话</h4>
                <p>枚举可用摄像头和麦克风，支持设备选择</p>
              </div>
              <div className="scenario-card">
                <h4>设备诊断</h4>
                <p>检测设备是否正常连接，排查驱动问题</p>
              </div>
              <div className="scenario-card">
                <h4>资产管理</h4>
                <p>收集外设信息，生成硬件清单报告</p>
              </div>
              <div className="scenario-card">
                <h4>权限管理</h4>
                <p>检测设备权限状态，申请必要权限</p>
              </div>
            </div>

            <h2>USB 设备标识</h2>
            <div className="info-box">
              <strong>VID/PID 解读</strong>
              <ul>
                <li><strong>VID (Vendor ID)</strong> - 厂商标识，由 USB-IF 分配，如 0x046D (罗技)</li>
                <li><strong>PID (Product ID)</strong> - 产品标识，厂商自行分配</li>
                <li><strong>序列号</strong> - 设备唯一标识，可用于授权绑定</li>
                <li><strong>设备类</strong> - 如 HID (0x03)、Audio (0x01)、Mass Storage (0x08)</li>
                <li><strong>USB 设备数据库</strong> - http://www.linux-usb.org/usb.ids 可查询厂商和设备信息</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>设备信息采集</h2>
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
                  <p>点击"采集"获取音频设备、图形设备、USB 设备等信息</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div className="feature-grid" style={{ marginBottom: '16px' }}>
                    <div className="feature-card">
                      <h3>音频设备</h3>
                      <p style={{ fontSize: '20px', fontWeight: 600 }}>{(data.audio || []).length}</p>
                    </div>
                    <div className="feature-card">
                      <h3>图形控制器</h3>
                      <p style={{ fontSize: '20px', fontWeight: 600 }}>{(data.graphics?.controllers || []).length}</p>
                    </div>
                    <div className="feature-card">
                      <h3>USB 设备</h3>
                      <p style={{ fontSize: '20px', fontWeight: 600 }}>{(data.usb || []).length}</p>
                    </div>
                  </div>

                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>音频设备</h3>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                    {(data.audio || []).slice(0, 20).map((a: any, i: number) => (
                      <li key={i} style={{ padding: '10px', background: '#f5f5f5', marginBottom: '8px', borderRadius: '6px' }}>
                        {a.name || a.driver || 'Unknown Audio Device'}
                      </li>
                    ))}
                  </ul>

                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>USB 设备</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>厂商</th>
                        <th>设备</th>
                        <th>VID:PID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.usb || []).slice(0, 20).map((u: any, i: number) => (
                        <tr key={i}>
                          <td>{u.manufacturer || '-'}</td>
                          <td>{u.name || '-'}</td>
                          <td>{u.idVendor || '-'}:{u.idProduct || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

// 获取音频设备
async function getAudioDevices() {
  const audio = await si.audio();
  console.log('音频设备:');
  audio.forEach(a => {
    console.log(\`  名称: \${a.name}\`);
    console.log(\`  类型: \${a.type}\`);
    console.log(\`  状态: \${a.status}\`);
    console.log(\`  默认: \${a.default}\`);
  });
}

// 获取 USB 设备
async function getUsbDevices() {
  const usb = await si.usb();
  console.log('USB 设备:');
  usb.forEach(u => {
    console.log(\`  设备: \${u.name}\`);
    console.log(\`  厂商: \${u.manufacturer}\`);
    console.log(\`  VID:PID: \${u.vendor}: \${u.product}\`);
  });
}

// 获取图形设备
async function getGraphicsDevices() {
  const graphics = await si.graphics();
  console.log('图形控制器:');
  graphics.controllers.forEach(g => {
    console.log(\`  型号: \${g.model}\`);
    console.log(\`  厂商: \${g.vendor}\`);
    console.log(\`  显存: \${g.vram} MB\`);
  });
}

// 执行
(async () => {
  await getAudioDevices();
  await getUsbDevices();
  await getGraphicsDevices();
})();`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import subprocess
import platform

# Linux: 使用 lsusb 获取 USB 设备
def get_usb_devices_linux():
    result = subprocess.run(['lsusb'], capture_output=True, text=True)
    for line in result.stdout.split('\\n'):
        if line.strip():
            print(line)

# Linux: 使用 arecord/aplay 获取音频设备
def get_audio_devices_linux():
    # 录音设备
    print("录音设备:")
    result = subprocess.run(['arecord', '-l'], capture_output=True, text=True)
    print(result.stdout)
    # 播放设备
    print("播放设备:")
    result = subprocess.run(['aplay', '-l'], capture_output=True, text=True)
    print(result.stdout)

# Windows: 使用 wmic
def get_usb_devices_windows():
    result = subprocess.run(
        ['wmic', 'path', 'Win32_PnPEntity', 'where', 'DeviceID like "USB%"', 'get', 'Name,DeviceID', '/format:csv'],
        capture_output=True, text=True
    )
    print(result.stdout)

# macOS: 使用 system_profiler
def get_usb_devices_macos():
    result = subprocess.run(
        ['system_profiler', 'SPUSBDataType'],
        capture_output=True, text=True
    )
    print(result.stdout)

# 根据平台执行
if platform.system() == 'Linux':
    get_usb_devices_linux()
    get_audio_devices_linux()
elif platform.system() == 'Windows':
    get_usb_devices_windows()
elif platform.system() == 'Darwin':
    get_usb_devices_macos()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain, desktopCapturer, systemPreferences } from 'electron';
import si from 'systeminformation';

// 获取媒体设备
ipcMain.handle('media:devices', async () => {
  const [audio, graphics, usb] = await Promise.all([
    si.audio(),
    si.graphics(),
    si.usb()
  ]);

  return {
    audio,
    graphics,
    usb
  };
});

// 获取摄像头列表（需要权限）
ipcMain.handle('media:cameras', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });
  return sources;
});

// 检查媒体权限（macOS）
ipcMain.handle('media:checkPermission', async (event, type) => {
  if (process.platform === 'darwin') {
    return systemPreferences.getMediaAccessPermission(type);
  }
  return true;
});

// 申请媒体权限（macOS）
ipcMain.handle('media:requestPermission', async (event, type) => {
  if (process.platform === 'darwin') {
    return systemPreferences.askForMediaAccessPermission(type);
  }
  return true;
});

// 渲染进程调用
const devices = await window.api.media.devices();
console.log('媒体设备:', devices);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
