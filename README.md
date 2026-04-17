# ElectroPeri

**Electron + Peripherals** — A cross-platform desktop application for hardware peripheral control and developer tooling.

[English](#english) | [中文](#中文)

---

<a id="english"></a>

## Overview

ElectroPeri combines **hardware peripheral control** with a **full-stack developer toolbox** in one Electron desktop app. It provides direct access to serial ports, USB, HID, Bluetooth BLE, GPIO, I2C, SPI, and more — alongside 80+ developer utilities covering encoding, crypto, JSON, HTTP debugging, code execution, and beyond.

## Features

### Industrial & Hardware Interfaces

| Interface | Native API | Web API | Description |
|-----------|-----------|---------|-------------|
| Serial Port | `serialport` | Web Serial | RS-232/RS-485/TTL, multi-port, hex/text send/recv |
| USB | `usb` | WebUSB | Device enumeration, endpoint R/W, control transfers |
| HID | `node-hid` | WebHID | Barcode scanners, control panels, report R/W |
| Bluetooth BLE | `@abandonware/noble` | Web Bluetooth | Scan, connect, discover services, read/write characteristics |
| Network | Node `net` | — | TCP client/server, echo server, interface listing |
| GPIO | `onoff` / `pigpio` | — | Pin read/write, edge interrupt watching (Linux/RPi) |
| I2C | `i2c-bus` | — | Bus scan, device read/write (Linux/RPi) |
| SPI | `spi-device` | — | Full-duplex transfer (Linux/RPi) |
| 1-Wire | `ds18b20` | — | DS18B20 temperature sensors (Linux/RPi) |

### System Monitoring

CPU, memory, OS info, storage, display/GPU, battery/power, process list, printers, media devices — all via `systeminformation`.

### Developer Toolbox (80+ Tools)

| Category | Tools |
|----------|-------|
| Encoding & Crypto | Hash (MD5/SHA), Base64, URL encode, AES/DES/RC4/RSA encrypt, Unicode |
| JSON | Format, Minify, Validate, JSON↔YAML, JSON↔CSV |
| URL & Params | URL encode/decode, Query Parser |
| Time & Timestamp | Timestamp converter, Timezone |
| HTTP & Debug | HTTP Request, WebSocket, MQTT, Status Codes |
| Text & Data | Regex Tester, Text Diff, Word Count |
| Color | Convert, Palette, Gradient, Contrast, Picker |
| CSS | Shadow, Button, Flex, Grid, Background generators |
| Image | Compress, Convert, Base64, Watermark, QR Code |
| Markdown | Editor, Table Generator, HTML↔MD |
| Code Runner | JavaScript, Python, Java, Go, Rust |
| Dev Utilities | UUID, JWT, Cron, Random Password |
| SEO & Web | IP Query, Whois, Meta Checker, DNS Query |
| OCR | Text Recognition, SVG Editor |
| Utilities | Video Parser, File Transfer, Phone Lookup |
| Fun | Piano, Voice Synthesis, Avatar Generator |
| Architecture | Database, Redis, Deploy, Monitoring, Scaling, HA |

### Device Hotplug

Real-time detection of serial port, USB, HID, and network interface changes.

### Multi-language Code Runner

Sandboxed execution for JavaScript (Node `vm`), Python, Java, Go, and Rust.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron 30 |
| Build | electron-vite + Vite 5 |
| UI | React 19 + TypeScript 5.9 |
| Routing | react-router-dom 7 |
| State | Zustand 5 |
| Package | pnpm |

## Platform Support

| Feature | Windows | macOS | Linux | Raspberry Pi |
|---------|---------|-------|-------|-------------|
| Serial / USB / HID | ✅ | ✅ | ✅ | ✅ |
| Bluetooth BLE | ✅* | ✅* | ✅* | ✅* |
| Network / TCP | ✅ | ✅ | ✅ | ✅ |
| GPIO / I2C / SPI / 1-Wire | — | — | ✅ | ✅ |
| System Info | ✅ | ✅ | ✅ | ✅ |
| Code Runner | ✅ | ✅ | ✅ | ✅ |

\* Requires native module compilation (Visual Studio Build Tools on Windows, Xcode on macOS).

## Project Setup

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

## Architecture

```
ElectroPeri/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App entry, window, handler registration
│   │   └── handlers/      # 24 IPC handlers (serial, usb, hid, ble, ...)
│   ├── preload/           # contextBridge API exposure
│   └── renderer/          # React UI
│       ├── pages/
│       │   ├── industrial/    # Hardware interface pages
│       │   ├── system/        # System monitoring pages
│       │   ├── embedded/      # Embedded/IoT pages (Linux)
│       │   └── toolbox/       # 80+ developer tools
│       ├── components/
│       ├── store/             # Zustand stores
│       └── utils/
├── build/                 # electron-builder resources
└── resources/             # App icons
```

Security pattern: hardware access in **main process** → APIs via **contextBridge preload** → UI in **renderer process** via IPC.

## Recommended IDE

[VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

<a id="中文"></a>

## 概述

ElectroPeri 是一款集**硬件外设控制**与**全栈开发者工具箱**于一体的跨平台桌面应用。提供串口、USB、HID、蓝牙 BLE、GPIO、I2C、SPI 等硬件接口的直连访问，同时内置 80+ 开发者工具，覆盖编解码、加密、JSON 处理、HTTP 调试、代码执行等场景。

## 功能特性

### 工业与硬件接口

| 接口 | 原生 API | Web API | 说明 |
|------|---------|---------|------|
| 串口 | `serialport` | Web Serial | RS-232/RS-485/TTL，多端口，16进制/文本收发 |
| USB | `usb` | WebUSB | 设备枚举、端点读写、控制传输 |
| HID | `node-hid` | WebHID | 扫码枪、控制面板、报告读写 |
| 蓝牙 BLE | `@abandonware/noble` | Web Bluetooth | 扫描、连接、发现服务、读写特征值 |
| 网络 | Node `net` | — | TCP 客户端/服务端、回声服务器、网卡列表 |
| GPIO | `onoff` / `pigpio` | — | 引脚读写、边沿中断监听（Linux/树莓派） |
| I2C | `i2c-bus` | — | 总线扫描、设备读写（Linux/树莓派） |
| SPI | `spi-device` | — | 全双工传输（Linux/树莓派） |
| 1-Wire | `ds18b20` | — | DS18B20 温度传感器（Linux/树莓派） |

### 系统监控

CPU、内存、操作系统、存储、显示器/GPU、电池/电源、进程列表、打印机、媒体设备 — 基于 `systeminformation`。

### 开发者工具箱（80+ 工具）

| 分类 | 工具 |
|------|------|
| 编码与加密 | 哈希 (MD5/SHA)、Base64、URL 编码、AES/DES/RC4/RSA 加密、Unicode |
| JSON | 格式化、压缩、校验、JSON↔YAML、JSON↔CSV |
| URL 与参数 | URL 编解码、Query 解析 |
| 时间与时间戳 | 时间戳转换、时区 |
| HTTP 与调试 | HTTP 请求、WebSocket、MQTT、状态码 |
| 文本与数据 | 正则测试、文本对比、字数统计 |
| 颜色 | 转换、调色板、渐变、对比度、取色器 |
| CSS | 阴影、按钮、Flex、Grid、背景生成器 |
| 图像 | 压缩、转换、Base64、水印、二维码 |
| Markdown | 编辑器、表格生成、HTML↔MD |
| 代码运行 | JavaScript、Python、Java、Go、Rust |
| 开发工具 | UUID、JWT、Cron、随机密码 |
| SEO 与 Web | IP 查询、Whois、Meta 检查、DNS 查询 |
| OCR | 文字识别、SVG 编辑器 |
| 实用工具 | 视频解析、文件传输、手机号归属 |
| 趣味工具 | 钢琴、语音合成、头像生成 |
| 架构 | 数据库、Redis、部署、监控、扩展、高可用 |

### 设备热插拔

实时检测串口、USB、HID 和网络接口的变化。

### 多语言代码运行

支持 JavaScript（Node `vm` 沙箱）、Python、Java、Go、Rust 的在线执行。

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron 30 |
| 构建 | electron-vite + Vite 5 |
| UI | React 19 + TypeScript 5.9 |
| 路由 | react-router-dom 7 |
| 状态管理 | Zustand 5 |
| 包管理 | pnpm |

## 平台支持

| 功能 | Windows | macOS | Linux | 树莓派 |
|------|---------|-------|-------|--------|
| 串口 / USB / HID | ✅ | ✅ | ✅ | ✅ |
| 蓝牙 BLE | ✅* | ✅* | ✅* | ✅* |
| 网络 / TCP | ✅ | ✅ | ✅ | ✅ |
| GPIO / I2C / SPI / 1-Wire | — | — | ✅ | ✅ |
| 系统信息 | ✅ | ✅ | ✅ | ✅ |
| 代码运行 | ✅ | ✅ | ✅ | ✅ |

\* 需要编译原生模块（Windows 需要 Visual Studio Build Tools，macOS 需要 Xcode）。

## 项目设置

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

### 构建

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

## 项目结构

```
ElectroPeri/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 应用入口、窗口创建、处理器注册
│   │   └── handlers/      # 24 个 IPC 处理器（串口、USB、HID、蓝牙...）
│   ├── preload/           # contextBridge API 暴露
│   └── renderer/          # React UI
│       ├── pages/
│       │   ├── industrial/    # 硬件接口页面
│       │   ├── system/        # 系统监控页面
│       │   ├── embedded/      # 嵌入式/IoT 页面（Linux）
│       │   └── toolbox/       # 80+ 开发者工具
│       ├── components/
│       ├── store/             # Zustand 状态管理
│       └── utils/
├── build/                 # electron-builder 资源
└── resources/             # 应用图标
```

安全架构：硬件访问在**主进程** → 通过 **contextBridge 预加载**暴露 API → **渲染进程**通过 IPC 调用。

## 推荐 IDE

[VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
