# 屏幕截图页面设计

## 概述

在"系统与终端能力"模块中新增"屏幕截图"页面，支持自由选取屏幕区域截图、预览、重新选取、选择保存位置下载。

## 需求

1. 自由选取屏幕区域截图（透明覆盖窗口 + 拖拽框选）
2. 选取后页面预览图片，不合适可以继续选择
3. 支持按钮点击下载，下载前可以选择保存位置（系统保存对话框）

## 架构

### 方案：主进程 desktopCapturer + 独立覆盖窗口

- 主进程用 `desktopCapturer.getSources()` 获取指定屏幕的完整截图
- 创建无边框透明 BrowserWindow 覆盖目标屏幕，用户拖拽框选区域
- 框选完成后裁剪 NativeImage，返回给渲染进程预览
- 保存时用 `dialog.showSaveDialog()` 让用户选择位置

### 数据流

```
渲染进程 (ScreenshotPage)          主进程 (screenshot handler)
─────────────────────────          ─────────────────────────
1. 点击"截图"按钮
   → screenshot:getSources         → desktopCapturer.getSources()
   ← 屏幕列表+缩略图              ← 返回 [{id, name, thumbnail}]

2. 选择显示器
   → screenshot:startCapture       → 创建覆盖窗口
                                    → 用户拖拽框选
   ← screenshot:regionSelected     ← 返回 {x,y,w,h,sourceId}
   或 screenshot:captureCancelled  ← 用户按 Esc 取消

3. 裁剪区域
   → screenshot:cropRegion         → NativeImage.crop()
   ← dataURL                      ← 返回裁剪后图片

4. 预览 & 下载
   不满意 → 重新截图
   满意 → screenshot:save          → dialog.showSaveDialog()
                                    → fs.writeFile()
   ← {success, path?}             ← 返回保存结果
```

## IPC 通道

| 通道 | 方向 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| `screenshot:getSources` | r→m | — | `{id, name, thumbnail: string}[]` | 获取所有屏幕截图源 |
| `screenshot:startCapture` | r→m | `{sourceId: string}` | `void` | 创建覆盖窗口开始框选 |
| `screenshot:regionSelected` | m→r | `{x, y, width, height, sourceId}` | `void` | 框选完成通知 |
| `screenshot:captureCancelled` | m→r | — | `void` | 用户取消框选 |
| `screenshot:cropRegion` | r→m | `{sourceId, x, y, width, height}` | `string` (dataURL) | 裁剪指定区域 |
| `screenshot:save` | r→m | `{dataURL, defaultName}` | `{success: boolean, path?: string}` | 保存对话框+写入文件 |

## 覆盖窗口

- **窗口属性**：`frame: false, transparent: true, alwaysOnTop: true, fullscreen: true, hasShadow: false`
- 定位到目标显示器坐标
- 加载独立 HTML（通过 `loadURL` 加载 data URL 或内嵌 HTML 文件）
- 内容：
  - 截图作为全屏背景图
  - 全屏半透明暗色遮罩（`rgba(0,0,0,0.3)`）
  - 鼠标按下拖拽绘制选区矩形
  - 选区内无遮罩（显示原始截图），选区外保持暗色遮罩
  - 选区边框：2px 实线 `#4fc3f7`（项目主题色）
  - 选区角落显示尺寸信息（如 `320 x 240`）
  - Esc 键取消，鼠标松开确认选区
- 选区确认后 `ipcRenderer.send('screenshot:regionSelected', region)` 通知主窗口
- 主窗口转发事件给渲染进程，覆盖窗口关闭

### 覆盖窗口 HTML 结构

```html
<body style="margin:0;overflow:hidden;cursor:crosshair;">
  <canvas id="overlay"></canvas>
  <script>
    // 全屏 canvas
    // 绘制：截图 → 暗色遮罩 → 选区透明 → 选区边框 → 尺寸标注
    // mousedown/mousemove/mouseup 处理拖拽
    // keydown Esc 取消
  </script>
</body>
```

## 页面 UI

### 交互演示 Tab

```
┌─────────────────────────────────────────┐
│  屏幕截图                                │
│  ┌──────────────────────────────────┐   │
│  │ [📷 截图]                        │   │
│  └──────────────────────────────────┘   │
│                                          │
│  (截图前)                                │
│  ┌──────────────────────────────────┐   │
│  │ 点击"截图"按钮，选择显示器后      │   │
│  │ 在屏幕上拖拽框选截图区域          │   │
│  └──────────────────────────────────┘   │
│                                          │
│  (截图后)                                │
│  ┌──────────────────────────────────┐   │
│  │ ┌────────────────────────────┐   │   │
│  │ │                            │   │   │
│  │ │     截图预览               │   │   │
│  │ │     1280 x 720            │   │   │
│  │ │                            │   │   │
│  │ └────────────────────────────┘   │   │
│  │ 尺寸: 1280 x 720  |  大小: 245KB │   │
│  │                                    │   │
│  │ [🔄 重新截图]    [💾 下载]        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 多显示器选择

当检测到多个显示器时，点击"截图"后弹出选择面板：

```
┌─────────────────────────────────────┐
│  选择截图显示器                      │
│  ┌─────────┐  ┌─────────┐          │
│  │ 屏幕 1  │  │ 屏幕 2  │          │
│  │ 1920x1080│  │ 2560x1440│         │
│  │ (主显示器)│  │          │         │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

每个显示器卡片显示缩略图、分辨率、是否主显示器。点击后进入框选。

### 概念详解 Tab

- 核心能力：区域截图、多屏支持、即时预览、灵活保存
- 技术架构图：desktopCapturer → NativeImage → 覆盖窗口 → 裁剪 → 预览/保存
- Electron 截图 API 说明

### 代码示例 Tab

- Electron desktopCapturer 使用示例
- NativeImage 裁剪示例
- dialog.showSaveDialog 示例

## 错误处理

| 场景 | 处理 |
|------|------|
| desktopCapturer 权限被拒绝 | 页面提示"屏幕录制权限未授权，请在系统设置中开启" |
| 无可用屏幕源 | 提示"未检测到可用显示器" |
| 框选区域过小（宽或高 < 5px） | 视为取消，触发 captureCancelled |
| 保存对话框取消 | 不做任何操作，保持预览状态 |
| 文件写入失败 | 提示错误信息"保存失败: {reason}" |

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/main/handlers/screenshot.ts` | 新建 | setupScreenshotHandlers()，desktopCapturer + 覆盖窗口 + 裁剪 + 保存 |
| `src/main/index.ts` | 修改 | 注册 screenshot handler |
| `src/preload/index.ts` | 修改 | 添加 screenshotApi |
| `src/preload/index.d.ts` | 修改 | 添加 ScreenshotApi 接口 |
| `src/renderer/src/pages/system/ScreenshotPage.tsx` | 新建 | 页面组件 |
| `src/renderer/src/pages/system/ScreenshotPage.css` | 新建 | 页面样式 |
| `src/renderer/src/App.tsx` | 修改 | 添加路由 |
| `src/renderer/src/components/Layout.tsx` | 修改 | 侧边栏添加入口 |
| `src/renderer/src/pages/HomePage.tsx` | 修改 | 首页卡片添加入口 |
