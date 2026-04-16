# 系统与终端能力 UI 仪表盘化设计

## 概述

将 P2 "系统与终端能力" 的 7 个页面从简单的文本/表格展示升级为仪表盘风格，增加数据可视化（进度条、数值卡片、分组卡片），同时增强后端 handler 返回更丰富的数据。

## 共享 UI 组件

在 `src/renderer/src/components/dashboard/` 下创建可复用的仪表盘组件：

### GaugeBar
- 带颜色渐变的进度条（绿→黄→红，阈值 60%/80%）
- Props: `value: number, label?: string, showPercent?: boolean`
- 宽度自适应，高度 8px，圆角

### StatCard
- 数值卡片：图标 + 标题 + 大数字 + 副标题
- Props: `icon?: string, title: string, value: string | number, subtitle?: string, color?: string`
- 固定高度，flex 布局，1fr 网格

### InfoRow
- 键值对行：label + value
- Props: `label: string, value: string | number | undefined`
- label 右对齐灰色，value 左对齐深色

### SectionCard
- 分组卡片：标题 + 内容区
- Props: `title: string, icon?: string, children: ReactNode`
- 带顶部边框色条，圆角 8px，内边距 16px

## 各页面设计

### 1. SystemPage — 系统概览仪表盘

**后端增强 (`system.ts`)**:
- 增加 `si.cpuTemperature()` 返回 CPU 温度
- 增加 `os.uptime()` 返回系统运行时间

**UI 布局**:
- 顶部一行 4 个 StatCard: OS发行版, CPU型号+核数, 内存已用/总量, 运行时间
- CPU 区域: GaugeBar 总负载 + 每核心负载条形图（横向排列）
- 内存区域: GaugeBar (已用/总量) + Swap GaugeBar
- OS 详情: InfoRow 列表 (hostname, arch, kernel, codename, build)
- 保留自动刷新下拉

### 2. StoragePage — 磁盘仪表盘

**后端**: 无需改动，已返回 `fsSize`, `diskLayout`, `blockDevices`

**UI 布局**:
- 物理磁盘: 每个磁盘一张 SectionCard，显示型号/类型(SSD/HDD图标)/容量/接口类型
- 文件系统: 保留表格 + GaugeBar 进度条（已有），增加挂载点图标
- 块设备: 简洁表格 (设备名, 类型, 文件系统, 挂载点)

### 3. DisplayPage — 显示/GPU 仪表盘

**后端**: 无需改动

**UI 布局**:
- GPU 卡片: 每个 GPU 一张 SectionCard，显示型号/厂商/显存(MB)/驱动版本
- 显示器卡片: 每个显示器一张 SectionCard，显示分辨率/刷新率/缩放/色深/主屏标识

### 4. PowerPage — 电源仪表盘

**后端增强 (`power.ts`)**:
- 改为调用 `si.battery()` 返回完整电池信息:
  `{ onBattery, percent, charging, timeRemaining, type, manufacturer, model, serial, cycleCount, acConnected }`

**UI 布局**:
- 电源状态 StatCard: 电池/AC 图标 + 大字状态
- 电量 GaugeBar: 带百分比
- InfoRow 列表: 充电状态、剩余时间(min)、电池类型、制造商、型号、循环次数

### 5. ProcessPage — 进程仪表盘

**后端**: 无需改动

**UI 布局**:
- 顶部 StatCard 行: 总进程数, CPU总负载, 内存使用率
- CPU/内存 GaugeBar
- 负载详情: 1/5/15 min 平均负载 (如有)
- 进程表: 增加 CPU/mem 列的 mini GaugeBar，增加自动刷新选项 (3s/5s/关闭)
- 保留搜索/排序/limit

### 6. PrinterPage — 打印机仪表盘

**后端**: 无需改动

**UI 布局**:
- 每个打印机一张 SectionCard: 名称、状态(带颜色标识圆点)、默认标记、描述、URI
- 无打印机时显示空状态提示

### 7. MediaPage — 音视频/外设仪表盘

**后端**: 无需改动

**UI 布局**:
- 音频设备: 每个设备一张 StatCard，显示名称+类型(输入/输出)+默认标识+状态
- GPU 控制器: SectionCard 显示型号/厂商/显存
- USB 设备: 表格增加 VID:PID 的 hex 格式化 + 设备类名

## 文件变更清单

### 新建
- `src/renderer/src/components/dashboard/GaugeBar.tsx`
- `src/renderer/src/components/dashboard/StatCard.tsx`
- `src/renderer/src/components/dashboard/InfoRow.tsx`
- `src/renderer/src/components/dashboard/SectionCard.tsx`
- `src/renderer/src/components/dashboard/index.ts`

### 修改 (后端)
- `src/main/handlers/system.ts` — 增加 cpuTemperature, uptime
- `src/main/handlers/power.ts` — 改用 si.battery() 返回完整信息

### 修改 (前端)
- `src/renderer/src/pages/system/SystemPage.tsx`
- `src/renderer/src/pages/system/StoragePage.tsx`
- `src/renderer/src/pages/system/DisplayPage.tsx`
- `src/renderer/src/pages/system/PowerPage.tsx`
- `src/renderer/src/pages/system/ProcessPage.tsx`
- `src/renderer/src/pages/system/PrinterPage.tsx`
- `src/renderer/src/pages/system/MediaPage.tsx`

### 修改 (类型)
- `src/preload/index.d.ts` — PowerApi.snapshot 返回类型扩展
