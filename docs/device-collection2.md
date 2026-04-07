Electron 结合了 **Chromium（Web 能力）** 和 **Node.js（系统底层能力）**，因此它能访问的硬件接口远超普通浏览器，几乎可以实现**原生桌面应用**的所有硬件交互能力。以下是 Electron 支持的所有主流硬件接口的完整梳理，按工业/物联网场景的实用性排序：

---

## 一、工业/物联网场景最常用接口

### 1. **串口（UART/RS-232/RS-485/TTL）** ⭐⭐⭐⭐⭐
做 Modbus RTU 最需要的接口，Electron 支持非常成熟。

- **核心库**：[`serialport`](sslocal://flow/file_open?url=https%3A%2F%2Fserialport.io%2F&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（Node.js 生态最强大的串口库）
- **支持的功能**：
  - 枚举所有串口（获取 COM 口、设备路径、厂商 ID、产品 ID）
  - 配置波特率、数据位、停止位、校验位
  - 全双工读写、流控（RTS/CTS/DTR/DSR）
  - 监听串口插拔事件
- **Electron 主进程代码示例**：
  ```javascript
  const { SerialPort } = require('serialport');

  // 1. 枚举所有串口
  async function listPorts() {
    const ports = await SerialPort.list();
    console.log('可用串口:', ports);
    // 输出示例：[{ path: 'COM3', vendorId: '1a86', productId: '7523', ... }]
  }

  // 2. 打开串口并读取数据（Modbus RTU 场景）
  const port = new SerialPort({ path: 'COM3', baudRate: 9600 });

  port.on('data', (buffer) => {
    console.log('收到 Modbus RTU 数据:', buffer.toString('hex'));
  });

  port.write(Buffer.from([0x01, 0x03, 0x00, 0x00, 0x00, 0x01, 0x84, 0x0A])); // 发送 Modbus 指令
  ```
- **注意事项**：
  - 需要使用 `electron-rebuild` 重新编译原生模块以匹配 Electron 的 Node.js 版本
  - Windows：无需额外驱动（常见的 CH340/CP2102 驱动系统自带）
  - Linux：需要用户在 `dialout` 组（`sudo usermod -aG dialout $USER`）
  - macOS：需要在 `entitlements.plist` 中添加 `com.apple.security.device.serial` 权限

---

### 2. **USB 接口（通用 USB 设备）** ⭐⭐⭐⭐
Electron 支持两种方式访问 USB 设备：**Node.js 原生库**（权限更高）和 **Chromium WebUSB API**（更简单）。

#### 方案 A：Node.js `node-usb` 库（推荐，工业场景首选）
- **核心库**：[`usb`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Ftessel%2Fnode-usb&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（底层 libusb 绑定）
- **支持的功能**：
  - 枚举所有 USB 设备（获取 VID/PID、接口描述符、端点）
  - 控制传输、批量传输、中断传输
  - 直接与自定义 USB 设备通信（无需驱动）
- **代码示例**：
  ```javascript
  const usb = require('usb');

  // 1. 枚举所有 USB 设备
  const devices = usb.getDeviceList();
  console.log('USB 设备:', devices.map(d => ({ vid: d.deviceDescriptor.idVendor, pid: d.deviceDescriptor.idProduct })));

  // 2. 打开指定设备（例如 VID:0x1a86, PID:0x7523）
  const device = usb.findByIds(0x1a86, 0x7523);
  device.open();

  const iface = device.interface(0);
  iface.claim(); // 声明接口

  const endpoint = iface.endpoint(0x81); // 输入端点
  endpoint.transfer(64, (err, data) => {
    console.log('收到 USB 数据:', data);
  });
  ```

#### 方案 B：Chromium WebUSB API（更简单，适合标准 USB 设备）
- **优势**：无需原生模块，直接在渲染进程使用
- **限制**：需要用户手动授权，不能访问 HID/音频/视频等标准类设备
- **代码示例**（渲染进程）：
  ```javascript
  // 请求用户授权 USB 设备
  navigator.usb.requestDevice({ filters: [{ vendorId: 0x1a86 }] })
    .then(device => device.open())
    .then(() => console.log('USB 设备已打开'));
  ```

---

### 3. **HID 设备（人机接口设备：键盘、鼠标、游戏手柄、自定义 HID 设备）** ⭐⭐⭐⭐
很多工业设备（如扫码枪、数据采集器、自定义控制面板）使用 HID 协议。

- **核心库**：[`node-hid`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fnode-hid%2Fnode-hid&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)
- **支持的功能**：
  - 枚举所有 HID 设备
  - 读写报告（Feature Report/Input Report/Output Report）
  - 监听设备插拔
- **代码示例**：
  ```javascript
  const HID = require('node-hid');

  // 1. 枚举 HID 设备
  const devices = HID.devices();
  console.log('HID 设备:', devices);

  // 2. 打开设备并读写
  const device = new HID.HID(0x1a86, 0x7523); // VID/PID

  device.on('data', (data) => {
    console.log('HID 数据:', data);
  });

  device.write([0x00, 0x01, 0x02, 0x03]); // 发送数据
  ```

---

### 4. **蓝牙（Classic Bluetooth / BLE 低功耗蓝牙）** ⭐⭐⭐
适合无线传感器、手环、 beacon 等设备。

#### 方案 A：Node.js 库（推荐，功能更强）
- **BLE**：[`noble`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fabandonware%2Fnoble&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（中心设备模式，扫描/连接 BLE 外设）
- **经典蓝牙**：[`node-bluetooth-serial-port`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Feelcocramer%2Fnode-bluetooth-serial-port&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（SPP 串口协议）

#### 方案 B：Chromium Web Bluetooth API
- 直接在渲染进程使用，无需原生模块
- 仅支持 BLE，不支持经典蓝牙
- 代码示例：
  ```javascript
  navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService('heart_rate'))
    .then(service => service.getCharacteristic('heart_rate_measurement'))
    .then(char => char.startNotifications())
    .then(char => char.addEventListener('characteristicvaluechanged', e => {
      console.log('心率:', e.target.value.getUint8(1));
    }));
  ```

---

## 二、嵌入式/单板机场景接口（适合树莓派等）

### 5. **GPIO（通用输入输出）** ⭐⭐⭐
适合控制继电器、LED、读取按键等。

- **核心库**：
  - [`onoff`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Ffivdi%2Fonoff&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（Linux 专用，树莓派首选）
  - [`pigpio`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Ffivdi%2Fpigpio&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)（性能更高，支持 PWM）
- **代码示例**（树莓派）：
  ```javascript
  const Gpio = require('onoff').Gpio;
  const led = new Gpio(17, 'out'); // GPIO17 设为输出

  led.writeSync(1); // 点亮 LED
  setTimeout(() => led.writeSync(0), 1000); // 1秒后熄灭
  ```

### 6. **I2C 总线** ⭐⭐
适合连接传感器（温度、湿度、加速度计）、OLED 屏幕等。

- **核心库**：[`i2c-bus`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Ffivdi%2Fi2c-bus&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)
- **代码示例**（读取 BH1750 光照传感器）：
  ```javascript
  const i2c = require('i2c-bus');
  const bus = i2c.openSync(1); // I2C 总线 1

  const BH1750_ADDR = 0x23;
  bus.writeByteSync(BH1750_ADDR, 0x10); // 发送测量命令

  setTimeout(() => {
    const buffer = Buffer.alloc(2);
    bus.readI2cBlockSync(BH1750_ADDR, 0x00, 2, buffer);
    const lux = (buffer[0] << 8 | buffer[1]) / 1.2;
    console.log('光照强度:', lux, 'lux');
  }, 200);
  ```

### 7. **SPI 总线**
适合连接高速设备（如 TFT 屏幕、RFID 读卡器、ADC）。

- **核心库**：[`spi-device`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Ffivdi%2Fspi-device&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

### 8. **1-Wire 总线**
适合连接 DS18B20 温度传感器等。

- **核心库**：[`ds18b20`](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fchamerling%2Fds18b20&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

---

## 三、其他通用硬件接口

### 9. **网络接口（以太网/Wi-Fi）**
Electron 可以使用 Node.js 的 `net`、`dgram`、`http`、`https` 模块，完全支持：
- **Modbus TCP**：直接通过 TCP Socket 通信
- **MQTT**：使用 `mqtt` 库
- **UDP**：广播/组播
- **HTTP/RESTful API**

### 10. **音频/视频接口**
- 使用 Chromium 的 `MediaDevices` API 访问摄像头、麦克风
- 使用 Node.js 的 `speaker`、`mic` 库进行音频播放/录制

### 11. **打印机**
- 使用 `node-printer` 库直接控制打印机
- 使用 Chromium 的 `window.print()` 进行网页打印

### 12. **游戏手柄**
- 使用 Chromium 的 `Gamepad API`
- 使用 `node-hid` 直接读取自定义手柄数据

---

## 四、Electron 硬件开发的关键注意事项

### 1. **原生模块编译（最重要）**
所有访问硬件的库（`serialport`、`node-usb`、`node-hid` 等）都是原生模块，必须重新编译以匹配 Electron 的 Node.js 版本。

**解决方案**：
```bash
# 安装 electron-rebuild
npm install --save-dev electron-rebuild

# 每次安装新的原生模块后运行
npx electron-rebuild

# 或者在 package.json 中添加脚本
"scripts": {
  "rebuild": "electron-rebuild"
}
```

### 2. **进程模型：主进程 vs 渲染进程**
- **主进程**：可以直接使用所有 Node.js 硬件库（推荐）
- **渲染进程**：
  - 默认无法直接使用 Node.js 模块（安全原因）
  - 推荐使用 `contextBridge` 将硬件能力暴露给渲染进程
- **示例**（`preload.js`）：
  ```javascript
  const { contextBridge, ipcRenderer } = require('electron');

  contextBridge.exposeInMainWorld('hardwareAPI', {
    listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
    sendModbusCommand: (cmd) => ipcRenderer.send('send-modbus', cmd)
  });
  ```

### 3. **操作系统权限问题**
| 系统 | 关键权限 | 解决方案 |
|------|----------|----------|
| **Windows** | COM 口访问、USB 驱动 | 通常无需额外配置，管理员权限即可 |
| **Linux** | 串口、USB、GPIO | 用户加入 `dialout`、`plugdev` 组，配置 udev 规则 |
| **macOS** | 串口、USB、蓝牙 | 在 `entitlements.plist` 中添加对应权限，开发阶段禁用 Sandbox，发布时需要公证 |

### 4. **推荐的 Electron 硬件开发模板**
- **electron-react-boilerplate**：结合 React，已配置好 `electron-rebuild`
- **electron-vite-vue**：轻量级，结合 Vue 3 + Vite，开发体验极佳

---

## 五、总结：Electron 硬件能力全景图
| 接口类型 | 推荐库 | 工业场景实用性 |
|----------|--------|----------------|
| 串口（RS-232/485） | `serialport` | ⭐⭐⭐⭐⭐ |
| USB 通用设备 | `usb` | ⭐⭐⭐⭐ |
| HID 设备 | `node-hid` | ⭐⭐⭐⭐ |
| 网络（Modbus TCP/MQTT） | `net`/`mqtt` | ⭐⭐⭐⭐⭐ |
| BLE 蓝牙 | `noble` / Web Bluetooth | ⭐⭐⭐ |
| GPIO/I2C/SPI | `onoff`/`i2c-bus` | ⭐⭐⭐（嵌入式场景） |

**Electron 是目前开发跨平台工业硬件控制软件的最佳选择**，可以用它做：
- Modbus 调试助手（类似 Modbus Poll/Modbus Slave）
- 工业设备组态监控软件
- 数据采集与分析系统
- 设备固件升级工具
