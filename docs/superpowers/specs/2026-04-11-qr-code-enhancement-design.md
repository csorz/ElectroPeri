# QR Code Tool Enhancement Design / 二维码工具增强设计

**Date / 日期:** 2026-04-11
**Status / 状态:** Draft / 草稿

## Overview / 概述

Enhance the existing QR Code tool with instant generation, QR code decoding, creative styles, and batch generation capabilities.

增强现有二维码工具，增加即时生成、二维码解码、创意样式和批量生成功能。

## Features / 功能特性

### 1. Instant Generation / 即时生成
- Auto-generate QR code as user types (debounced 300ms)
- 用户输入时自动生成二维码（防抖 300ms）
- No button click required for basic generation
- 基础生成无需点击按钮
- Real-time preview updates
- 实时预览更新

### 2. QR Code Decoder / 二维码解码
- Upload image file (PNG, JPG, GIF, WebP)
- 上传图片文件（PNG, JPG, GIF, WebP）
- Support drag-and-drop
- 支持拖放上传
- Decode QR code from image using jsqr library
- 使用 jsqr 库从图片解码二维码
- Display decoded text with copy option
- 显示解码文本并提供复制选项

### 3. Creative Styles / 创意样式
Eight artistic styles for QR code generation:
八种二维码生成艺术样式：

| Style 样式 | Description 描述 |
|-------|-------------|
| Standard 标准 | Default square modules / 默认方块模块 |
| Rounded 圆角 | Smooth rounded corners on all modules / 所有模块平滑圆角 |
| Dots 圆点 | Circular dots instead of squares / 圆点代替方块 |
| Gradient 渐变 | Linear gradient color fill / 线性渐变色填充 |
| Logo Center 中心Logo | Place logo/image in center (requires H error correction) / 在中心放置Logo图片（需H级纠错） |
| Liquid 液态 | Fluid, organic blob-like modules / 流体有机团状模块 |
| Mini Squares 迷你方块 | Inner mini squares in each module / 每个模块内嵌小方块 |
| Random Mix 随机混合 | Mix of squares and circles randomly / 方块和圆点随机混合 |
| Frame 边框 | Decorative border around QR / 二维码周围装饰边框 |

### 4. Batch Generation / 批量生成
- Text area for multiple inputs (one per line)
- 文本区域输入多项内容（每行一项）
- Generate all QR codes at once
- 一次性生成所有二维码
- Preview in grid layout
- 网格布局预览
- Download all as ZIP file
- 打包下载为 ZIP 文件

## UI Layout: Tabs / UI布局：标签页

```
┌─────────────────────────────────────────────────┐
│  [Generate 生成]  [Decode 解码]  [Batch 批量]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Generate Tab / 生成标签页:                      │
│  ┌─────────────────────┬──────────────────────┐│
│  │ Input 输入          │ Preview 预览         ││
│  │ ┌─────────────────┐ │ ┌──────────────────┐ ││
│  │ │ Text content... │ │ │                  │ ││
│  │ │ 文本内容...     │ │ │   [QR Preview]   │ ││
│  │ └─────────────────┘ │ │   二维码预览     │ ││
│  │                     │ │                  │ ││
│  │ Style 样式: [下拉]  │ └──────────────────┘ ││
│  │ Size 尺寸: [滑块]   │                      ││
│  │ Colors 颜色: [FG][BG]│ [Download 下载]     ││
│  │ Error 纠错: [L/M/Q/H]│ [Copy 复制]         ││
│  └─────────────────────┴──────────────────────┘│
│                                                 │
│  Decode Tab / 解码标签页:                        │
│  ┌─────────────────────────────────────────────┐│
│  │ [Drop image here or click to upload]        ││
│  │ [拖放图片到此处或点击上传]                   ││
│  │                                             ││
│  │ Decoded Result / 解码结果:                  ││
│  │ ┌─────────────────────────────────────────┐ ││
│  │ │ Extracted text content...               │ ││
│  │ │ 提取的文本内容...                       │ ││
│  │ └─────────────────────────────────────────┘ ││
│  │ [Copy 复制]                                 ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  Batch Tab / 批量标签页:                         │
│  ┌─────────────────────┬──────────────────────┐│
│  │ Items 项目(每行一个)│ Preview Grid 预览网格 ││
│  │ ┌─────────────────┐ │ ┌──┐ ┌──┐ ┌──┐      ││
│  │ │ Line 1          │ │ │QR│ │QR│ │QR│      ││
│  │ │ Line 2          │ │ └──┘ └──┘ └──┘      ││
│  │ │ Line 3          │ │ ┌──┐ ┌──┐ ┌──┐      ││
│  │ └─────────────────┘ │ │QR│ │QR│ │QR│      ││
│  │                     │ └──┘ └──┘ └──┘      ││
│  │ [Generate All]      │ [Download ZIP]       ││
│  │ [生成全部]          │ [下载ZIP]            ││
│  └─────────────────────┴──────────────────────┘│
└─────────────────────────────────────────────────┘
```

