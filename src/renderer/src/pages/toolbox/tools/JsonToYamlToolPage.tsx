import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type ConvertMode = 'json-to-yaml' | 'yaml-to-json'

export default function JsonToYamlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔄 JSON/YAML 互转</h1>
        <p>JSON 与 YAML 格式互相转换，支持导出文件</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>JSON 与 YAML 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>JSON</th>
                  <th>YAML</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>语法</td>
                  <td>大括号、引号、逗号</td>
                  <td>缩进、冒号、短横线</td>
                </tr>
                <tr>
                  <td>注释</td>
                  <td>❌ 不支持</td>
                  <td>✅ 支持 # 注释</td>
                </tr>
                <tr>
                  <td>可读性</td>
                  <td>中等</td>
                  <td>高（人类友好）</td>
                </tr>
                <tr>
                  <td>解析速度</td>
                  <td>快</td>
                  <td>较慢</td>
                </tr>
                <tr>
                  <td>使用场景</td>
                  <td>API、配置文件</td>
                  <td>配置文件、CI/CD</td>
                </tr>
                <tr>
                  <td>数据类型</td>
                  <td>对象、数组、字符串、数字、布尔、null</td>
                  <td>同 JSON + 日期、二进制、集合</td>
                </tr>
              </tbody>
            </table>

            <h2>格式示例对比</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h3 style={{ marginBottom: '8px' }}>JSON 格式</h3>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', fontSize: '13px', overflow: 'auto' }}>
{`{
  "name": "张三",
  "age": 25,
  "skills": [
    "JavaScript",
    "Python"
  ],
  "address": {
    "city": "北京",
    "district": "朝阳区"
  }
}`}
                </pre>
              </div>
              <div>
                <h3 style={{ marginBottom: '8px' }}>YAML 格式</h3>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', fontSize: '13px', overflow: 'auto' }}>
{`name: 张三
age: 25
skills:
  - JavaScript
  - Python
address:
  city: 北京
  district: 朝阳区`}
                </pre>
              </div>
            </div>

            <h2>转换规则</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>对象 → 映射</h3>
                <p>JSON 对象转为 YAML 键值对映射</p>
              </div>
              <div className="feature-card">
                <h3>数组 → 列表</h3>
                <p>JSON 数组转为 YAML 短横线列表</p>
              </div>
              <div className="feature-card">
                <h3>字符串</h3>
                <p>特殊字符时自动加引号保护</p>
              </div>
              <div className="feature-card">
                <h3>缩进</h3>
                <p>YAML 使用 2 空格缩进表示层级</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>⚙️ 配置文件</h4>
                <p>Kubernetes、Docker Compose、Ansible 使用 YAML</p>
              </div>
              <div className="scenario-card">
                <h4>🔄 CI/CD</h4>
                <p>GitHub Actions、GitLab CI、CircleCI 配置</p>
              </div>
              <div className="scenario-card">
                <h4>📋 API 文档</h4>
                <p>OpenAPI/Swagger 规范使用 YAML</p>
              </div>
              <div className="scenario-card">
                <h4>🌐 数据迁移</h4>
                <p>JSON API 数据转为 YAML 配置文件</p>
              </div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>⚠️ 重要提示</strong>
              <ul>
                <li>YAML 对缩进敏感，必须使用空格而非 Tab</li>
                <li>YAML 中的注释转 JSON 后会丢失</li>
                <li>YAML 支持更多数据类型（日期、二进制等），转 JSON 时可能丢失</li>
                <li>复杂 YAML（锚点、引用）转 JSON 需要特殊处理</li>
                <li>JSON 数字精度在 YAML 中可能表现不同</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON/YAML 双向转换</h2>
            <JsonYamlConverter />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript - 使用 js-yaml 库</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>📦 安装: <code>npm install js-yaml</code></p>
              <p>✅ 功能完整，支持 YAML 1.2 规范</p>
            </div>
            <div className="code-block">
              <pre>{`import * as yaml from 'js-yaml';

// ============ JSON 转 YAML ============
const jsonData = {
  name: "张三",
  age: 25,
  skills: ["JavaScript", "Python"],
  address: {
    city: "北京",
    district: "朝阳区"
  }
};

// 转换为 YAML
const yamlStr = yaml.dump(jsonData, {
  indent: 2,           // 缩进空格数
  lineWidth: -1,       // 不自动换行
  noRefs: true,        // 不使用引用
  quotingType: '"',    // 引号类型
  forceQuotes: false   // 仅必要时加引号
});

console.log(yamlStr);
// name: 张三
// age: 25
// skills:
//   - JavaScript
//   - Python
// address:
//   city: 北京
//   district: 朝阳区

// ============ YAML 转 JSON ============
const yamlStr2 = \`
name: 李四
age: 30
skills:
  - Go
  - Rust
\`;

// 解析 YAML 为 JSON
const jsonData2 = yaml.load(yamlStr2);
console.log(JSON.stringify(jsonData2, null, 2));
// {
//   "name": "李四",
//   "age": 30,
//   "skills": ["Go", "Rust"]
// }

// ============ YAML 转 JSON 字符串 ============
function yamlToJson(yamlString) {
  try {
    const data = yaml.load(yamlString);
    return JSON.stringify(data, null, 2);
  } catch (e) {
    console.error('YAML 解析错误:', e.message);
    return null;
  }
}

// ============ JSON 转 YAML 字符串 ============
function jsonToYaml(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return yaml.dump(data, { indent: 2, lineWidth: -1 });
  } catch (e) {
    console.error('JSON 解析错误:', e.message);
    return null;
  }
}`}</pre>
            </div>

            <h2>JavaScript - 纯实现（无依赖）</h2>
            <div className="code-block">
              <pre>{`// ============ JSON 转 YAML (无依赖) ============
function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (obj === true) return 'true';
  if (obj === false) return 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    // 特殊字符需要引号
    if (/[\\n:#{},\\[\\]]/.test(obj) || obj === '' || /^\\s|\\s$/.test(obj)) {
      return \`"\${obj.replace(/"/g, '\\\\"')}"\`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const val = jsonToYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null) {
        return \`-\\n\${val.split('\\n').map(l => spaces + '  ' + l).join('\\n')}\`;
      }
      return \`- \${val}\`;
    }).join('\\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    return entries.map(([key, value]) => {
      const val = jsonToYaml(value, indent + 1);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return \`\${key}:\\n\${val.split('\\n').map(l => spaces + '  ' + l).join('\\n')}\`;
      }
      if (Array.isArray(value) && value.length > 0) {
        return \`\${key}:\\n\${val.split('\\n').map(l => spaces + l).join('\\n')}\`;
      }
      return \`\${key}: \${val}\`;
    }).join('\\n');
  }

  return String(obj);
}

// ============ YAML 转 JSON (简单实现) ============
function yamlToJson(yamlStr) {
  const lines = yamlStr.split('\\n');
  const result = {};
  const stack = [result];
  const indentStack = [-1];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\\S/);
    const content = line.trim();

    // 处理数组项
    if (content.startsWith('- ')) {
      const value = content.slice(2);
      const current = stack[stack.length - 1];
      if (!Array.isArray(current)) {
        // 转换为数组
        const parent = stack[stack.length - 2];
        const lastKey = Object.keys(parent).pop();
        parent[lastKey] = [];
        stack[stack.length - 1] = parent[lastKey];
      }
      const arr = stack[stack.length - 1];
      if (value.includes(':')) {
        // 数组项是对象
        const obj = {};
        arr.push(obj);
        const [k, v] = value.split(':').map(s => s.trim());
        obj[k] = parseValue(v);
      } else {
        arr.push(parseValue(value));
      }
      continue;
    }

    // 处理键值对
    const colonIndex = content.indexOf(':');
    if (colonIndex === -1) continue;

    const key = content.slice(0, colonIndex).trim();
    const value = content.slice(colonIndex + 1).trim();

    // 调整栈深度
    while (indent <= indentStack[indentStack.length - 1]) {
      stack.pop();
      indentStack.pop();
    }

    const current = stack[stack.length - 1];
    if (value === '' || value === '|' || value === '>') {
      // 嵌套对象
      current[key] = {};
      stack.push(current[key]);
      indentStack.push(indent);
    } else {
      current[key] = parseValue(value);
    }
  }

  return result;
}

function parseValue(value) {
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\\d+(\\.\\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}`}</pre>
            </div>

            <h2>Node.js - 内置模块</h2>
            <div className="code-block">
              <pre>{`// Node.js 没有内置 YAML 支持，需要安装库
// npm install js-yaml

const yaml = require('js-yaml');
const fs = require('fs');

// ============ 从文件读取 YAML ============
const yamlContent = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.load(yamlContent);
console.log(config);

// ============ 写入 YAML 文件 ============
const data = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp'
  },
  cache: {
    enabled: true,
    ttl: 3600
  }
};

fs.writeFileSync('output.yaml', yaml.dump(data, { indent: 2 }));

// ============ 流式处理大文件 ============
async function parseLargeYaml(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return yaml.load(content, { json: true }); // json: true 更宽松
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import yaml
import json

# ============ JSON 转 YAML ============
json_data = {
    "name": "张三",
    "age": 25,
    "skills": ["JavaScript", "Python"],
    "address": {"city": "北京", "district": "朝阳区"}
}

# 转换为 YAML 字符串
yaml_str = yaml.dump(
    json_data,
    allow_unicode=True,      # 支持中文
    default_flow_style=False, # 块样式
    indent=2,
    sort_keys=False          # 保持键顺序
)
print(yaml_str)

# 写入 YAML 文件
with open('output.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(json_data, f, allow_unicode=True)

# ============ YAML 转 JSON ============
yaml_str = '''
name: 李四
age: 30
skills:
  - Go
  - Rust
address:
  city: 上海
  district: 浦东新区
'''

# 解析 YAML
data = yaml.safe_load(yaml_str)

# 转换为 JSON 字符串
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print(json_str)

# ============ 从文件读取 ============
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# ============ 多文档 YAML ============
multi_yaml = '''
---
name: doc1
value: 1
---
name: doc2
value: 2
'''

docs = list(yaml.safe_load_all(multi_yaml))
print(docs)  # [{'name': 'doc1', 'value': 1}, {'name': 'doc2', 'value': 2}]`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
    "gopkg.in/yaml.v3"
)

