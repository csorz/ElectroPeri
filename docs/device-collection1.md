# Electron 设备数据采集能力

本文档整理了 Electron 应用中可采集的设备数据类型及对应的实现方案。

## 已规划的数据采集方式

- 串口通信 (Serial Port)
- 蓝牙 (Bluetooth)
- USB 设备

---

## 其他可采集的设备数据

### 1. 系统信息

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 操作系统信息 | OS 类型、版本、架构 | `os` 模块 / `process` 对象 |
| CPU 信息 | 型号、核心数、使用率 | `os.cpus()`, `os.loadavg()` |
| 内存信息 | 总内存、可用内存 | `os.totalmem()`, `os.freemem()` |
| 主机信息 | 主机名、平台、用户目录 | `os.hostname()`, `os.homedir()` |
| 网络接口 | IP 地址、MAC 地址 | `os.networkInterfaces()` |

**推荐库**: `systeminformation`

```bash
pnpm add systeminformation
```

```typescript
import si from 'systeminformation';

// 获取系统信息
const cpu = await si.cpu();
const mem = await si.mem();
const osInfo = await si.osInfo();
```

---

### 2. 硬件传感器

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 温度传感器 | CPU/GPU/硬盘温度 | `systeminformation` |
| 风扇转速 | 风扇状态和转速 | `systeminformation` |
| 电池状态 | 电量、充电状态、健康度 | Electron `powerMonitor` API |
| 电源管理 | 电源状态、休眠/唤醒事件 | `powerMonitor` API |

```typescript
import { powerMonitor } from 'electron';

// 电池状态
powerMonitor.on('on-battery', () => {});
powerMonitor.on('on-ac', () => {});

// 系统休眠/唤醒
powerMonitor.on('suspend', () => {});
powerMonitor.on('resume', () => {});
```

---

### 3. 网络设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 网络接口列表 | 所有网卡信息 | `os.networkInterfaces()` |
| 网络连接状态 | 在线/离线状态 | `navigator.onLine` / `online` 事件 |
| 网络速度 | 上传/下载速度 | `systeminformation` |
| WiFi 信息 | SSID、信号强度、加密方式 | `node-wifi` 库 |
| 网络邻居 | 局域网设备发现 | ARP 表扫描 |

**推荐库**:
- `systeminformation` - 网络接口详情
- `node-wifi` - WiFi 管理

```bash
pnpm add node-wifi
```

---

### 4. 存储设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 磁盘信息 | 容量、已用空间、类型 | `systeminformation` |
| 挂载点 | 磁盘挂载路径 | `systeminformation` |
| 文件系统 | 文件系统类型 | `systeminformation` |
| 可移动存储 | U盘、SD卡检测 | 系统事件监听 |

```typescript
import si from 'systeminformation';

// 磁盘信息
const disks = await si.fsSize();
const blockDevices = await si.blockDevices();
```

---

### 5. 显示设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 显示器信息 | 分辨率、刷新率、色彩深度 | Electron `screen` API |
| 多显示器 | 所有显示器配置 | `screen.getAllDisplays()` |
| 显示器变化 | 连接/断开事件 | `screen` 事件监听 |
| GPU 信息 | 显卡型号、显存 | `app.getGPUFeatureStatus()` |

```typescript
import { screen, app } from 'electron';

// 显示器信息
const primaryDisplay = screen.getPrimaryDisplay();
const allDisplays = screen.getAllDisplays();

// 显示器变化事件
screen.on('display-added', (event, newDisplay) => {});
screen.on('display-removed', (event, oldDisplay) => {});

// GPU 信息
const gpuInfo = await app.getGPUInfo('complete');
```

---

### 6. 音频设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 音频输入设备 | 麦克风列表 | Web Audio API + `navigator.mediaDevices` |
| 音频输出设备 | 扬声器/耳机列表 | Web Audio API |
| 音频电平 | 实时音量检测 | Web Audio API `AnalyserNode` |
| 系统音量 | 音量大小、静音状态 | `loudness` 库 (需要 native 模块) |

```typescript
// 获取设备列表
const devices = await navigator.mediaDevices.enumerateDevices();
const audioInputs = devices.filter(d => d.kind === 'audioinput');
const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
```

---

