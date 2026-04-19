# 混流助手页面设计

## 概述

在"系统与终端能力"模块中新增"混流助手"页面，支持本地视频流、摄像头流、屏幕共享流三种流源的混流合成、实时预览和录制下载。

## 需求

1. 本地视频：选择本地视频文件，播放预览，转为视频流，支持单次/循环播放
2. 摄像头：捕获摄像头流，支持预览，支持选择麦克风设备
3. 屏幕共享：选择屏幕或应用窗口，将共享画面转为视频流
4. 混流：选择上述流进行画中画布局混流，大窗口+小窗口，支持切换大窗口，无流则不显示
5. 混流录制：录制混流画面+所有音轨，支持下载
6. 摄像头+麦克风录制：录制摄像头视频+麦克风音频，支持下载
7. 屏幕共享+麦克风录制：录制屏幕视频+麦克风音频，支持下载

## 架构

### 方案：纯渲染进程架构

所有流获取、Canvas 混流、MediaRecorder 录制都在渲染进程完成。主进程仅负责 `desktopCapturer` 枚举和文件保存。

**理由**：`getUserMedia`/`MediaRecorder`/`Canvas` 本就是浏览器 API，在渲染进程直接使用最自然；流不跨进程传输，延迟最低；1080p 级别混流现代浏览器完全够用。

### 主进程职责

- `desktopCapturer.getSources({ types: ['screen', 'window'] })` 枚举屏幕/窗口源
- `dialog.showSaveDialog()` 保存录制文件
- 权限自动授予 camera/microphone（webPreferences 中配置）

### 数据流

```
本地视频 ──► <video> ──► captureStream() ──┐
摄像头   ──► getUserMedia() ──────────────┤
屏幕共享 ──► getUserMedia(sourceId) ──────┤
                                          ▼
                                    Canvas 混流 (画中画布局)
                                          │
                                          ├──► 实时预览
                                          └──► captureStream() → MediaRecorder → Blob → 下载
```

## IPC 通道

| 通道 | 方向 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| `mixer:getSources` | r→m | — | `{id, name, thumbnail, type}[]` | 枚举屏幕/窗口源 |
| `mixer:saveRecording` | r→m | `{data: Uint8Array, defaultName: string}` | `{success, path?}` | 保存录制文件 |

## 流源

### 本地视频流

- 用户点击"选择文件"→ 主进程 `dialog.showOpenDialog()` 选择视频文件
- `<video>` 元素加载文件，显示预览
- 播放模式：单次播放 / 循环播放（`loop` 属性）
- 转为流：`video.captureStream()` 获得 MediaStream
- 视频静音不影响输出流（`captureStream` 捕获原始音轨）

### 摄像头流

- 枚举设备：`navigator.mediaDevices.enumerateDevices()` 过滤 videoinput / audioinput
- 用户选择摄像头设备 → `getUserMedia({ video: { deviceId }, audio: { deviceId } })`
- 预览：`<video>` 元素 `srcObject = stream`
- 支持选择麦克风设备（用于录制时加入麦克风音轨）

### 屏幕共享流

- 主进程 `desktopCapturer.getSources({ types: ['screen', 'window'] })` 枚举所有屏幕和窗口
- 渲染进程展示源列表（缩略图 + 名称），用户选择
- 通过 `getUserMedia` 的 `chromeMediaSourceId` 约束获取屏幕流：
  ```js
  getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId } },
    video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId, maxWidth: 1920, maxHeight: 1080 } }
  })
  ```
- macOS 上 `chromeMediaSource: 'desktop'` 的 audio 约束可捕获系统音频

## 混流布局

### 画中画布局

- Canvas 尺寸固定 1920x1080（输出分辨率）
- 大窗口：占满整个 Canvas
- 小窗口：固定在右下角，尺寸约 Canvas 的 1/4（480x270），带 2px 白色边框和圆角
- 切换大窗口：点击小窗口区域或点击按钮，将小窗口流与大窗口流互换
- 如果某个流不存在，其位置不显示（小窗口区域空缺）

布局示意：
```
┌────────────────────────────────┐
│                                │
│        大窗口 (流A)            │
│                                │
│                    ┌──────────┐│
│                    │ 小窗口   ││
│                    │ (流B)    ││
│                    └──────────┘│
└────────────────────────────────┘
```

### 混流渲染逻辑

- `requestAnimationFrame` 循环绘制
- 每帧：先绘制大窗口流（全屏），再绘制小窗口流（右下角）
- 小窗口位置：`x = canvasWidth - smallWidth - 20, y = canvasHeight - smallHeight - 20`
- 小窗口尺寸：`smallWidth = 480, smallHeight = 270`
- 小窗口边框：2px 白色，4px 圆角

## 录制

### 三种录制模式

