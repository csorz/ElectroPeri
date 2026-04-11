# 前端工具箱清单（常用）

本文档整理前端开发中高频使用的小工具，按场景分类，便于快速查找和选型。

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

## 1. 编码与加解密

### 1.1 Hash 计算（文件 / 字符串）

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| 计算字符串 MD5/SHA1/SHA256 | [CyberChef](https://gchq.github.io/CyberChef/) | 支持多算法串联，适合调试 |
| 计算文件 MD5/SHA1/SHA256 | [HashMyFiles](https://www.nirsoft.net/utils/hash_my_files.html) / `shasum` / `md5` | 本地文件校验最常用 |
| 浏览器内快速算 Hash | [DevToys](https://devtoys.app/) | 桌面工具，离线可用 |

常用命令（macOS）：

```bash
# SHA-1
shasum -a 1 your-file.zip

# SHA-256
shasum -a 256 your-file.zip

# MD5
md5 your-file.zip
```

---

## 2. JSON 处理

### 2.1 JSON 格式化 / 压缩 / 校验

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| JSON 格式化（Pretty） | [JSON Formatter](https://jsonformatter.org/) | 支持缩进、排序、校验 |
| JSON 压缩（Minify） | [JSON Minify](https://www.jsonformatter.org/json-minify) | 可直接压缩粘贴内容 |
| 本地编辑与格式化 | VSCode + `Format Document` | 开发期最稳定 |
| 命令行格式化 | `jq` | 适合脚本与 CI |

常用命令：

```bash
# 美化
echo '{"a":1,"b":[2,3]}' | jq .

# 压缩
echo '{"a":1,"b":[2,3]}' | jq -c .
```

---

## 3. URL 与参数处理

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| URL 编码/解码 | [URL Encode/Decode](https://www.urlencoder.org/) | 快速处理 query 参数 |
| Query 参数转对象查看 | 浏览器 DevTools / 在线解析器 | 排查接口调用问题 |
| Base64 编码/解码 | [Base64 Guru](https://base64.guru/) / DevToys | 常用于 token/二进制中转 |

---

## 4. 时间与时间戳

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| 时间戳与日期互转 | [Epoch Converter](https://www.epochconverter.com/) | 支持秒/毫秒 |
| 时区转换 | [World Time Buddy](https://www.worldtimebuddy.com/) | 联调多时区接口 |
| Day.js 调试 | 本地 REPL / 浏览器控制台 | 便于验证格式化规则 |

---

## 5. 请求调试与接口联调

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| REST 接口调试 | Postman / Apifox / Insomnia | 常规 API 联调 |
| WebSocket 调试 | [Hoppscotch](https://hoppscotch.io/) | 轻量在线调试 |
| 抓包与重放 | Charles / Proxyman / Fiddler | 排查请求头、缓存、代理问题 |

---

## 6. 文本与数据转换

| 场景 | 推荐工具 | 说明 |
|---|---|---|
| 正则调试 | [regex101](https://regex101.com/) | 支持解释与分组可视化 |
| Diff 对比 | [Diffchecker](https://www.diffchecker.com/) / VSCode Compare | 文本差异定位 |
| CSV/Excel 转 JSON | [CSVJSON](https://csvjson.com/csv2json) | mock 数据快速转换 |
| YAML/JSON 互转 | [Code Beautify](https://codebeautify.org/) | 配置文件迁移常用 |

---