## Technical Implementation / 技术实现

### Dependencies / 依赖库
- `qrcode` (existing 已有) - Basic QR generation / 基础二维码生成
- `jsqr` - QR code decoding from images / 从图片解码二维码
- `jszip` - ZIP file creation for batch download / 批量下载ZIP打包
- `file-saver` - Trigger file downloads / 触发文件下载

### Custom Style Rendering / 自定义样式渲染
All creative styles use Canvas API for custom rendering:
所有创意样式使用 Canvas API 进行自定义渲染：

1. Generate base QR matrix using `qrcode` library
   使用 `qrcode` 库生成基础二维码矩阵
2. Extract module positions (dark/light pattern)
   提取模块位置（深色/浅色图案）
3. Render each module with custom shape:
   使用自定义形状渲染每个模块：
   - Standard 标准: `fillRect()`
   - Rounded 圆角: `roundRect()` or path with arcs / 或弧线路径
   - Dots 圆点: `arc()` for each module / 每个模块绘制圆弧
   - Gradient 渐变: Create gradient, use as fill style / 创建渐变作为填充样式
   - Logo 中心Logo: Draw QR, then overlay centered image / 绘制二维码后叠加居中图片
   - Liquid 液态: Bezier curves for organic shapes / 贝塞尔曲线绘制有机形状
   - Mini 迷你: Draw outer + inner squares / 绘制外层+内层方块
   - Random 随机: Randomly pick square or circle per module / 每个模块随机选择方块或圆点
   - Frame 边框: Draw border after QR is complete / 二维码完成后绘制边框

### Instant Generation / 即时生成实现
- Use `useEffect` with debounce on text input
  使用 `useEffect` 对文本输入进行防抖处理
- Generate QR on every text change (after 300ms delay)
  每次文本变化时生成二维码（延迟300ms）
- Show loading indicator during generation
  生成过程中显示加载指示器

### Batch Processing / 批量处理
- Split input by newlines
  按换行符分割输入
- Generate each QR code sequentially
  顺序生成每个二维码
- Store as data URLs in array
  存储为 data URL 数组
- Create ZIP using JSZip library
  使用 JSZip 库创建 ZIP
- Trigger download via FileSaver
  通过 FileSaver 触发下载

## Error Handling / 错误处理

- Invalid input 无效输入: Show error message below input / 在输入下方显示错误信息
- Decode failure 解码失败: "No QR code found in image" / "图片中未找到二维码"
- Batch empty 批量为空: "Please enter at least one item" / "请至少输入一项内容"
- Logo too large Logo过大: Auto-resize to fit QR center / 自动缩放以适应二维码中心

## File Changes / 文件变更

| File 文件 | Changes 变更 |
|------|---------|
| `src/renderer/src/pages/toolbox/tools/QrCodeToolPage.tsx` | Complete rewrite with tabs, styles, decode, batch / 完全重写，包含标签页、样式、解码、批量 |
| `package.json` | Add jsqr, jszip, file-saver dependencies / 添加 jsqr, jszip, file-saver 依赖 |
| `src/preload/index.d.ts` | No changes needed (all frontend) / 无需变更（纯前端） |

## Success Criteria / 成功标准

1. Instant generation works with debounced input
   即时生成与防抖输入正常工作
2. All 8 creative styles render correctly
   所有8种创意样式正确渲染
3. Decode extracts text from uploaded QR images
   解码从上传的二维码图片中提取文本
4. Batch generates and downloads ZIP with all QR codes
   批量生成并下载包含所有二维码的ZIP
5. UI is responsive and intuitive
   UI响应灵敏且直观
