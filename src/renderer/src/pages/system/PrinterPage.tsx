import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

export default function PrinterPage() {
  return (
    <ElectronOnly>
      <PrinterPageContent />
    </ElectronOnly>
  )
}

function PrinterPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.printer.list()
      setPrinters(list as any[])
      setPageSnapshot('printer', { data: list, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取失败'
      setError(msg)
      setPageSnapshot('printer', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.printer
    if (snapshot?.data) {
      setPrinters(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>打印机</h1>
        <p>Printer - 系统打印机管理与打印任务控制</p>
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
                <h3>打印机列表</h3>
                <p>获取系统已安装的所有打印机设备信息</p>
              </div>
              <div className="feature-card">
                <h3>默认打印机</h3>
                <p>识别系统默认打印机，支持设置默认打印设备</p>
              </div>
              <div className="feature-card">
                <h3>打印状态</h3>
                <p>获取打印机在线/离线状态、错误状态等信息</p>
              </div>
              <div className="feature-card">
                <h3>打印任务</h3>
                <p>监控打印队列，支持取消、暂停打印任务</p>
              </div>
            </div>

            <h2>打印机类型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------------------------------------------+
  |                    打印机类型                  |
  +------------------------------------------------+
            |
    +-------+-------+-------+-------+-------+
    |       |       |       |       |       |
    v       v       v       v       v       v
  +----+ +----+ +----+ +----+ +----+ +----+
  |本地| |网络| |虚拟| |云打| |3D  | |热敏|
  +----+ +----+ +----+ +----+ +----+ +----+
    |       |       |       |       |       |
    v       v       v       v       v       v
  USB    IP/SMB   PDF    云服务  模型   小票
  并口    AirPrint XPS   打印   文件   标签
              `}</pre>
            </div>

            <h2>打印机状态</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>状态</th>
                  <th>说明</th>
                  <th>可操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ready</td>
                  <td>就绪，可以打印</td>
                  <td>发送打印任务</td>
                </tr>
                <tr>
                  <td>Printing</td>
                  <td>正在打印</td>
                  <td>等待完成</td>
                </tr>
                <tr>
                  <td>Offline</td>
                  <td>离线，不可用</td>
                  <td>检查连接</td>
                </tr>
                <tr>
                  <td>Error</td>
                  <td>错误状态</td>
                  <td>检查故障</td>
                </tr>
                <tr>
                  <td>Paused</td>
                  <td>已暂停</td>
                  <td>恢复打印</td>
                </tr>
                <tr>
                  <td>Out of Paper</td>
                  <td>缺纸</td>
                  <td>添加纸张</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>文档打印</h4>
                <p>快速打印文档、报告、发票等纸质材料</p>
              </div>
              <div className="scenario-card">
                <h4>批量打印</h4>
                <p>批量处理打印任务，支持队列管理</p>
              </div>
              <div className="scenario-card">
                <h4>设备管理</h4>
                <p>统一管理多个打印机设备，监控状态</p>
              </div>
              <div className="scenario-card">
                <h4>票据打印</h4>
                <p>小票打印机、标签打印机专用场景</p>
              </div>
            </div>

            <h2>打印流程</h2>
            <div className="info-box">
              <strong>打印任务流程</strong>
              <ul>
                <li><strong>1. 选择打印机</strong> - 获取可用打印机列表，选择目标设备</li>
                <li><strong>2. 设置参数</strong> - 纸张大小、方向、份数、颜色等</li>
                <li><strong>3. 发送任务</strong> - 将文档发送到打印队列</li>
                <li><strong>4. 监控进度</strong> - 实时监控打印状态和进度</li>
                <li><strong>5. 完成确认</strong> - 打印完成通知或错误处理</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>打印机信息采集</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '获取中...' : '获取列表'}
                </button>
              </div>

              {error && (
                <div className="step-info" style={{ background: '#ffebee', borderColor: '#ef5350' }}>
                  <p style={{ color: '#c62828' }}>错误: {error}</p>
                </div>
              )}

              {printers.length === 0 ? (
                <div className="step-info">
                  <p>点击"获取列表"读取系统打印机</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>打印机列表 ({printers.length})</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>名称</th>
                        <th>状态</th>
                        <th>默认</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printers.map((p, i) => (
                        <tr key={i}>
                          <td>{p.name}</td>
                          <td>{p.status || '-'}</td>
                          <td>{p.isDefault ? '是' : '否'}</td>
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
              <pre>{`const { ipcRenderer } = require('electron');

// 获取打印机列表
const printers = await ipcRenderer.invoke('get-printers');
printers.forEach(p => {
  console.log(\`名称: \${p.name}\`);
  console.log(\`  状态: \${p.status}\`);
  console.log(\`  默认: \${p.isDefault}\`);
  console.log(\`  描述: \${p.description}\`);
});

// 使用 electron-pdf 打印 PDF
const { webContents } = require('electron');
webContents.print({
  silent: false,
  printBackground: true,
  deviceName: 'HP-LaserJet'
}, (success, errorType) => {
  if (success) {
    console.log('打印成功');
  } else {
    console.log('打印失败:', errorType);
  }
});`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import subprocess
import platform

# Windows: 使用 wmic 获取打印机信息
def get_printers_windows():
    result = subprocess.run(
        ['wmic', 'printer', 'get', 'name,status,default', '/format:csv'],
        capture_output=True, text=True
    )
    print(result.stdout)

# macOS: 使用 lpstat
def get_printers_macos():
    result = subprocess.run(['lpstat', '-p'], capture_output=True, text=True)
    for line in result.stdout.split('\\n'):
        if line.strip():
            print(line)

# Linux: 使用 lpstat
def get_printers_linux():
    result = subprocess.run(['lpstat', '-a'], capture_output=True, text=True)
    for line in result.stdout.split('\\n'):
        if line.strip():
            print(line)

# 打印文件
def print_file(filepath, printer_name=None):
    if platform.system() == 'Windows':
        cmd = ['print', filepath]
        if printer_name:
            cmd.extend(['/D:', printer_name])
    else:
        cmd = ['lpr']
        if printer_name:
            cmd.extend(['-P', printer_name])
        cmd.append(filepath)
    subprocess.run(cmd)

# 根据平台执行
if platform.system() == 'Windows':
    get_printers_windows()
elif platform.system() == 'Darwin':
    get_printers_macos()
else:
    get_printers_linux()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain, BrowserWindow } from 'electron';

// 获取打印机列表
ipcMain.handle('printer:list', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return win?.webContents.getPrintersAsync();
});

// 打印当前页面
ipcMain.handle('printer:print', async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return new Promise((resolve, reject) => {
    win?.webContents.print(options, (success, errorType) => {
      if (success) {
        resolve({ success: true });
      } else {
        reject(new Error(errorType));
      }
    });
  });
});

// 打印 PDF 文件
ipcMain.handle('printer:printPDF', async (event, pdfPath, options) => {
  const win = new BrowserWindow({ show: false });
  await win.loadFile(pdfPath);
  return new Promise((resolve, reject) => {
    win.webContents.print(options, (success, errorType) => {
      win.close();
      if (success) {
        resolve({ success: true });
      } else {
        reject(new Error(errorType));
      }
    });
  });
});

// 渲染进程调用
const printers = await window.api.printer.list();
console.log('打印机列表:', printers);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
