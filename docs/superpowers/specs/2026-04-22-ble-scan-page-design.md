# BLE 广播扫描页面设计

## 概述

参照 `scan-abandonware-noble.js` 实现 BLE 广播扫描功能页面。用户输入 TARGET_COMPANY_ID 和 TARGET_NAME，控制开始/停止扫描，实时显示扫描到的设备数据。

## 方案选择

**方案 A：复用现有 bluetooth handler，扩展 IPC 通道**

在现有 `src/main/handlers/bluetooth.ts` 中新增 `ble-scan:start` / `ble-scan:stop` / `ble-scan:data` 三个 IPC 通道，实现持续广播扫描。复用 noble 模块加载逻辑，避免重复处理 native 模块错误和 noble 单例冲突。

## 架构

```
渲染进程 (BleScanPage.tsx)
  ├── 输入区：TARGET_COMPANY_ID / TARGET_NAME
  ├── 控制区：开始/停止扫描按钮
  ├── 数据表格：扫描结果列表
  └── IPC → preload.bleScan.start/stop/onData

Preload 层
  └── bleScan: { start, stop, onData }

主进程 (bluetooth.ts 扩展)
  └── noble 持续扫描模式
      ├── ble-scan:start → 开始扫描，按 COMPANY_ID + NAME 过滤
      ├── ble-scan:stop → 停止扫描
      └── ble-scan:data → 发现设备时推送数据到渲染进程
```

## 主进程：扫描逻辑

在现有 `bluetooth.ts` 中新增：

### `ble-scan:start`

- 接收参数：`{ companyId: string, targetName: string }`
- 启动 noble 持续扫描（`startScanning([], true)`，允许重复广播）
- 监听 `discover` 事件，按条件过滤：
  - `companyId` 匹配 manufacturerData 前 2 字节（小端序）
  - `targetName` 匹配设备名前缀
  - 两个条件满足其一即通过
- 匹配的设备解析 manufacturerData 后通过 `ble-scan:data` 推送到渲染进程

### `ble-scan:stop`

- 调用 `noble.stopScanning()`
- 移除 discover 监听器

### `ble-scan:data` 推送数据结构

```typescript
interface BleScanDevice {
  mac: string          // 设备 MAC 地址
  name: string         // 设备名
  rssi: number         // 信号强度
  manufacturerData: string  // 原始 manufacturerData hex
  timestamp: string    // ISO 时间戳
}
```

不解析具体字段，直接返回原始 manufacturerData hex 字符串，由前端展示。

## Preload 层

在 `window.api` 中新增 `bleScan` 命名空间：

```typescript
interface BleScanApi {
  start: (companyId: string, targetName: string) => Promise<{ success: boolean }>
  stop: () => Promise<{ success: boolean }>
  onData: (callback: (device: BleScanDevice) => void) => () => void
}
```

## 渲染进程：页面 UI

### 文件

`src/renderer/src/pages/industrial/BleScanPage.tsx`

### 路由

`/ble-scan`，注册在 P1 工业核心接口分组

### 页面布局

1. **顶部配置区**：
   - TARGET_COMPANY_ID 输入框（默认值 `0x1012`）
   - TARGET_NAME 输入框（默认值 `XJ_T01`）
   - 开始扫描 / 停止扫描 按钮

2. **状态指示**：蓝牙适配器状态 + 扫描状态

3. **数据表格**：
   - 列：MAC、设备名、RSSI、ManufacturerData (hex)、更新时间
   - 同一 MAC 的设备更新数据而非新增行（用 Map 去重）
   - 表格按更新时间倒序排列

### 侧边栏

在 Layout.tsx 的 P1 分组中新增导航项：`{ to: '/ble-scan', icon: '📡', label: 'BLE广播扫描' }`

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/main/handlers/bluetooth.ts` | 新增 ble-scan:start/stop IPC 通道 |
| `src/preload/index.ts` | 新增 bleScan API 对象 |
| `src/preload/index.d.ts` | 新增 BleScanApi 类型声明 |
| `src/renderer/src/pages/industrial/BleScanPage.tsx` | 新建页面 |
| `src/renderer/src/App.tsx` | 新增路由 |
| `src/renderer/src/components/Layout.tsx` | 新增侧边栏导航项 |
