# BLE 广播扫描页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 ElectroPeri 中实现 BLE 广播扫描页面，用户输入 TARGET_COMPANY_ID 和 TARGET_NAME，控制开始/停止扫描，实时显示扫描到的设备数据。

**Architecture:** 在现有 bluetooth.ts handler 中扩展 3 个 IPC 通道（ble-scan:start/stop/data），preload 层新增 bleScan API，渲染层新建 BleScanPage.tsx 页面。使用 @abandonware/noble 持续扫描模式（allow duplicates），按 companyId + name 过滤设备，推送原始 manufacturerData 到前端展示。

**Tech Stack:** Electron IPC, @abandonware/noble, React, TypeScript, Zustand

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/main/handlers/bluetooth.ts` | 新增 ble-scan:start/stop IPC 通道，持续扫描逻辑 |
| Modify | `src/preload/index.ts` | 新增 bleScan API 对象 |
| Modify | `src/preload/index.d.ts` | 新增 BleScanApi 类型声明 |
| Create | `src/renderer/src/pages/industrial/BleScanPage.tsx` | BLE 广播扫描页面组件 |
| Modify | `src/renderer/src/App.tsx` | 新增 /ble-scan 路由 |
| Modify | `src/renderer/src/components/Layout.tsx` | P1 侧边栏新增导航项 |

---

### Task 1: 主进程 - 新增 BLE 扫描 IPC 通道

**Files:**
- Modify: `src/main/handlers/bluetooth.ts`

- [ ] **Step 1: 在 bluetooth.ts 中添加 BLE 扫描状态变量和 discover 监听器引用**

在文件顶部现有变量之后（约 line 24，`let bluetoothModuleError` 之后），添加：

```typescript
// BLE 广播扫描状态
let bleScanActive = false
let bleScanDiscoverHandler: ((peripheral: any) => void) | null = null
```

- [ ] **Step 2: 在 setupBluetoothHandlers 函数末尾添加 ble-scan:start 和 ble-scan:stop 处理器**

在 `setupBluetoothHandlers()` 函数的最后一个 `ipcMain.handle`（`bluetooth:discoverServices`）之后，添加：

```typescript
  // BLE 广播扫描 - 开始
  ipcMain.handle('ble-scan:start', async (event, companyIdStr: string, targetName: string) => {
    const n = await ensureNoble()
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (bleScanActive) {
      return { success: true, message: 'already scanning' }
    }

    await waitPoweredOn(n)

    // 解析 companyId，支持 "0x1012" 和 "4114" 两种格式
    const companyId = companyIdStr.startsWith('0x') || companyIdStr.startsWith('0X')
      ? parseInt(companyIdStr, 16)
      : parseInt(companyIdStr, 10)

    if (isNaN(companyId)) {
      throw new Error(`无效的 Company ID: ${companyIdStr}`)
    }

    bleScanDiscoverHandler = (peripheral: any) => {
      const ad = peripheral.advertisement
      const addr = peripheral.address || peripheral.id

      // 过滤逻辑：companyId 匹配 manufacturerData 或 name 前缀匹配
      let matched = false

      if (targetName && ad.localName && ad.localName.startsWith(targetName)) {
        matched = true
      }

      if (!matched && ad.manufacturerData && ad.manufacturerData.length >= 2) {
        const buf = Buffer.isBuffer(ad.manufacturerData) ? ad.manufacturerData : Buffer.from(ad.manufacturerData)
        const mfrCompanyId = buf.readUInt16LE(0)
        if (mfrCompanyId === companyId) {
          matched = true
        }
      }

      if (!matched) return

      // 构造推送数据
      const mfrDataHex = ad.manufacturerData
        ? (Buffer.isBuffer(ad.manufacturerData) ? ad.manufacturerData : Buffer.from(ad.manufacturerData)).toString('hex')
        : ''

      mainWindow?.webContents.send('ble-scan:data', {
        mac: addr,
        name: ad.localName || '',
        rssi: peripheral.rssi,
        manufacturerData: mfrDataHex,
        timestamp: new Date().toISOString()
      })
    }

    n.on('discover', bleScanDiscoverHandler)
    n.startScanning([], true) // true = allow duplicates
    bleScanActive = true

    return { success: true }
  })

  // BLE 广播扫描 - 停止
  ipcMain.handle('ble-scan:stop', async () => {
    const n = await ensureNoble()

    if (!bleScanActive) {
      return { success: true, message: 'not scanning' }
    }

    if (bleScanDiscoverHandler) {
      n.removeListener('discover', bleScanDiscoverHandler)
      bleScanDiscoverHandler = null
    }

    n.stopScanning()
    bleScanActive = false

    return { success: true }
  })
