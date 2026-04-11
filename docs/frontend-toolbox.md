# 前端工具箱清单（全栈版）

参考来源：
- [开发者武器库](https://devtool.tech/) - 60+ 免费在线开发工具
- [零代码工具箱](https://www.lingdaima.com/) - CSS 样式生成工具
- [开发者工具箱](https://tool.lvtao.net/) - 多语言编译与开发工具
- [全栈工具](https://tools.qzxdp.cn/) - 开发/编译/实用/站长/娱乐工具

本文档整理前端与全栈开发中高频使用的在线工具，按场景分类，便于快速查找和选型。

---

## 应用内实现（P3）

文档第 **1～6** 节在应用内为 **独立页面**（另含 **概览** 入口）。路由前缀：`/frontend-toolbox`。

| 章节 | 路由 | 能力摘要 |
|------|------|----------|
| 概览 | `/frontend-toolbox` | 卡片跳转至各子页 |
| 1. 编码与加解密 | `/frontend-toolbox/encoding` | 字符串 / 文件 Hash：`MD5`、`SHA1`、`SHA256` |
| 2. JSON 处理 | `/frontend-toolbox/json` | 格式化、压缩、校验 |
| 3. URL 与参数 | `/frontend-toolbox/url` | URL 编解码、Base64、Query → JSON |
| 4. 时间与时间戳 | `/frontend-toolbox/time` | 时间戳 ↔ 日期、当前时间、自动秒/毫秒 |
| 5. 请求调试 | `/frontend-toolbox/http` | `fetch` 请求、WebSocket 收发 |
| 6. 文本与数据转换 | `/frontend-toolbox/text` | 正则、`matchAll`、行级 Diff、CSV→JSON、YAML↔JSON |

侧边栏：**P3 前端工具箱** 下展开可见「概览」与 1～6 子项。

依赖：`crypto-js`（Hash/Base64）、`js-yaml`（YAML 互转）。

---

## 一、编码与加解密

### 1.1 Hash 计算

| 工具 | 链接 | 说明 |
|------|------|------|
| Hash Generator | [devtool.tech/hash](https://devtool.tech/hash) | 字符串 Hash 计算，支持 MD5/SHA1/SHA256 等 |
| 文件哈希计算 | [tools.qzxdp.cn/file_hash](https://tools.qzxdp.cn/file_hash) | 文件 MD5/SHA 值计算 |
| 字符串哈希计算 | [tools.qzxdp.cn/str_hash](https://tools.qzxdp.cn/str_hash) | 在线哈希值计算、消息摘要计算 |
| CyberChef | [gchq.github.io/CyberChef](https://gchq.github.io/CyberChef/) | 支持多算法串联，适合调试 |
| HashMyFiles | [nirsoft.net](https://www.nirsoft.net/utils/hash_my_files.html) | 本地文件校验最常用 |

常用命令（macOS）：

```bash
# SHA-1
shasum -a 1 your-file.zip

# SHA-256
shasum -a 256 your-file.zip

# MD5
md5 your-file.zip
```

### 1.2 Base64 编解码

| 工具 | 链接 | 说明 |
|------|------|------|
| Base64 编码详解 | [devtool.tech/base64](https://devtool.tech/base64) | Base64 编码与解码并展现内部原理 |
| Base64 编码/解码 | [tools.qzxdp.cn/base64](https://tools.qzxdp.cn/base64) | 标准 Base64 编解码 |
| 图片 DataURL 生成器 | [devtool.tech/dataurl](https://devtool.tech/dataurl) | DataURL 生成及预览器 |
| 图片转 Base64 | [tools.qzxdp.cn/image2base64](https://tools.qzxdp.cn/image2base64) | 图片 Base64 编码转换 |

### 1.3 URL 编解码

| 工具 | 链接 | 说明 |
|------|------|------|
| URL Encoding | [devtool.tech/url-encoding](https://devtool.tech/url-encoding) | URL 编码解码工具 |
| URL Encode/Decode | [urlencoder.org](https://www.urlencoder.org/) | 快速处理 query 参数 |

### 1.4 加密解密

| 工具 | 链接 | 说明 |
|------|------|------|
| 对称加密 | [devtool.tech/encrypt](https://devtool.tech/encrypt) | 对称加密算法大全（AES/DES/RC4 等） |
| 对称加密解密 | [tools.qzxdp.cn/encrypt](https://tools.qzxdp.cn/encrypt) | AES/DES/RC4 加密解密 |
| RSA 公私钥生成 | [tools.qzxdp.cn/rsa](https://tools.qzxdp.cn/rsa) | 在线生成 RSA 密钥对 |
| 编码解码器 | [tools.qzxdp.cn/decode](https://tools.qzxdp.cn/decode) | URL/Unicode/Base64 编码解码 |

### 1.5 Unicode 编码

| 工具 | 链接 | 说明 |
|------|------|------|
| Unicode To Code Point | [devtool.tech/unicode-codepoint](https://devtool.tech/unicode-codepoint) | Unicode 码点转换 |
| Unicode 转 UTF-8 | [devtool.tech/unicode-utf8](https://devtool.tech/unicode-utf8) | Unicode 转 UTF-8，可视化展示 |
| Unicode 转 UTF-16 | [devtool.tech/unicode-utf16](https://devtool.tech/unicode-utf16) | Unicode 转 UTF-16 |
| Unicode 转 UTF-32 | [devtool.tech/unicode-utf32](https://devtool.tech/unicode-utf32) | Unicode 转 UTF-32 |
| HTML Entity Encoding | [devtool.tech/html-entity-encoding](https://devtool.tech/html-entity-encoding) | HTML 实体编码解码 |

---

## 二、JSON 处理

### 2.1 JSON 格式化 / 压缩 / 校验

| 工具 | 链接 | 说明 |
|------|------|------|
| JSON 解析格式化 | [tools.qzxdp.cn/json](https://tools.qzxdp.cn/json) | JSON 视图、格式化校验 |
| JSON Formatter | [jsonformatter.org](https://jsonformatter.org/) | 支持缩进、排序、校验 |
| JSON Minify | [jsonformatter.org/json-minify](https://www.jsonformatter.org/json-minify) | JSON 压缩 |

常用命令：

```bash
# 美化
echo '{"a":1,"b":[2,3]}' | jq .

# 压缩
echo '{"a":1,"b":[2,3]}' | jq -c .
```

### 2.2 JSON 转换

| 工具 | 链接 | 说明 |
|------|------|------|
| JSON 转 YAML | [devtool.tech/json-to-yaml](https://devtool.tech/json-to-yaml) | JSON 数据转 YAML 格式 |
| JSON 转 CSV | [devtool.tech/json-to-csv](https://devtool.tech/json-to-csv) | JSON 数据转 CSV 格式 |
| JSON 转 HTML 表格 | [devtool.tech/json-to-html-table](https://devtool.tech/json-to-html-table) | JSON 转 HTML 表格 |
| JSON 转 Markdown 表格 | [devtool.tech/json-to-markdown-table](https://devtool.tech/json-to-markdown-table) | JSON 转 Markdown 表格 |
| JSON 转 SQL INSERT | [devtool.tech/json-to-sql-insert](https://devtool.tech/json-to-sql-insert) | JSON 转 SQL 插入语句 |
| JSON 转 LaTeX 表格 | [devtool.tech/json-to-latex-table](https://devtool.tech/json-to-latex-table) | JSON 转 LaTeX 表格 |

---

## 三、URL 与参数处理

| 工具 | 链接 | 说明 |
|------|------|------|
| URL Encoding | [devtool.tech/url-encoding](https://devtool.tech/url-encoding) | URL 编码解码 |
| 短网址生成 | [tools.qzxdp.cn/short_url](https://tools.qzxdp.cn/short_url) | 短链接生成器 |
| 短网址还原 | [tools.qzxdp.cn/unshorturl](https://tools.qzxdp.cn/unshorturl) | 短网址真实地址还原 |
| 中文域名转码 | [tools.qzxdp.cn/punycode](https://tools.qzxdp.cn/punycode) | 中文域名 Punycode 转换 |

---

## 四、时间与时间戳

| 工具 | 链接 | 说明 |
|------|------|------|
| 时间戳转换器 | [devtool.tech/timestamp](https://devtool.tech/timestamp) | Unix 时间戳与日期时间在线转换 |
| Unix 时间戳转换 | [tools.qzxdp.cn/timestamp](https://tools.qzxdp.cn/timestamp) | 时间戳转换工具 |
| Epoch Converter | [epochconverter.com](https://www.epochconverter.com/) | 支持秒/毫秒 |
| World Time Buddy | [worldtimebuddy.com](https://www.worldtimebuddy.com/) | 时区转换，联调多时区接口 |

---

## 五、请求调试与接口联调

| 工具 | 链接 | 说明 |
|------|------|------|
| 查看 HTTP 请求 | [tools.qzxdp.cn/http](https://tools.qzxdp.cn/http) | HTTP 请求头/响应头查看 |
| HTTP 状态查询 | [tools.qzxdp.cn/http_status](https://tools.qzxdp.cn/http_status) | HTTP 状态码查询 |
| Apifox | [apifox.com](https://apifox.com/) | 团队 API 管理利器 |
| Hoppscotch | [hoppscotch.io](https://hoppscotch.io/) | 轻量在线 API 调试 |
| Postman | [postman.com](https://www.postman.com/) | REST 接口调试 |
| Charles / Proxyman / Fiddler | - | 抓包与重放，排查请求头、缓存、代理问题 |

---

## 六、文本与数据转换

### 6.1 正则表达式

| 工具 | 链接 | 说明 |
|------|------|------|
| 正则表达式 | [tools.qzxdp.cn/regular](https://tools.qzxdp.cn/regular) | 正则在线测试、生成、可视化 |
| regex101 | [regex101.com](https://regex101.com/) | 支持解释与分组可视化 |

### 6.2 文本比对

| 工具 | 链接 | 说明 |
|------|------|------|
| 在线比对工具 | [tools.qzxdp.cn/diff](https://tools.qzxdp.cn/diff) | 文本/代码差异对比 |
| Diffchecker | [diffchecker.com](https://www.diffchecker.com/) | 文本差异定位 |

### 6.3 数据格式转换

| 工具 | 链接 | 说明 |
|------|------|------|
| CSV 转 JSON | [devtool.tech/csv-to-json](https://devtool.tech/csv-to-json) | CSV 数据转 JSON |
| CSV 转 Markdown 表格 | [devtool.tech/csv-to-markdown-table](https://devtool.tech/csv-to-markdown-table) | CSV 转 Markdown 表格 |
| CSV 转 HTML 表格 | [devtool.tech/csv-to-html-table](https://devtool.tech/csv-to-html-table) | CSV 转 HTML 表格 |
| CSV 转 SQL INSERT | [devtool.tech/csv-to-sql-insert](https://devtool.tech/csv-to-sql-insert) | CSV 转 SQL 插入语句 |
| CSV 转 YAML | [devtool.tech/csv-to-yaml](https://devtool.tech/csv-to-yaml) | CSV 转 YAML |
| CSV 转 LaTeX 表格 | [devtool.tech/csv-to-latex-table](https://devtool.tech/csv-to-latex-table) | CSV 转 LaTeX 表格 |
| YAML 转 JSON | [devtool.tech/yaml-to-json](https://devtool.tech/yaml-to-json) | YAML 转 JSON |
| YAML 转 CSV | [devtool.tech/yaml-to-csv](https://devtool.tech/yaml-to-csv) | YAML 转 CSV |
| Excel 转 CSV | [devtool.tech/excel-to-csv](https://devtool.tech/excel-to-csv) | Excel 转 CSV |
| Excel 转 JSON | [devtool.tech/excel-to-json](https://devtool.tech/excel-to-json) | Excel 转 JSON |
| Excel 转 Markdown 表格 | [devtool.tech/excel-to-markdown-table](https://devtool.tech/excel-to-markdown-table) | Excel 转 Markdown 表格 |
| HTML 转 Markdown | [devtool.tech/html-to-markdown](https://devtool.tech/html-to-markdown) | HTML 实时转化 Markdown |
| 批量 URL 转 Markdown | [devtool.tech/url-to-markdown](https://devtool.tech/url-to-markdown) | 批量网页转 Markdown |

### 6.4 其他文本工具

| 工具 | 链接 | 说明 |
|------|------|------|
| 字数统计与排版 | [tools.qzxdp.cn/text_count](https://tools.qzxdp.cn/text_count) | 在线字数统计、排版 |
| 在线繁体字转换 | [tools.qzxdp.cn/zh_convert](https://tools.qzxdp.cn/zh_convert) | 简繁转换 |
| 字节计算器 | [tools.qzxdp.cn/byte_calc](https://tools.qzxdp.cn/byte_calc) | 字节换算 |
| 在线进制转换 | [tools.qzxdp.cn/hex_convert](https://tools.qzxdp.cn/hex_convert) | 二/八/十/十六进制转换 |
| 二进制转换器 | [devtool.tech/binary-converter](https://devtool.tech/binary-converter) | 二进制、八进制、十六进制转换 |

---

## 七、颜色工具

### 7.1 颜色转换

| 工具 | 链接 | 说明 |
|------|------|------|
| Color Convert | [devtool.tech/color-convert](https://devtool.tech/color-convert) | RGB、HSL、CMYK 相互转化 |
| RGB 颜色对照表 | [tools.qzxdp.cn/rgb_color](https://tools.qzxdp.cn/rgb_color) | RGB 颜色查询对照 |
| CSS Color Names | [devtool.tech/css-color-names](https://devtool.tech/css-color-names) | CSS 标准命名颜色值 |

### 7.2 配色工具

| 工具 | 链接 | 说明 |
|------|------|------|
| 色彩调色板 | [devtool.tech/tint-shade-generator](https://devtool.tech/tint-shade-generator) | Tint/Shade 色系生成器 |
| 色彩对比度计算器 | [devtool.tech/contrast-ratio](https://devtool.tech/contrast-ratio) | Contrast Ratio 在线计算 |
| 色彩亮度计算器 | [devtool.tech/color-luminance](https://devtool.tech/color-luminance) | Color Luminance 在线计算 |
| 色彩灰阶计算器 | [devtool.tech/color-grayscale](https://devtool.tech/color-grayscale) | Color GrayScale 在线计算 |
| 色盲模拟器 | [devtool.tech/color-blindness-simulator](https://devtool.tech/color-blindness-simulator) | 模拟色觉障碍下的颜色显示 |
| 色彩和谐生成器 | [devtool.tech/color-harmony-generator](https://devtool.tech/color-harmony-generator) | 基于色彩理论生成和谐配色 |
| Tailwind 颜色查找器 | [devtool.tech/tailwind-color-finder](https://devtool.tech/tailwind-color-finder) | 查找最接近的 Tailwind CSS 颜色类名 |
| 随机颜色生成器 | [devtool.tech/random-color-generator](https://devtool.tech/random-color-generator) | 生成美观的随机配色方案 |
| 颜色混合器 | [devtool.tech/color-mixer](https://devtool.tech/color-mixer) | 混合两种颜色生成渐变过渡色 |
| OKLCH 探索器 | [devtool.tech/oklch](https://devtool.tech/oklch) | 探索 OKLCH 和 OKLAB CSS 色彩空间 |
| 图片取色器 | [devtool.tech/image-color-picker](https://devtool.tech/image-color-picker) | 从图片中提取主色调调色板 |
| 在线生成 CSS 渐变色 | [lingdaima.com/jianbianse](https://lingdaima.com/jianbianse/) | 渐变色生成工具 |
| CSS 渐变生成器 | [devtool.tech/css-gradient-generator](https://devtool.tech/css-gradient-generator) | 生成 CSS 线性/径向渐变 |

---

## 八、CSS 样式工具

### 8.1 布局工具

| 工具 | 链接 | 说明 |
|------|------|------|
| Grid 网格在线拖拽布局 | [lingdaima.com/grid](https://lingdaima.com/grid) | 拖拽完成复杂 Grid 布局 |
| Table 布局 / Excel 转 HTML | [lingdaima.com/table](https://lingdaima.com/table) | Excel 转 HTML，自动优化代码 |

### 8.2 样式生成器

| 工具 | 链接 | 说明 |
|------|------|------|
| 在线生成 CSS 阴影效果 | [lingdaima.com/shadow](https://lingdaima.com/shadow) | 分层箱形阴影，更平滑锐利 |
| 在线生成 CSS 新拟态风格 | [lingdaima.com/xinnitai](https://lingdaima.com/xinnitai) | 新拟态风格（Neumorphism） |
| 在线生成 CSS 玻璃形态效果 | [lingdaima.com/glass](https://lingdaima.com/glass) | 玻璃拟态效果（Glassmorphism） |
| CSS 按钮在线设计 | [lingdaima.com/cssbutton](https://lingdaima.com/cssbutton) | 在线设计按钮样式 |
| CSS 文本排版工具 | [lingdaima.com/typeset](https://lingdaima.com/typeset) | 可视化文本排版，生成 CSS |
| CSS 背景生成器 | [lingdaima.com/cssbg](https://lingdaima.com/cssbg) | 以像素为单位绘制 CSS 背景 |
| SVG 波浪背景生成器 | [lingdaima.com/svgwave](https://lingdaima.com/svgwave) | 快速制作波浪背景 |
| CSS 精美样式库 | [lingdaima.com/css](https://lingdaima.com/css) | 按钮、卡片等网页精美样式 |
| CSS 格式化/压缩 | [tools.qzxdp.cn/code_css](https://tools.qzxdp.cn/code_css) | CSS 代码格式化压缩 |

### 8.3 CSS 代码工具

| 工具 | 链接 | 说明 |
|------|------|------|
| HTML 格式化/压缩 | [tools.qzxdp.cn/code_html](https://tools.qzxdp.cn/code_html) | HTML 代码格式化压缩 |
| JavaScript 格式化/压缩 | [tools.qzxdp.cn/code_js](https://tools.qzxdp.cn/code_js) | JS 代码格式化压缩 |
| JavaScript 加密混淆 | [tools.qzxdp.cn/jsobfuscator](https://tools.qzxdp.cn/jsobfuscator) | JS 代码加密混淆保护 |

---

## 九、图片工具

### 9.1 图片压缩与转换

| 工具 | 链接 | 说明 |
|------|------|------|
| 微图 - 极速图片压缩器 | [devtool.tech/image-compressor](https://devtool.tech/image-compressor) | 不限大小数量的图片压缩 |
| 图片格式转换 | [devtool.tech/image-format-converter](https://devtool.tech/image-format-converter) | PNG/JPG/WebP 批量转换 |
| 图片转换/压缩 | [squoosh.qzxdp.cn](https://squoosh.qzxdp.cn/) | 图片格式转换、压缩优化 |
| SVG 优化工具 | [tools.qzxdp.cn/svg-optimizer](https://tools.qzxdp.cn/svg-optimizer/) | SVG 在线压缩优化 |
| 图片灰阶在线生成器 | [devtool.tech/image-grayscale](https://devtool.tech/image-grayscale) | 图像 GrayScale 生成器 |

### 9.2 图片编辑

| 工具 | 链接 | 说明 |
|------|------|------|
| 在线图片编辑 | [tools.qzxdp.cn/image_editor](https://tools.qzxdp.cn/image_editor) | 裁剪、水印、滤镜、旋转、EXIF |
| 图片背景擦除 | [devtool.tech/image-background-eraser](https://devtool.tech/image-background-eraser) | 手动擦除背景，导出透明 PNG |
| 图片水印 | [devtool.tech/image-watermark](https://devtool.tech/image-watermark) | 添加文字水印，自定义位置透明度 |
| JPEG Metadata 查看 & 移除 | [devtool.tech/jpeg-metadata](https://devtool.tech/jpeg-metadata) | 查看/移除 EXIF 元数据 |

### 9.3 图片生成

| 工具 | 链接 | 说明 |
|------|------|------|
| 图片占位符 API | [devtool.tech/image-placeholder](https://devtool.tech/image-placeholder) | 图片占位符生成器及 API |
| 二维码生成器 | [devtool.tech/qrcode-generator](https://devtool.tech/qrcode-generator) | 在线实时二维码生成 |
| 二维码生成 | [tools.qzxdp.cn/qrcode](https://tools.qzxdp.cn/qrcode) | 自定义二维码生成工具 |
| ASCII 字符画生成器 | [devtool.tech/ascii-art-generator](https://devtool.tech/ascii-art-generator) | 图片转 ASCII 字符画 |
| ASCII 艺术字生成 | [tools.qzxdp.cn/ascii_art](https://tools.qzxdp.cn/ascii_art) | 在线生成 ASCII 码艺术字 |
| 图片转 CSS 渐变 | [devtool.tech/image-to-css-gradient](https://devtool.tech/image-to-css-gradient) | 从图片提取主色调生成 CSS 渐变 |
| Favicon 生成器 | [devtool.tech/favicon-generator](https://devtool.tech/favicon-generator) | 从图片生成所有尺寸 Favicon |
| 九宫格切图 | [tools.qzxdp.cn/image_slice](https://tools.qzxdp.cn/image_slice) | 九宫格切图工具 |
| 唯美壁纸 | [tools.qzxdp.cn/wallpaper](https://tools.qzxdp.cn/wallpaper) | 4K 壁纸下载 |

### 9.4 图床

| 工具 | 链接 | 说明 |
|------|------|------|
| 微图床 - 个人专属图床 | [devtool.tech/image-share](https://devtool.tech/image-share) | 将 Github 仓库作为个人图床 |
| 聚合高速图床 | [tools.qzxdp.cn/imghosting](https://tools.qzxdp.cn/imghosting) | 多平台高速图床 |

---

## 十、Markdown 工具

| 工具 | 链接 | 说明 |
|------|------|------|
| Markdown 在线编辑 | [tools.qzxdp.cn/markdown](https://tools.qzxdp.cn/markdown) | Markdown 在线编辑器 |
| Markdown 表格生成器 | [devtool.tech/markdown-table-generator](https://devtool.tech/markdown-table-generator) | Markdown/CSV/JSON 格式互转 |
| Markdown 一纸简历 | [devtool.tech/markdown-resume](https://devtool.tech/markdown-resume) | Markdown 编写的简历 |
| Markdown 码途编辑器 | [devtool.tech/markdown-editor](https://devtool.tech/markdown-editor) | 支持微信主题的在线编辑器 |

### 10.1 Markdown 表格转换

| 工具 | 链接 | 说明 |
|------|------|------|
| Markdown 表格转 CSV | [devtool.tech/markdown-table-to-csv](https://devtool.tech/markdown-table-to-csv) | Markdown 表格转 CSV |
| Markdown 表格转 JSON | [devtool.tech/markdown-table-to-json](https://devtool.tech/markdown-table-to-json) | Markdown 表格转 JSON |
| Markdown 表格转 HTML | [devtool.tech/markdown-table-to-html](https://devtool.tech/markdown-table-to-html) | Markdown 表格转 HTML |
| Markdown 表格转 LaTeX | [devtool.tech/markdown-table-to-latex](https://devtool.tech/markdown-table-to-latex) | Markdown 表格转 LaTeX |
| Markdown 表格转 SQL INSERT | [devtool.tech/markdown-table-to-sql-insert](https://devtool.tech/markdown-table-to-sql-insert) | Markdown 表格转 SQL |
| Markdown 表格转 YAML | [devtool.tech/markdown-table-to-yaml](https://devtool.tech/markdown-table-to-yaml) | Markdown 表格转 YAML |

---

## 十一、代码编译与运行

### 11.1 在线代码运行

| 工具 | 链接 | 说明 |
|------|------|------|
| 在线代码运行 | [tools.qzxdp.cn/runcode](https://tools.qzxdp.cn/runcode) | 多语言在线编译运行 |
| React 实时运行 | [devtool.tech/react-playground](https://devtool.tech/react-playground) | React 单组件实时编辑运行 |
| npm 库在线执行 | [devtool.tech/npm-run](https://devtool.tech/npm-run) | 浏览器中运行调试 npm 库 |

### 11.2 多语言在线编译

| 语言 | 链接 | 说明 |
|------|------|------|
| PHP 在线工具 | [tools.qzxdp.cn/runphp](https://tools.qzxdp.cn/runphp) | PHP 代码编译运行 |
| Python3 在线工具 | [tools.qzxdp.cn/runpy3](https://tools.qzxdp.cn/runpy3) | Python3 代码编译运行 |
| Python2 在线工具 | [tools.qzxdp.cn/runpy2](https://tools.qzxdp.cn/runpy2) | Python2 代码编译运行 |
| Java 在线工具 | [tools.qzxdp.cn/runjava](https://tools.qzxdp.cn/runjava) | Java 代码编译运行 |
| C 在线工具 | [tools.qzxdp.cn/runc](https://tools.qzxdp.cn/runc) | C 代码编译运行 |
| C++ 在线工具 | [tools.qzxdp.cn/runccc](https://tools.qzxdp.cn/runccc) | C++ 代码编译运行 |
| C# 在线工具 | [tools.qzxdp.cn/runnet](https://tools.qzxdp.cn/runnet) | C# 代码编译运行 |
| Go 在线工具 | [tools.qzxdp.cn/rungo](https://tools.qzxdp.cn/rungo) | Go 代码编译运行 |
| Ruby 在线工具 | [tools.qzxdp.cn/runruby](https://tools.qzxdp.cn/runruby) | Ruby 代码编译运行 |
| Rust 在线工具 | - | Rust 代码编译运行 |
| Swift 在线工具 | [tools.qzxdp.cn/runswift](https://tools.qzxdp.cn/runswift) | Swift 代码编译运行 |
| Lua 在线工具 | [tools.qzxdp.cn/runlua](https://tools.qzxdp.cn/runlua) | Lua 代码编译运行 |
| Perl 在线工具 | [tools.qzxdp.cn/runperl](https://tools.qzxdp.cn/runperl) | Perl 代码编译运行 |
| Bash 在线工具 | [tools.qzxdp.cn/runbash](https://tools.qzxdp.cn/runbash) | Bash 脚本运行 |
| JavaScript 在线工具 | [tools.qzxdp.cn/runjs](https://tools.qzxdp.cn/runjs) | JS 代码编译运行 |
| TypeScript 在线工具 | [tools.qzxdp.cn/runts](https://tools.qzxdp.cn/runts) | TS 代码编译运行 |
| VB.NET 在线工具 | [tools.qzxdp.cn/runvb](https://tools.qzxdp.cn/runvb) | VB.NET 代码编译运行 |
| Objective-C 在线工具 | [tools.qzxdp.cn/runoc](https://tools.qzxdp.cn/runoc) | Objective-C 代码编译运行 |
| R 在线工具 | [tools.qzxdp.cn/runr](https://tools.qzxdp.cn/runr) | R 语言代码编译运行 |

---

## 十二、开发辅助工具

### 12.1 UUID 与标识符

| 工具 | 链接 | 说明 |
|------|------|------|
| UUID Generator | [devtool.tech/uuid-generator](https://devtool.tech/uuid-generator) | UUID 在线生成器 |
| UUID 生成器 | [tools.qzxdp.cn/uuid](https://tools.qzxdp.cn/uuid) | UUID/GUID 在线生成 |
| 随机密码生成 | [tools.qzxdp.cn/rand_password](https://tools.qzxdp.cn/rand_password) | 随机密码生成器 |

### 12.2 JWT 工具

| 工具 | 链接 | 说明 |
|------|------|------|
| JWT 编码器 | [devtool.tech/jwt-encoder](https://devtool.tech/jwt-encoder) | 创建和签名 JWT |
| JWT 解码器与验证器 | [devtool.tech/jwt-decoder-validator](https://devtool.tech/jwt-decoder-validator) | 解析验证 JWT |

### 12.3 Cron 表达式

| 工具 | 链接 | 说明 |
|------|------|------|
| Cron 在线生成器 | [tools.qzxdp.cn/cron](https://tools.qzxdp.cn/cron) | Cron 表达式在线生成 |

### 12.4 开发文档

| 工具 | 链接 | 说明 |
|------|------|------|
| 开发文档导航 | [tools.qzxdp.cn/doc](https://tools.qzxdp.cn/doc) | Java/Spring/Gradle 中文文档 |
| Linux 命令查询 | [tools.qzxdp.cn/linux_command](https://tools.qzxdp.cn/linux_command) | Linux 命令大全查询 |
| MimeType 类型表 | [tools.qzxdp.cn/mime_type](https://tools.qzxdp.cn/mime_type) | MimeType 常见文件格式表 |
| HTTP Content-type 对照表 | - | HTTP Content-type 对照表 |

### 12.5 其他开发工具

| 工具 | 链接 | 说明 |
|------|------|------|
| semver 版本范围查询 | [devtool.tech/semver](https://devtool.tech/semver) | npm 版本范围查询 |
| 树形目录结构生成器 | [devtool.tech/tree](https://devtool.tech/tree) | Markdown 列表生成树形目录 |
| UserAgent 在线解析 | [devtool.tech/user-agent-parser](https://devtool.tech/user-agent-parser) | 解析浏览器 User-Agent |
| IEEE 754 图示 | [devtool.tech/ieee-754-visualization](https://devtool.tech/ieee-754-visualization) | 双精度浮点数内部表示 |
| ASCII Table | [devtool.tech/ascii-table](https://devtool.tech/ascii-table) | ASCII 码表查询 |
| GitHub 下载加速 | [tools.qzxdp.cn/github](https://tools.qzxdp.cn/github) | GitHub 源码加速下载 |
| 大前端技术栈图标大全 | [devtool.tech/frontend-icons](https://devtool.tech/frontend-icons) | 大前端技术栈 SVG 图标 |

---

## 十三、SEO 与站长工具

### 13.1 SEO 工具

| 工具 | 链接 | 说明 |
|------|------|------|
| Title/Description 像素级长度检测 | [devtool.tech/title-description-length-checker](https://devtool.tech/title-description-length-checker) | SERP 预览 |
| Open Graph 预览器 | [devtool.tech/open-graph-preview](https://devtool.tech/open-graph-preview) | 社交平台分享卡片预览 |
| SEO 超级外链工具 | [tools.qzxdp.cn/wailian](https://tools.qzxdp.cn/wailian) | 外链发布工具 |
| SEO 综合查询 | [seo.chinaz.com](https://seo.chinaz.com/) | 网站 SEO 综合查询 |

### 13.2 域名与 IP

| 工具 | 链接 | 说明 |
|------|------|------|
| IP 地址查询 | [tools.qzxdp.cn/ip](https://tools.qzxdp.cn/ip) | IP 地址归属地查询 |
| IP Info | [devtool.tech/ip-info](https://devtool.tech/ip-info) | IP 信息查询 |
| 域名 Whois 查询 | [tools.qzxdp.cn/whois](https://tools.qzxdp.cn/whois) | 域名 Whois 信息 |
| 域名 DNS 查询 | [tools.qzxdp.cn/dns](https://tools.qzxdp.cn/dns) | DNS 解析查询 |
| 腾讯域名拦截查询 | [tools.qzxdp.cn/checkurl](https://tools.qzxdp.cn/checkurl) | 腾讯/微信域名拦截 |
| 净网云剑拦截查询 | [tools.qzxdp.cn/cqqgsafe](https://tools.qzxdp.cn/cqqgsafe) | 净网云剑拦截查询 |
| 数字 IP 地址转换 | [tools.qzxdp.cn/ip_num](https://tools.qzxdp.cn/ip_num) | IP 转 INT |
| 网站 Favicon 获取 | [tools.qzxdp.cn/favicon](https://tools.qzxdp.cn/favicon) | 网页图标抓取 |
| 网页源代码查看 | [tools.qzxdp.cn/viewhtml](https://tools.qzxdp.cn/viewhtml) | 在线获取网页源码 |
| PING 网站测速 | [ping.chinaz.com](https://ping.chinaz.com/) | Ping 检测测速 |

---

## 十四、OCR 与识别

| 工具 | 链接 | 说明 |
|------|------|------|
| OCR 光学字符识别 | [devtool.tech/ocr](https://devtool.tech/ocr) | 免费在线 OCR，多语言识别 |
| SVG 编辑器与优化器 | [devtool.tech/svg-editor-optimizer](https://devtool.tech/svg-editor-optimizer) | 在线编辑、预览和优化 SVG |
| File Type Detector | [devtool.tech/file-type-detector](https://devtool.tech/file-type-detector) | 文件类型检测 |

---

## 十五、实用工具

### 15.1 视频解析

| 工具 | 链接 | 说明 |
|------|------|------|
| 短视频解析 | [tools.qzxdp.cn/video_spider](https://tools.qzxdp.cn/video_spider) | 抖音/快手/西瓜等视频去水印下载 |
| B 站视频解析 | [tools.qzxdp.cn/bili_video](https://tools.qzxdp.cn/bili_video) | B 站视频下载 |
| 网易云音乐/MV 下载 | [tools.qzxdp.cn/wyy](https://tools.qzxdp.cn/wyy) | 网易云音乐下载 |
| 网易云 VIP 解析 | [tools.qzxdp.cn/wyy_vip](https://tools.qzxdp.cn/wyy_vip) | VIP 音乐下载 |
| 查 B 站弹幕发送者 | [tools.qzxdp.cn/bili_danmu](https://tools.qzxdp.cn/bili_danmu) | B 站弹幕发送者查询 |

### 15.2 文件传输

| 工具 | 链接 | 说明 |
|------|------|------|
| 零代码快传 | [lingdaima.com/file](https://lingdaima.com/file/) | 在线文件传输，上限 4GB |
| Office 文档转换 | [lingdaima.com/doc](https://www.lingdaima.com/doc) | PDF/Excel/Word/PPT 格式转换 |

### 15.3 归属地查询

| 工具 | 链接 | 说明 |
|------|------|------|
| 手机归属地查询 | [tools.qzxdp.cn/mobile](https://tools.qzxdp.cn/mobile) | 手机号码归属地查询 |
| 身份证归属地查询 | [tools.qzxdp.cn/idcard](https://tools.qzxdp.cn/idcard) | 身份证号码归属地验证 |

### 15.4 表情符号

| 工具 | 链接 | 说明 |
|------|------|------|
| emoji 表情 | [tools.qzxdp.cn/emoji](https://tools.qzxdp.cn/emoji) | emoji 表情大全、翻译器 |
| 特殊符号大全 | [tools.qzxdp.cn/special_symbols](https://tools.qzxdp.cn/special_symbols) | 特殊符号、表情符号 |

---

## 十六、娱乐工具

| 工具 | 链接 | 说明 |
|------|------|------|
| 在线钢琴 | [tools.qzxdp.cn/piano](https://tools.qzxdp.cn/piano) | 在线弹钢琴 |
| 在线语音合成 | [tools.qzxdp.cn/speech_synthesis](https://tools.qzxdp.cn/speech_synthesis) | 录音、配音、广告配音 |
| 支付宝到账语音 | [tools.qzxdp.cn/alipay_arrival](https://tools.qzxdp.cn/alipay_arrival) | 支付宝到账语音生成 |
| 文章生成器 | [tools.qzxdp.cn/bullshit_generator](https://tools.qzxdp.cn/bullshit_generator) | 垃圾文章生成器 |
| 让流量消失 | [tools.qzxdp.cn/bandwidth_waste](https://tools.qzxdp.cn/bandwidth_waste) | 流量消耗器 |
| 国庆头像生成 | [tools.qzxdp.cn/tool/gq_avatar](https://tools.qzxdp.cn/tool/gq_avatar/) | 国庆头像生成器 |

---

## 十七、零代码工具箱 Beta

| 工具 | 链接 | 说明 |
|------|------|------|
| 零代码工具箱 Beta 版 | [beta.lingdaima.com](https://beta.lingdaima.com) | 上百种在线工具，简洁好用无广告 |

---

## 工具分类索引

### 按场景分类

| 场景 | 推荐工具 |
|------|----------|
| 编码解码 | Base64、URL、Unicode、HTML Entity |
| 加密解密 | AES、DES、RSA、Hash |
| JSON 处理 | 格式化、压缩、转换 |
| 数据转换 | CSV/JSON/YAML/Excel/Markdown 互转 |
| 颜色工具 | RGB/HSL 转换、配色、渐变 |
| CSS 样式 | 阴影、按钮、布局、背景 |
| 图片处理 | 压缩、转换、编辑、水印 |
| 代码运行 | 多语言在线编译运行 |
| 开发辅助 | UUID、JWT、Cron、正则 |
| SEO 站长 | 域名、IP、外链、测速 |

### 按网站分类

| 网站 | 工具数量 | 特色 |
|------|----------|------|
| devtool.tech | 60+ | 编码、颜色、表格转换 |
| lingdaima.com | 15+ | CSS 样式生成 |
| tool.lvtao.net | 100+ | 多语言编译 |
| tools.qzxdp.cn | 80+ | 视频、音乐、实用工具 |

---

> 本文档整合了四个优秀工具网站的资源，涵盖前端开发、后端开发、运维部署、设计配色等多个领域。建议收藏本页，按需查找使用。
