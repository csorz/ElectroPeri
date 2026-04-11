# MQTT & WebSocket Connection Test Pages Design / MQTT 与 WebSocket 连接测试页面设计

**Date / 日期:** 2026-04-11
**Status / 状态:** Draft / 草稿

## Overview / 概述

Create a new MQTT connection test page and enhance the existing WebSocket page with advanced features.

创建新的 MQTT 连接测试页面，并增强现有 WebSocket 页面的高级功能。

---

## Part 1: MQTT Connection Test Page / MQTT 连接测试页面

### Configuration Options / 配置选项

| Config Item 配置项 | Type 类型 | Default 默认值 | Description 说明 |
|-------------------|----------|---------------|-----------------|
| Broker URL | input | - | mqtt:// or mqtts:// address / MQTT 服务器地址 |
| Port | number | 1883 | Port number / 端口号 |
| Username | input | - | Authentication username / 认证用户名 |
| Password | password | - | Authentication password / 认证密码 |
| Client ID | input | auto-generated | Client identifier / 客户端标识 |
| Clean Session | checkbox | true | Clear session on disconnect / 断开时清除会话 |
| Keep Alive | number | 60 | Heartbeat interval in seconds / 心跳间隔(秒) |
| QoS | select | 0 | Quality of Service level / 消息质量等级 |

### Features / 功能

1. **Connection Management / 连接管理**
   - Connect/Disconnect button / 连接/断开按钮
   - Connection status indicator (connected/disconnected/connecting) / 连接状态指示器
   - Auto-reconnect option / 自动重连选项

2. **Subscribe / 订阅**
   - Add multiple topics / 添加多个订阅主题
   - Set QoS per subscription / 每个订阅设置 QoS
   - Unsubscribe button / 取消订阅按钮

3. **Publish / 发布**
   - Topic input / 主题输入
   - Message content (text/JSON) / 消息内容
   - QoS selector / QoS 选择器
   - Retain flag / 保留消息标志

4. **Message Log / 消息日志**
   - Distinguish message types (sent/received/system) / 区分消息类型
   - Timestamp for each message / 时间戳
   - Topic filtering / 主题过滤
   - Copy/Clear buttons / 复制/清空按钮

### Technical Implementation / 技术实现

- Use `mqtt` library (MQTT.js) / 使用 mqtt 库
- MQTT requires Node.js environment, so need main process handler / MQTT 需要 Node.js 环境，需要主进程处理器
- IPC communication between renderer and main process / 渲染进程与主进程 IPC 通信

---

## Part 2: WebSocket Enhancement / WebSocket 页面增强

### New Configuration Options / 新增配置选项

| Config Item 配置项 | Type 类型 | Description 说明 |
|-------------------|----------|-----------------|
| Protocols | input | Sub-protocols (comma separated) / 子协议(逗号分隔) |
| Auto Reconnect | checkbox | Enable auto-reconnect / 启用自动重连 |
| Reconnect Interval | number | Reconnect interval in seconds / 重连间隔(秒) |
| Heartbeat | checkbox | Enable heartbeat / 启用心跳 |
| Heartbeat Interval | number | Heartbeat interval in seconds / 心跳间隔(秒) |
| Heartbeat Message | input | Heartbeat message content / 心跳消息内容 |

### New Features / 新增功能

1. **Binary Message Support / 二进制消息支持**
   - Send ArrayBuffer/Blob / 发送 ArrayBuffer/Blob
   - Display hex/binary format / 显示十六进制/二进制格式

2. **Message Formatting / 消息格式化**
   - JSON syntax highlighting / JSON 语法高亮
   - Message type indicator (text/binary) / 消息类型指示器

3. **Statistics / 统计信息**
   - Messages sent count / 发送消息数
   - Messages received count / 接收消息数
   - Connection duration / 连接时长

4. **Reconnect Mechanism / 重连机制**
   - Auto-reconnect on disconnect / 断开自动重连
   - Configurable retry interval / 可配置重试间隔

5. **Heartbeat / 心跳保活**
   - Periodic ping messages / 定期发送心跳消息
   - Configurable interval and content / 可配置间隔和内容

---

## File Structure / 文件结构

| File 文件 | Operation 操作 | Description 说明 |
|----------|---------------|-----------------|
| `src/renderer/src/pages/toolbox/tools/MqttToolPage.tsx` | Create 新建 | MQTT page component / MQTT 页面组件 |
| `src/renderer/src/pages/toolbox/tools/WebSocketToolPage.tsx` | Modify 修改 | Enhanced WebSocket page / 增强 WebSocket 页面 |
| `src/main/handlers/mqtt.ts` | Create 新建 | MQTT main process handler / MQTT 主进程处理器 |
| `src/main/index.ts` | Modify 修改 | Register MQTT handler / 注册 MQTT 处理器 |
| `src/preload/index.ts` | Modify 修改 | Add MQTT API / 添加 MQTT API |
| `src/preload/index.d.ts` | Modify 修改 | Add MQTT types / 添加 MQTT 类型定义 |
| `package.json` | Modify 修改 | Add mqtt dependency / 添加 mqtt 依赖 |

---

## IPC API Design / IPC API 设计

### MQTT API

```typescript
interface MqttApi {
  // Connection
  connect: (options: {
    url: string
    port?: number
    username?: string
    password?: string
    clientId?: string
    clean?: boolean
    keepalive?: number
  }) => Promise<{ success: boolean; error?: string }>
  
  disconnect: () => Promise<{ success: boolean }>
  
  // Subscribe
  subscribe: (topic: string, qos?: 0 | 1 | 2) => Promise<{ success: boolean; error?: string }>
  
  unsubscribe: (topic: string) => Promise<{ success: boolean }>
  
  // Publish
  publish: (topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) => Promise<{ success: boolean; error?: string }>
  
  // Event listeners
  onMessage: (callback: (topic: string, message: string) => void) => void
  onConnect: (callback: () => void) => void
  onDisconnect: (callback: () => void) => void
  onError: (callback: (error: string) => void) => void
}
```

---

## Success Criteria / 成功标准

1. MQTT page can connect to broker with all config options / MQTT 页面可使用所有配置项连接服务器
2. MQTT subscribe/publish works correctly / MQTT 订阅/发布正常工作
3. WebSocket page has all new features / WebSocket 页面包含所有新功能
4. Auto-reconnect and heartbeat work as expected / 自动重连和心跳正常工作
5. Message logs display correctly with timestamps / 消息日志正确显示时间戳
6. Build succeeds without errors / 构建成功无错误