// ============ JSON 转 YAML ============
func jsonToYaml(jsonStr string) (string, error) {
    var data interface{}
    if err := json.Unmarshal([]byte(jsonStr), &data); err != nil {
        return "", err
    }

    yamlBytes, err := yaml.Marshal(data)
    if err != nil {
        return "", err
    }
    return string(yamlBytes), nil
}

// ============ YAML 转 JSON ============
func yamlToJson(yamlStr string) (string, error) {
    var data interface{}
    if err := yaml.Unmarshal([]byte(yamlStr), &data); err != nil {
        return "", err
    }

    jsonBytes, err := json.MarshalIndent(data, "", "  ")
    if err != nil {
        return "", err
    }
    return string(jsonBytes), nil
}

func main() {
    jsonData := \`{
        "name": "张三",
        "age": 25,
        "skills": ["JavaScript", "Python"]
    }\`

    // JSON → YAML
    yamlStr, _ := jsonToYaml(jsonData)
    fmt.Println("YAML:")
    fmt.Println(yamlStr)

    // YAML → JSON
    yamlData := \`
name: 李四
age: 30
skills:
  - Go
  - Rust
\`
    jsonStr, _ := yamlToJson(yamlData)
    fmt.Println("JSON:")
    fmt.Println(jsonStr)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;

import java.util.Map;

public class JsonYamlConverter {

    private static final ObjectMapper jsonMapper = new ObjectMapper();
    private static final ObjectMapper yamlMapper = new ObjectMapper(
        new YAMLFactory()
            .disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER)
    );

    // JSON 转 YAML
    public static String jsonToYaml(String json) throws Exception {
        Object data = jsonMapper.readValue(json, Object.class);
        return yamlMapper.writeValueAsString(data);
    }

    // YAML 转 JSON
    public static String yamlToJson(String yaml) throws Exception {
        Object data = yamlMapper.readValue(yaml, Object.class);
        return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
    }

    public static void main(String[] args) throws Exception {
        String json = \"""
            {
                "name": "张三",
                "age": 25,
                "skills": ["JavaScript", "Python"]
            }
            \""";

        // JSON → YAML
        String yaml = jsonToYaml(json);
        System.out.println("YAML:\\n" + yaml);

        // YAML → JSON
        String yamlInput = \"""
            name: 李四
            age: 30
            skills:
              - Go
              - Rust
            \""";
        String jsonOutput = yamlToJson(yamlInput);
        System.out.println("JSON:\\n" + jsonOutput);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonYamlConverter() {
  const [mode, setMode] = useState<ConvertMode>('json-to-yaml')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // JSON 转 YAML
  const jsonToYaml = (obj: unknown, indent: number = 0): string => {
    const spaces = '  '.repeat(indent)
    if (obj === null) return 'null'
    if (obj === true) return 'true'
    if (obj === false) return 'false'
    if (typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
      if (/[\n:#{},\[\]]/.test(obj) || obj === '' || /^\s|\s$/.test(obj)) {
        return `"${obj.replace(/"/g, '\\"')}"`
      }
      return obj
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map((item) => {
        const value = jsonToYaml(item, indent + 1)
        if (typeof item === 'object' && item !== null) {
          return `- \n${value.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        return `- ${value}`
      }).join('\n')
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      return entries.map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1)
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value as object).length > 0) {
          return `${key}:\n${yamlValue.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        if (Array.isArray(value) && value.length > 0) {
          return `${key}:\n${yamlValue.split('\n').map((l) => spaces + l).join('\n')}`
        }
        return `${key}: ${yamlValue}`
      }).join('\n')
    }
    return String(obj)
  }

  // YAML 转 JSON (简单实现)
  const yamlToJson = (yamlStr: string): unknown => {
    const lines = yamlStr.split('\n')
    const result: Record<string, unknown> = {}
    const stack: (Record<string, unknown> | unknown[])[] = [result]
    const indentStack: number[] = [-1]
    let lastKey = ''

    const parseValue = (value: string): unknown => {
      if (value === 'null' || value === '~') return null
      if (value === 'true') return true
      if (value === 'false') return false
      if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/\\"/g, '"')
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1)
      }
      return value
    }

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue

      const indent = line.search(/\S/)
      const content = line.trim()

      if (content.startsWith('- ')) {
        const value = content.slice(2)
        let current = stack[stack.length - 1]

        if (!Array.isArray(current)) {
          const parent = stack[stack.length - 2] as Record<string, unknown>
          parent[lastKey] = []
          stack[stack.length - 1] = parent[lastKey] as unknown[]
          current = parent[lastKey] as unknown[]
        }

        const arr = current as unknown[]
        if (value.includes(':')) {
          const obj: Record<string, unknown> = {}
          arr.push(obj)
          const [k, v] = value.split(':').map(s => s.trim())
          if (v) obj[k] = parseValue(v)
          else {
            obj[k] = {}
            stack.push(obj)
            indentStack.push(indent)
          }
        } else {
          arr.push(parseValue(value))
        }
        continue
      }

      const colonIndex = content.indexOf(':')
      if (colonIndex === -1) continue

      const key = content.slice(0, colonIndex).trim()
      const value = content.slice(colonIndex + 1).trim()

      while (indent <= indentStack[indentStack.length - 1]) {
        stack.pop()
        indentStack.pop()
      }

      const current = stack[stack.length - 1] as Record<string, unknown>
      lastKey = key

      if (value === '' || value === '|' || value === '>') {
        current[key] = {}
        stack.push(current[key] as Record<string, unknown>)
        indentStack.push(indent)
      } else {
        current[key] = parseValue(value)
      }
    }

    return result
  }

  const handleConvert = () => {
    setError(null)
    try {
      if (mode === 'json-to-yaml') {
        const parsed = JSON.parse(input)
        setOutput(jsonToYaml(parsed))
      } else {
        const parsed = yamlToJson(input)
        setOutput(JSON.stringify(parsed, null, 2))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    if (output) {
      setInput(output)
      setOutput('')
      setMode(mode === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml')
    }
  }

  const handleCopy = () => {
    if (output) copyToClipboard(output)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const handleExport = () => {
    if (!output) return

    const filename = mode === 'json-to-yaml' ? 'data.yaml' : 'data.json'
    const mimeType = mode === 'json-to-yaml' ? 'text/yaml' : 'application/json'

    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sampleJson = `{
  "name": "张三",
  "age": 25,
  "skills": ["JavaScript", "Python"],
  "address": {
    "city": "北京",
    "district": "朝阳区"
  }
}`

  const sampleYaml = `name: 李四
age: 30
skills:
  - Go
  - Rust
address:
  city: 上海
  district: 浦东新区`

  const loadSample = () => {
    setInput(mode === 'json-to-yaml' ? sampleJson : sampleYaml)
  }

  return (
    <div className="connection-demo">
      <div className="config-grid" style={{ marginBottom: 16 }}>
        <div className="config-item">
          <label>转换方向</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as ConvertMode)}>
            <option value="json-to-yaml">JSON → YAML</option>
            <option value="yaml-to-json">YAML → JSON</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginBottom: 12 }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>输入 {mode === 'json-to-yaml' ? 'JSON' : 'YAML'}</label>
          <button onClick={loadSample} style={{ padding: '4px 8px', fontSize: '12px', background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            加载示例
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'json-to-yaml' ? '输入 JSON 数据...' : '输入 YAML 数据...'}
          rows={10}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '13px',
            resize: 'vertical'
          }}
        />
      </div>

      <div className="demo-controls">
        <button onClick={handleConvert}>转换</button>
        {output && (
          <>
            <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>交换</button>
            <button onClick={handleCopy} style={{ background: '#e0e0e0', color: '#333' }}>复制结果</button>
            <button onClick={handleExport} style={{ background: '#4caf50', color: '#fff' }}>
              导出 .{mode === 'json-to-yaml' ? 'yaml' : 'json'}
            </button>
          </>
        )}
        <button onClick={handleClear} style={{ background: '#e0e0e0', color: '#333' }}>清空</button>
      </div>

      {output && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            输出 {mode === 'json-to-yaml' ? 'YAML' : 'JSON'}
          </label>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
