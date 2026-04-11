# Electron 设备数据采集能力（合并优化版）

本文档以 `device-collection2.md` 为主线，合并了 `device-collection1.md` 的补充内容，整理为一份可直接落地的 Electron 设备采集方案。重点覆盖工业/物联网场景，同时补齐系统监控、显示、音频、打印等通用能力。

---

## 1. 采集能力总览（按优先级）

### P0：工业场景核心接口（优先实现）

| 接口 | 常见场景 | 推荐实现 | 备注 |
|---|---|---|---|
| 串口（RS-232/RS-485/TTL） | Modbus RTU、仪表通信 | `serialport` | 工业桌面应用首选 |
| USB 通用设备 | 自定义采集器、控制器 | `usb`（Node）/ WebUSB | WebUSB 需用户授权 |
| HID 设备 | 扫码枪、控制面板 | `node-hid` | 适合读写报文 |
| 网络通信 | Modbus TCP、MQTT、HTTP | `net`/`dgram`/`mqtt` | 协议扩展成本低 |
| 蓝牙（BLE） | 无线传感器 | `noble` / Web Bluetooth | Web Bluetooth 仅 BLE |

### P1：嵌入式扩展接口（树莓派等）

| 接口 | 推荐库 | 说明 |
|---|---|---|
| GPIO | `onoff`, `pigpio` | 继电器、按键、PWM |
| I2C | `i2c-bus` | 温湿度、光照、OLED |
| SPI | `spi-device` | TFT、RFID、ADC |
| 1-Wire | `ds18b20` | 温度采集 |

### P2：系统与终端设备信息（监控增强）

| 能力域 | 采集内容 | 推荐实现 |
|---|---|---|
| 系统信息 | OS、CPU、内存、网络接口 | `systeminformation` / `os` |
| 存储设备 | 磁盘容量、挂载点、文件系统 | `systeminformation` |
| 显示设备 | 分辨率、多显示器、显示器变更 | Electron `screen` |
| 音频设备 | 麦克风/扬声器列表、音频电平 | `navigator.mediaDevices` |
| 摄像头/桌面采集 | 摄像头列表、桌面截图 | `mediaDevices` / `desktopCapturer` |
| 打印机 | 打印机列表、状态 | `webContents.getPrintersAsync()` |
| 进程信息 | 进程列表、系统负载 | `systeminformation`, `ps-list` |
| 电源状态 | 电池、休眠/唤醒 | Electron `powerMonitor` |

---

## 2. 推荐依赖清单

```bash
pnpm add systeminformation serialport usb node-hid mqtt ps-list node-wifi
pnpm add @abandonware/noble
pnpm add -D electron-rebuild
```

> 说明：`serialport`、`usb`、`node-hid` 等属于原生模块，安装后需要执行重编译。

---

## 3. 关键实现示例

### 3.1 串口（主进程）

```ts
import { SerialPort } from 'serialport';

export async function listSerialPorts() {
  return SerialPort.list();
}

export function openSerial(path: string, baudRate = 9600) {
  const port = new SerialPort({ path, baudRate });
  port.on('data', (buf) => {
    console.log('serial data(hex):', buf.toString('hex'));
  });
  return port;
}
```

### 3.2 系统信息（主进程）

```ts
import si from 'systeminformation';

export async function collectSystemSnapshot() {
  const [cpu, mem, osInfo, fs] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.fsSize()
  ]);

  return { cpu, mem, osInfo, fs };
}
```

### 3.3 通过 preload 暴露采集能力

```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('deviceAPI', {
  listSerialPorts: () => ipcRenderer.invoke('device:listSerialPorts'),
  getSystemSnapshot: () => ipcRenderer.invoke('device:getSystemSnapshot')
});
```

---

## 4. 推荐目录结构

```text
src/
├── main/
│   ├── index.ts
│   ├── ipc/
│   │   └── device.ts
│   └── collectors/
│       ├── serial.ts
│       ├── usb.ts
│       ├── hid.ts
│       ├── bluetooth.ts
│       ├── network.ts
│       ├── system.ts
│       ├── storage.ts
│       ├── display.ts
│       ├── audio.ts
│       ├── camera.ts
│       └── printer.ts
├── preload/
│   └── index.ts
└── renderer/
    └── src/pages/DeviceMonitor.tsx
```

---

## 5. 平台权限与兼容性

| 平台 | 关键点 | 建议 |
|---|---|---|
| Windows | 串口/USB 通常可直接使用 | 生产环境建议管理员安装 |
| Linux | 串口、USB、GPIO 权限受组和 udev 规则限制 | 用户加入 `dialout`、`plugdev`，配置 udev |
| macOS | 串口、蓝牙、USB 需权限声明 | 配置 `entitlements.plist`，发布前完成签名和公证 |

---

## 6. 工程注意事项

1. **原生模块重编译**：每次新增原生依赖后执行 `npx electron-rebuild`。  
2. **进程边界清晰**：硬件访问放在主进程，渲染进程仅通过 IPC 调用。  
3. **采集频率可配置**：避免高频轮询导致 CPU 占用升高。  
4. **隐私与合规**：采集设备标识、位置信息、音视频前必须提示并授权。  
5. **故障可观测性**：记录设备连接状态、错误码、重连次数，便于排障。  

---

## 7. 最小可用路线（建议）

第一阶段（MVP）：
- 串口 + 网络协议（Modbus RTU/TCP）
- 系统信息与存储信息采集
- 设备监控页（在线状态、实时数据、日志）

第二阶段：
- USB/HID
- 蓝牙 BLE
- 打印与报表输出

第三阶段：
- 嵌入式扩展（GPIO/I2C/SPI）
- 规则引擎与告警联动

---

## 8. 总结

Electron 在跨平台硬件采集场景中具备完整能力：  
- **工业通信**：串口、USB、HID、网络协议  
- **系统监控**：CPU/内存/磁盘/显示/电源  
- **终端能力**：音视频、打印、输入设备  

按“主进程采集 + preload 暴露 + 渲染层展示”的架构实施，可以在可维护性、安全性和交付速度之间取得最佳平衡。