1. **混流录制**：Canvas `captureStream()` + 所有音轨（摄像头麦克风 + 屏幕系统音频 + 本地视频音轨）→ `MediaRecorder` → WebM
2. **摄像头+麦克风录制**：摄像头视频流 + 麦克风音轨 → `MediaRecorder` → WebM
3. **屏幕共享+麦克风录制**：屏幕视频流 + 麦克风音轨 → `MediaRecorder` → WebM

每种录制独立控制（开始/停止/下载），互不影响。

### 录制控制

- 录制中显示时长计时器（红色指示灯 + HH:MM:SS）
- 停止后自动生成 Blob，可预览回放
- 下载按钮触发 `mixer:saveRecording` IPC 保存为 `.webm` 文件
- 录制格式：WebM (VP8 + Opus)，浏览器原生支持

### 音轨合并

混流录制时，需要将多个音轨合并为一个。使用 `AudioContext` + `MediaStreamDestination`：

```js
const audioCtx = new AudioContext()
const dest = audioCtx.createMediaStreamDestination()
// 将每个音轨的 source 连接到 dest
audioTracks.forEach(track => {
  const source = audioCtx.createMediaStreamSource(new MediaStream([track]))
  source.connect(dest)
})
// dest.stream 包含合并后的音轨
```

## 页面 UI

### 交互演示 Tab

```
┌─────────────────────────────────────────────┐
│  混流助手                                    │
│                                              │
│  ┌─── 流源面板 ────────────────────────────┐ │
│  │ [本地视频]  [摄像头]  [屏幕共享]        │ │
│  │                                          │ │
│  │ 本地视频: 未选择 / 已选 xxx.mp4 ▶ 播放  │ │
│  │ 摄像头:   未开启 / 已开启 (设备名)       │ │
│  │ 屏幕共享: 未选择 / 已选 屏幕1            │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  ┌─── 混流预览 ────────────────────────────┐ │
│  │                                          │ │
│  │          Canvas 实时混流画面             │ │
│  │                                          │ │
│  │  [切换大窗口]  布局: 画中画              │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  ┌─── 录制面板 ────────────────────────────┐ │
│  │ 混流录制:    [⏺ 开始]  00:00:00        │ │
│  │ 摄像头录制:  [⏺ 开始]  00:00:00        │ │
│  │ 屏幕录制:    [⏺ 开始]  00:00:00        │ │
│  │                                          │ │
│  │ 已录制: recording1.webm (2.3MB) [下载]  │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 流源面板交互

- **本地视频**：点击"选择文件"→ 打开文件对话框 → 选择后显示文件名和预览缩略图 → 可选单次/循环播放
- **摄像头**：点击"开启"→ 枚举设备 → 选择设备 → 开启预览；点击"关闭"停止
- **屏幕共享**：点击"选择"→ 弹出源选择面板（缩略图网格）→ 选择后开启

### 混流预览交互

- Canvas 实时渲染混流画面
- "切换大窗口"按钮：在已开启的流之间切换谁是主画面
- 点击 Canvas 上的小窗口也可切换

### 概念详解 Tab

- 核心能力：多流源混流、画中画布局、实时预览、独立录制
- 技术架构图：流源 → Canvas 合成 → 预览/录制
- WebRTC / MediaRecorder API 说明

### 代码示例 Tab

- getUserMedia 示例
- Canvas 混流示例
- MediaRecorder 示例

## 错误处理

| 场景 | 处理 |
|------|------|
| 摄像头权限被拒绝 | 提示"摄像头权限未授权，请在系统设置中开启" |
| 麦克风权限被拒绝 | 提示"麦克风权限未授权，请在系统设置中开启" |
| 屏幕录制权限被拒绝 | 提示"屏幕录制权限未授权，请在系统设置中开启" |
| 无可用摄像头 | 提示"未检测到摄像头设备" |
| 无可用屏幕源 | 提示"未检测到可用屏幕或窗口" |
| 录制失败 | 提示"录制失败: {reason}" |
| 保存失败 | 提示"保存失败: {reason}" |

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/main/handlers/mixer.ts` | 新建 | setupMixerHandlers()，desktopCapturer 枚举 + 保存录制文件 |
| `src/main/index.ts` | 修改 | 注册 mixer handler |
| `src/preload/index.ts` | 修改 | 添加 mixerApi |
| `src/preload/index.d.ts` | 修改 | 添加 MixerApi 接口 |
| `src/renderer/src/pages/system/MixerPage.tsx` | 新建 | 页面组件 |
| `src/renderer/src/pages/system/MixerPage.css` | 新建 | 页面样式 |
| `src/renderer/src/App.tsx` | 修改 | 添加路由 |
| `src/renderer/src/components/Layout.tsx` | 修改 | 侧边栏添加入口 |
| `src/renderer/src/pages/HomePage.tsx` | 修改 | 首页卡片添加入口 |