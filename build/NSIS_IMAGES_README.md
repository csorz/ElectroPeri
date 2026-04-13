# NSIS 安装界面图片说明

## 图片规格要求

### 1. installerHeader.bmp (安装向导头部图片)
- 尺寸: 150 x 57 像素
- 格式: BMP (24位色深)
- 位置: 安装向导右上角

### 2. installerSidebar.bmp (安装向导侧边图片)
- 尺寸: 164 x 314 像素
- 格式: BMP (24位色深)
- 位置: 安装向导左侧

### 3. uninstallerSidebar.bmp (卸载向导侧边图片)
- 尺寸: 164 x 314 像素
- 格式: BMP (24位色深)
- 位置: 卸载向导左侧

## 如何启用

1. 将图片文件放入 `build/` 目录
2. 取消 electron-builder.yml 中对应行的注释:
   ```yaml
   installerHeader: build/installerHeader.bmp
   installerSidebar: build/installerSidebar.bmp
   uninstallerSidebar: build/uninstallerSidebar.bmp
   ```

## 设计建议

- 使用品牌色彩和 Logo
- 保持简洁，避免过多细节
- 确保文字可读性
- 考虑深色/浅色主题兼容

## 在线工具

可以使用以下工具生成 BMP 图片:
- Photoshop
- GIMP (免费)
- https://www.aconvert.com/cn/image/png-to-bmp/

## 示例

```
build/
├── icon.ico              # 应用图标 (已有)
├── icon.png              # PNG 图标 (已有)
├── icon.icns             # macOS 图标 (已有)
├── license.txt           # 许可协议 (已有)
├── installer.nsh         # 自定义安装脚本 (已有)
├── installerHeader.bmp   # 头部图片 (需添加)
├── installerSidebar.bmp  # 侧边图片 (需添加)
└── uninstallerSidebar.bmp # 卸载侧边图片 (需添加)
```