### 7. 输入设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 键盘事件 | 按键记录、快捷键 | Electron `globalShortcut` / Web 事件 |
| 鼠标事件 | 点击、移动、滚轮 | Web 事件 / `robotjs` 库 |
| 游戏手柄 | 手柄连接、按键、摇杆 | Gamepad API |
| 触摸屏 | 触摸事件 | Web Touch Events |

```typescript
import { globalShortcut } from 'electron';

// 全局快捷键
globalShortcut.register('CommandOrControl+X', () => {
  // 处理快捷键
});

// 游戏手柄 (渲染进程)
window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad);
});
```

---

### 8. 摄像头/视频设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 摄像头列表 | 所有视频输入设备 | `navigator.mediaDevices` |
| 视频流 | 实时视频捕获 | `getUserMedia()` |
| 截图 | 桌面截图 | Electron `desktopCapturer` |

```typescript
import { desktopCapturer } from 'electron';

// 桌面截图
const sources = await desktopCapturer.getSources({
  types: ['screen', 'window']
});

// 摄像头列表
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
```

---

### 9. 打印机设备

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 打印机列表 | 已安装打印机 | Electron `webContents.getPrintersAsync()` |
| 打印任务 | 打印队列状态 | 系统调用 |
| 打印机状态 | 在线/离线/错误 | `getPrintersAsync()` 返回状态 |

```typescript
// 获取打印机列表
const printers = await mainWindow.webContents.getPrintersAsync();
```

---

### 10. 进程与软件

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 进程列表 | 运行中的进程 | `systeminformation` / `ps-list` 库 |
| 已安装软件 | 应用程序列表 | 系统注册表/包管理器查询 |
| 服务状态 | 系统服务运行状态 | 系统调用 |
| 开机启动项 | 自启动程序列表 | 系统注册表查询 |

```typescript
import si from 'systeminformation';

// 进程列表
const processes = await si.processes();

// 当前进程
const currentProcess = await si.currentLoad();
```

---

### 11. 位置信息

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| GPS 位置 | 经纬度、海拔 | Geolocation API (需要权限) |
| IP 定位 | 基于IP的大致位置 | 第三方 API |

```typescript
// 渲染进程
navigator.geolocation.getCurrentPosition((position) => {
  console.log(position.coords.latitude, position.coords.longitude);
});
```

---

### 12. 剪贴板

| 数据类型 | 说明 | 实现方式 |
|---------|------|---------|
| 剪贴板文本 | 复制的文本内容 | Electron `clipboard` API |
| 剪贴板图片 | 复制的图片 | `clipboard` API |
| 剪贴板文件 | 复制的文件路径 | `clipboard` API |

```typescript
import { clipboard } from 'electron';

// 读取剪贴板
const text = clipboard.readText();
const image = clipboard.readImage();

// 写入剪贴板
clipboard.writeText('Hello');
```

---

## 推荐的 NPM 包汇总

| 包名 | 用途 |
|-----|------|
| `systeminformation` | 系统硬件信息 (最全面) |
| `serialport` | 串口通信 |
| `node-usb` | USB 设备 |
| `node-bluetooth` | 蓝牙设备 |
| `node-wifi` | WiFi 管理 |
| `ps-list` | 进程列表 |
| `loudness` | 系统音量控制 |
| `robotjs` | 鼠标键盘控制 |

---

## 架构建议

```
src/
├── main/
│   ├── index.ts
│   └── collectors/           # 数据采集模块
│       ├── system.ts         # 系统信息
│       ├── hardware.ts       # 硬件传感器
│       ├── network.ts        # 网络设备
│       ├── storage.ts        # 存储设备
│       ├── display.ts        # 显示设备
│       ├── audio.ts          # 音频设备
│       ├── input.ts          # 输入设备
│       ├── camera.ts         # 摄像头
│       ├── printer.ts        # 打印机
│       └── serial.ts         # 串口通信
├── preload/
│   └── index.ts              # 暴露采集接口给渲染进程
└── renderer/
    └── src/
        └── pages/
            └── DeviceMonitor.tsx  # 设备监控页面
```

---

## 注意事项

1. **权限问题**: 部分数据采集需要管理员权限或用户授权
2. **跨平台兼容**: Windows/macOS/Linux 的实现可能有差异
3. **性能影响**: 频繁采集可能影响系统性能，建议合理设置采集间隔
4. **隐私合规**: 采集敏感数据需告知用户并获得同意
5. **安全考虑**: 不要采集或存储敏感信息如密码、密钥等
