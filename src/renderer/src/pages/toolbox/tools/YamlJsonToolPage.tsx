import { useState } from 'react'
import './ToolPage.css'

export default function YamlJsonToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>YAML/JSON 互转</h1>
        <p>YAML to JSON Converter - YAML 与 JSON 格式互相转换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>格式对比</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>YAML 格式</h3>
                <p>YAML Ain't Markup Language，一种人类可读的数据序列化格式，使用缩进表示层级，支持注释、多行字符串</p>
              </div>
              <div className="feature-card">
                <h3>JSON 格式</h3>
                <p>JavaScript Object Notation，轻量级数据交换格式，结构清晰，被广泛用于 API 传输和配置文件</p>
              </div>
              <div className="feature-card">
                <h3>可读性</h3>
                <p>YAML 更注重人类可读性，支持注释和更灵活的语法；JSON 更严格，便于机器解析</p>
              </div>
              <div className="feature-card">
                <h3>使用场景</h3>
                <p>YAML 常用于配置文件（Kubernetes、CI/CD）；JSON 常用于 API 通信和数据存储</p>
              </div>
            </div>

            <h2>YAML 语法规则</h2>
            <div className="info-box">
              <strong>YAML 基本语法</strong>
              <ul>
                <li>使用缩进表示层级关系（通常 2 空格）</li>
                <li>使用冒号分隔键值，使用短横线表示数组项</li>
                <li>支持单行注释（以 # 开头）</li>
                <li>支持多行字符串（| 保留换行，&gt; 折叠换行）</li>
                <li>无需引号包裹字符串（特殊字符除外）</li>
              </ul>
            </div>

            <h2>格式对比表</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>特性</th>
                    <th>YAML</th>
                    <th>JSON</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>注释</td>
                    <td style={{ color: '#4caf50' }}>支持</td>
                    <td style={{ color: '#f44336' }}>不支持</td>
                  </tr>
                  <tr>
                    <td>多行字符串</td>
                    <td style={{ color: '#4caf50' }}>原生支持</td>
                    <td style={{ color: '#666' }}>需转义</td>
                  </tr>
                  <tr>
                    <td>数据类型</td>
                    <td>更丰富（日期、二进制等）</td>
                    <td>基础类型</td>
                  </tr>
                  <tr>
                    <td>语法严格性</td>
                    <td>较宽松</td>
                    <td>严格</td>
                  </tr>
                  <tr>
                    <td>可读性</td>
                    <td>高</td>
                    <td>中等</td>
                  </tr>
                  <tr>
                    <td>解析复杂度</td>
                    <td>较高</td>
                    <td>较低</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>YAML 数据类型</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>YAML 表示</th>
                    <th>JSON 表示</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>字符串</td>
                    <td><code>hello</code> 或 <code>"hello"</code></td>
                    <td><code>"hello"</code></td>
                  </tr>
                  <tr>
                    <td>数字</td>
                    <td><code>42</code> 或 <code>3.14</code></td>
                    <td><code>42</code> 或 <code>3.14</code></td>
                  </tr>
                  <tr>
                    <td>布尔</td>
                    <td><code>true</code> / <code>false</code></td>
                    <td><code>true</code> / <code>false</code></td>
                  </tr>
                  <tr>
                    <td>空值</td>
                    <td><code>null</code> 或 <code>~</code></td>
                    <td><code>null</code></td>
                  </tr>
                  <tr>
                    <td>数组</td>
                    <td><code>- item1</code></td>
                    <td><code>["item1"]</code></td>
                  </tr>
                  <tr>
                    <td>对象</td>
                    <td><code>key: value</code></td>
                    <td><code>{`{"key": "value"}`}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Kubernetes 配置</strong> - K8s 使用 YAML 定义资源清单</li>
              <li><strong>CI/CD 配置</strong> - GitHub Actions、GitLab CI 等使用 YAML</li>
              <li><strong>应用配置</strong> - Spring Boot、Django 等支持 YAML 配置</li>
              <li><strong>API 定义</strong> - OpenAPI/Swagger 规范可用 YAML 编写</li>
              <li><strong>数据迁移</strong> - 在不同格式间转换数据</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>YAML/JSON 转换</h2>
            <YamlJsonDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 js-yaml 库
import yaml from 'js-yaml'