```

- [ ] **Step 3: Commit**

```bash
git add src/main/handlers/bluetooth.ts
git commit -m "feat: add ble-scan IPC channels for continuous BLE advertisement scanning"
```

---

### Task 2: Preload 层 - 新增 bleScan API

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`

- [ ] **Step 1: 在 preload/index.ts 中添加 bleScan API 对象**

在 `bluetoothApi` 对象定义之后（约 line 71），添加：

```typescript
// BLE Scan API
const bleScanApi = {
  start: (companyId: string, targetName: string) => ipcRenderer.invoke('ble-scan:start', companyId, targetName),
  stop: () => ipcRenderer.invoke('ble-scan:stop'),
  onData: (callback: (device: { mac: string; name: string; rssi: number; manufacturerData: string; timestamp: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, device: { mac: string; name: string; rssi: number; manufacturerData: string; timestamp: string }) => callback(device)
    ipcRenderer.on('ble-scan:data', handler)
    return () => ipcRenderer.removeListener('ble-scan:data', handler)
  }
}
```

- [ ] **Step 2: 在 api 对象中注册 bleScan**

在 `const api = {` 块中（约 line 300），在 `bluetooth: bluetoothApi,` 行之后添加：

```typescript
  bleScan: bleScanApi,
```

- [ ] **Step 3: 在 preload/index.d.ts 中添加 BleScanApi 接口**

在 `BluetoothApi` 接口之后（约 line 74），添加：

```typescript
interface BleScanDevice {
  mac: string
  name: string
  rssi: number
  manufacturerData: string
  timestamp: string
}

interface BleScanApi {
  start: (companyId: string, targetName: string) => Promise<{ success: boolean; message?: string }>
  stop: () => Promise<{ success: boolean; message?: string }>
  onData: (callback: (device: BleScanDevice) => void) => () => void
}
```

- [ ] **Step 4: 在 Api 接口中注册 bleScan**

在 `interface Api {` 块中（约 line 301），在 `bluetooth: BluetoothApi` 行之后添加：

```typescript
  bleScan: BleScanApi
```

- [ ] **Step 5: 在 export type 行中导出 BleScanApi**

修改底部的 export type 行（约 line 336）：

```typescript
export type { SerialApi, UsbApi, BluetoothApi, BleScanApi, BleScanDevice, NetworkApi, HidApi, Api, MqttApi }
```

- [ ] **Step 6: Commit**

```bash
git add src/preload/index.ts src/preload/index.d.ts
git commit -m "feat: add bleScan API to preload bridge with type declarations"
```

---

### Task 3: 渲染层 - 新建 BLE 扫描页面

**Files:**
- Create: `src/renderer/src/pages/industrial/BleScanPage.tsx`

- [ ] **Step 1: 创建 BleScanPage.tsx**

```tsx
import { useEffect, useState, useRef } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

interface ScanDevice {
  mac: string
  name: string
  rssi: number
  manufacturerData: string
  timestamp: string
}

export default function BleScanPage() {
  return (
    <ElectronOnly>
      <BleScanPageContent />
    </ElectronOnly>
  )
}

function BleScanPageContent() {
  const [companyId, setCompanyId] = useState('0x1012')
  const [targetName, setTargetName] = useState('XJ_T01')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<Map<string, ScanDevice>>(new Map())
  const [moduleAvailable, setModuleAvailable] = useState<boolean | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // 检查蓝牙模块是否可用
  useEffect(() => {
    const checkModule = async () => {
      try {
        const result = await window.api.bluetooth.check()
        setModuleAvailable(result.available)
        if (!result.available && result.error) {
          setModuleError(result.error)
        }
      } catch {
        setModuleAvailable(false)
        setModuleError('无法检查蓝牙模块状态')
      }
    }
    checkModule()
  }, [])

  // 组件卸载时停止扫描
  useEffect(() => {
    return () => {
      if (scanning) {
        window.api.bleScan.stop().catch(() => {})
      }
      cleanupRef.current?.()
    }
  }, [])

  const handleStartScan = async () => {
    if (!companyId.trim()) {
      setError('请输入 Company ID')
      return
    }
    setError(null)
    try {
      await window.api.bleScan.start(companyId.trim(), targetName.trim())
      setScanning(true)

      // 监听扫描数据
      const cleanup = window.api.bleScan.onData((device: ScanDevice) => {
        setDevices(prev => {
          const next = new Map(prev)
          next.set(device.mac, device)
          return next
        })
      })
      cleanupRef.current = cleanup
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动扫描失败')
      setScanning(false)
    }
  }

  const handleStopScan = async () => {
    try {
      cleanupRef.current?.()
      cleanupRef.current = null
      await window.api.bleScan.stop()
      setScanning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止扫描失败')
    }
  }

  const handleClear = () => {
    setDevices(new Map())
  }

  // 按更新时间倒序排列
  const sortedDevices = Array.from(devices.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getRssiColor = (rssi: number) => {
    if (rssi >= -50) return '#4caf50'
    if (rssi >= -60) return '#8bc34a'
    if (rssi >= -70) return '#ffeb3b'
    if (rssi >= -80) return '#ff9800'
    return '#f44336'
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString()
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📡 BLE 广播扫描</h1>
        <p>扫描 BLE 设备广播数据，按 Company ID / 设备名过滤</p>
      </div>

      <div className="tool-content">
        <div className="demo-section">
          {/* 模块不可用警告 */}
          {moduleAvailable === false && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffcc80' }}>
              <div style={{ fontWeight: 500, color: '#e65100', marginBottom: 8 }}>⚠️ 蓝牙模块不可用</div>
              <div style={{ fontSize: 13, color: '#666' }}>{moduleError}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                请安装 Visual Studio Build Tools 后运行: pnpm rebuild @abandonware/noble
              </div>
            </div>
          )}

          {/* 配置区 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>TARGET_COMPANY_ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="0x1012"
                disabled={scanning}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 140, fontFamily: 'Consolas, monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>TARGET_NAME</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="XJ_T01"
                disabled={scanning}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 140, fontFamily: 'Consolas, monospace' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {scanning ? (
                <button
                  onClick={handleStopScan}
                  style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                >
                  停止扫描
                </button>
              ) : (
                <button
                  onClick={handleStartScan}
                  disabled={moduleAvailable === false}
                  style={{ padding: '8px 20px', background: moduleAvailable === false ? '#ccc' : '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: moduleAvailable === false ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                >
                  开始扫描
                </button>
              )}
              <button
                onClick={handleClear}
                style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                清空
              </button>
            </div>
          </div>

          {/* 状态指示 */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: scanning ? '#4caf50' : '#ccc',
              animation: scanning ? 'pulse 1.5s infinite' : 'none'
            }} />
            <span>
              {scanning ? `扫描中 (Company ID: ${companyId}, Name: ${targetName || '*'})` : '未扫描'}
            </span>
            <span style={{ marginLeft: 12, color: '#888' }}>
              设备数: {devices.size}
            </span>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
              <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {error}</div>
            </div>
          )}

          {/* 数据表格 */}
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
            {sortedDevices.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
                {scanning ? '等待扫描结果...' : '配置参数后点击"开始扫描"'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>MAC</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>设备名</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>RSSI</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>ManufacturerData</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDevices.map((device) => (
                      <tr key={device.mac} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 12 }}>{device.mac}</td>
                        <td style={{ padding: '8px 12px' }}>{device.name || '-'}</td>
                        <td style={{ padding: '8px 12px', color: getRssiColor(device.rssi), fontWeight: 500 }}>{device.rssi} dBm</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 11, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.manufacturerData || '-'}</td>
                        <td style={{ padding: '8px 12px', color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>{formatTime(device.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/pages/industrial/BleScanPage.tsx
git commit -m "feat: add BleScanPage for BLE advertisement scanning"
```

---

### Task 4: 路由与导航 - 注册页面

**Files:**
- Modify: `src/renderer/src/App.tsx`
- Modify: `src/renderer/src/components/Layout.tsx`

- [ ] **Step 1: 在 App.tsx 中添加 import 和 Route**

在 P1 工业核心接口的 import 区域（约 line 181，`import BluetoothPage` 之后），添加：

```typescript
import BleScanPage from './pages/industrial/BleScanPage'
```

在 Route 区域（约 line 213，`<Route path="bluetooth"` 行之后），添加：

```tsx
          <Route path="ble-scan" element={<BleScanPage />} />
```

- [ ] **Step 2: 在 Layout.tsx 中添加侧边栏导航项**

在 P1 工业核心接口的 items 数组中（约 line 289，`{ to: '/bluetooth', ... }` 行之后），添加：

```typescript
      { to: '/ble-scan', icon: '📡', label: 'BLE广播扫描' },
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/App.tsx src/renderer/src/components/Layout.tsx
git commit -m "feat: register BleScanPage route and sidebar navigation"
```

---

### Task 5: 验证构建

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
cd d:/csApps/Github-cs/ElectroPeri && npx tsc --noEmit -p tsconfig.node.json --composite false && npx tsc --noEmit -p tsconfig.web.json --composite false
```

Expected: 无类型错误

- [ ] **Step 2: 运行 electron-vite build 验证打包**

```bash
cd d:/csApps/Github-cs/ElectroPeri && npx electron-vite build
```

Expected: 构建成功

- [ ] **Step 3: Commit (if any fixes were needed)**

If typecheck or build required fixes, commit them:

```bash
git add -A
git commit -m "fix: resolve typecheck/build issues for BLE scan page"
```