// YAML 转 JSON
const yamlText = \`
name: Alice
age: 25
hobbies:
  - reading
  - coding
address:
  city: Beijing
  country: China
\`

const jsonObj = yaml.load(yamlText)
console.log(JSON.stringify(jsonObj, null, 2))

// JSON 转 YAML
const jsonData = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing',
    country: 'China'
  }
}

const yamlStr = yaml.dump(jsonData, {
  indent: 2,
  lineWidth: -1,  // 不换行
  noRefs: true    // 不使用引用
})
console.log(yamlStr)`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import yaml
import json

# YAML 转 JSON
yaml_text = '''
name: Alice
age: 25
hobbies:
  - reading
  - coding
address:
  city: Beijing
  country: China
'''

# 解析 YAML
data = yaml.safe_load(yaml_text)
print(json.dumps(data, indent=2, ensure_ascii=False))

# JSON 转 YAML
json_data = {
    "name": "Alice",
    "age": 25,
    "hobbies": ["reading", "coding"],
    "address": {
        "city": "Beijing",
        "country": "China"
    }
}

yaml_str = yaml.dump(
    json_data,
    allow_unicode=True,  # 支持中文
    default_flow_style=False,  # 块样式
    indent=2
)
print(yaml_str)

# 从文件读取
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# 写入文件
with open('output.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(json_data, f, allow_unicode=True)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"

    "gopkg.in/yaml.v3"
)

type Config struct {
    Name    string   \`yaml:"name" json:"name"\`
    Age     int      \`yaml:"age" json:"age"\`
    Hobbies []string \`yaml:"hobbies" json:"hobbies"\`
    Address struct {
        City    string \`yaml:"city" json:"city"\`
        Country string \`yaml:"country" json:"country"\`
    } \`yaml:"address" json:"address"\`
}

func main() {
    yamlText := \`
name: Alice
age: 25
hobbies:
  - reading
  - coding
address:
  city: Beijing
  country: China
\`

    // YAML 转 JSON
    var config Config
    if err := yaml.Unmarshal([]byte(yamlText), &config); err != nil {
        panic(err)
    }

    jsonBytes, _ := json.MarshalIndent(config, "", "  ")
    fmt.Println("JSON:")
    fmt.Println(string(jsonBytes))

    // JSON 转 YAML
    jsonData := \`{"name":"Bob","age":30,"hobbies":["gaming"],"address":{"city":"Shanghai","country":"China"}}\`

    var data Config
    json.Unmarshal([]byte(jsonData), &data)

    yamlBytes, _ := yaml.Marshal(data)
    fmt.Println("\\nYAML:")
    fmt.Println(string(yamlBytes))
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import java.util.Map;

public class YamlJsonConverter {

    private static final ObjectMapper jsonMapper = new ObjectMapper();
    private static final YAMLMapper yamlMapper = new YAMLMapper();

    // YAML 转 JSON
    public static String yamlToJson(String yaml) throws Exception {
        Object obj = yamlMapper.readValue(yaml, Object.class);
        return jsonMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(obj);
    }

    // JSON 转 YAML
    public static String jsonToYaml(String json) throws Exception {
        Object obj = jsonMapper.readValue(json, Object.class);
        return yamlMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(obj);
    }

    public static void main(String[] args) throws Exception {
        String yaml = \"""
            name: Alice
            age: 25
            hobbies:
              - reading
              - coding
            address:
              city: Beijing
              country: China
            \""";

        System.out.println("YAML to JSON:");
        System.out.println(yamlToJson(yaml));

        String json = \"""
            {
              "name": "Bob",
              "age": 30,
              "hobbies": ["gaming"],
              "address": {
                "city": "Shanghai",
                "country": "China"
              }
            }
            \""";

        System.out.println("\\nJSON to YAML:");
        System.out.println(jsonToYaml(json));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// YAML/JSON 转换演示组件
function YamlJsonDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'yamlToJson' | 'jsonToYaml'>('yamlToJson')
  const [error, setError] = useState<string | null>(null)

  // 简单的 YAML 解析器
  const parseYaml = (yaml: string): unknown => {
    const lines = yaml.split('\n')
    return parseYamlLines(lines, 0, 0)
  }

  const parseYamlLines = (lines: string[], startIndex: number, baseIndent: number): unknown => {
    const result: Record<string, unknown> = {}
    let i = startIndex

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed === '' || trimmed.startsWith('#')) {
        i++
        continue
      }

      const indent = line.length - line.trimStart().length
      if (indent < baseIndent) break

      if (trimmed.startsWith('- ')) {
        // 数组
        const arr: unknown[] = []
        while (i < lines.length) {
          const currentLine = lines[i]
          const currentTrimmed = currentLine.trim()
          const currentIndent = currentLine.length - currentLine.trimStart().length

          if (currentIndent < indent) break
          if (currentTrimmed.startsWith('- ')) {
            const value = currentTrimmed.slice(2)
            if (value.includes(':')) {
              // 数组项是对象
              const objLines = [value]
              i++
              while (i < lines.length) {
                const nextLine = lines[i]
                const nextIndent = nextLine.length - nextLine.trimStart().length
                if (nextIndent > currentIndent && !nextLine.trim().startsWith('- ')) {
                  objLines.push('  ' + nextLine.trim())
                  i++
                } else {
                  break
                }
              }
              arr.push(parseYamlLines(objLines, 0, 0))
            } else {
              arr.push(parseYamlValue(value))
              i++
            }
          } else {
            break
          }
        }
        return arr
      }

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim()
        const value = trimmed.slice(colonIndex + 1).trim()

        if (value === '' || value === '|' || value === '>') {
          // 嵌套对象或多行字符串
          i++
          const nestedIndent = indent + 2
          if (value === '|' || value === '>') {
            // 多行字符串
            const strLines: string[] = []
            while (i < lines.length) {
              const nextLine = lines[i]
              const nextIndent = nextLine.length - nextLine.trimStart().length
              if (nextIndent >= nestedIndent && nextLine.trim()) {
                strLines.push(nextLine.trim())
                i++
              } else {
                break
              }
            }
            result[key] = strLines.join('\n')
          } else {
            result[key] = parseYamlLines(lines, i, nestedIndent)
            // 更新 i 到嵌套对象结束位置
            while (i < lines.length) {
              const nextIndent = lines[i].length - lines[i].trimStart().length
              if (nextIndent < nestedIndent && lines[i].trim()) break
              i++
            }
          }
        } else {
          result[key] = parseYamlValue(value)
          i++
        }
      } else {
        i++
      }
    }

    return result
  }

  const parseYamlValue = (value: string): unknown => {
    if (value === 'null' || value === '~') return null
    if (value === 'true') return true
    if (value === 'false') return false
    if (/^-?\d+$/.test(value)) return parseInt(value, 10)
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }
    return value
  }

  // JSON 转 YAML
  const jsonToYaml = (obj: unknown, indent: number = 0): string => {
    const spaces = '  '.repeat(indent)
    if (obj === null) return 'null'
    if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes('"')) {
        return `"${obj.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
      }
      return obj
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map((item) => {
        const value = jsonToYaml(item, indent + 1)
        if (typeof item === 'object' && item !== null) {
          return `-\n${value.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        return `- ${value}`
      }).join('\n')
    }
    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      return entries.map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1)
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
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

  const handleConvert = () => {
    setError(null)
    setOutput('')
    try {
      if (mode === 'yamlToJson') {
        const result = parseYaml(input)
        setOutput(JSON.stringify(result, null, 2))
      } else {
        const parsed = JSON.parse(input)
        setOutput(jsonToYaml(parsed))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'yamlToJson' ? 'jsonToYaml' : 'yamlToJson')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="yaml-json-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>转换模式</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as 'yamlToJson' | 'jsonToYaml')}>
            <option value="yamlToJson">YAML to JSON</option>
            <option value="jsonToYaml">JSON to YAML</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="info-box warning" style={{ marginTop: '16px' }}>
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="config-item" style={{ marginTop: '16px' }}>
        <label>{mode === 'yamlToJson' ? 'YAML 输入' : 'JSON 输入'}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'yamlToJson' ? 'name: Alice\nage: 25\ncity: Beijing' : '{"name": "Alice", "age": 25}'}
          rows={8}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            resize: 'vertical'
          }}
        />
      </div>

      <div className="demo-controls" style={{ marginTop: '16px' }}>
        <button onClick={handleConvert}>转换</button>
        <button onClick={handleSwap}>交换输入输出</button>
        {output && <button onClick={handleCopy}>复制结果</button>}
      </div>

      {output && (
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
            {mode === 'yamlToJson' ? 'JSON 输出' : 'YAML 输出'}
          </label>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px',
            fontFamily: 'monospace',
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
