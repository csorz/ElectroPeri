import { useState } from 'react'
import './ToolPage.css'

export default function JsonToYamlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📝 JSON 转 YAML</h1>
        <p>将 JSON 数据转换为 YAML 格式</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 YAML</h2>
            <div className="info-box">
              <p>YAML（YAML Ain't Markup Language）是一种人类可读的数据序列化格式。相比 JSON，YAML 更加简洁，支持注释，更适合作为配置文件格式。</p>
            </div>

            <h2>JSON 与 YAML 对比</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>语法简洁</h3>
                <p>YAML 不需要大括号和引号，使用缩进表示层级关系</p>
              </div>
              <div className="feature-card">
                <h3>支持注释</h3>
                <p>YAML 支持 # 开头的单行注释，便于配置文件说明</p>
              </div>
              <div className="feature-card">
                <h3>丰富类型</h3>
                <p>支持字符串、数字、布尔、日期、null、对象、数组等</p>
              </div>
              <div className="feature-card">
                <h3>可读性强</h3>
                <p>YAML 设计目标是"人类友好"，配置文件更易阅读</p>
              </div>
            </div>

            <h2>转换规则</h2>
            <ul className="scenario-list">
              <li><strong>对象</strong> - 转换为 YAML 的键值对映射</li>
              <li><strong>数组</strong> - 使用短横线 - 表示列表项</li>
              <li><strong>字符串</strong> - 特殊字符时自动加引号</li>
              <li><strong>数字/布尔/null</strong> - 直接转换为对应类型</li>
              <li><strong>嵌套结构</strong> - 通过缩进表示层级</li>
            </ul>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>配置文件</strong> - Kubernetes、Docker Compose 等使用 YAML</li>
              <li><strong>CI/CD</strong> - GitHub Actions、GitLab CI 使用 YAML 配置</li>
              <li><strong>数据迁移</strong> - 将 JSON API 数据转为 YAML 配置</li>
              <li><strong>文档编写</strong> - YAML 格式更适合嵌入文档</li>
              <li><strong>国际化</strong> - YAML 格式的多语言文件更易维护</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>使用提醒</strong>
              <ul>
                <li>YAML 对缩进敏感，必须使用空格而非 Tab</li>
                <li>某些 JSON 特性在 YAML 中表现不同（如数字精度）</li>
                <li>复杂嵌套结构转换后需检查格式是否正确</li>
                <li>JSON 中的注释会在转换中丢失（JSON 本身不支持注释）</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON 转 YAML 工具</h2>
            <JsonToYamlDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// JSON 转 YAML (使用 js-yaml 库)
import yaml from 'js-yaml';

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
  indent: 2,
  lineWidth: -1,
  noRefs: true
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

// 简单实现 (不依赖库)
function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (typeof obj !== 'object') return String(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => {
      const val = jsonToYaml(item, indent + 1);
      return typeof item === 'object'
        ? \`-\\n\${val.split('\\n').map(l => spaces + '  ' + l).join('\\n')}\`
        : \`- \${val}\`;
    }).join('\\n');
  }

  return Object.entries(obj).map(([k, v]) => {
    const val = jsonToYaml(v, indent + 1);
    return typeof v === 'object' && v !== null
      ? \`\${k}:\\n\${val.split('\\n').map(l => spaces + '  ' + l).join('\\n')}\`
      : \`\${k}: \${val}\`;
  }).join('\\n');
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import yaml
import json

# JSON 转 YAML
json_str = '''
{
  "name": "张三",
  "age": 25,
  "skills": ["JavaScript", "Python"]
}
'''

# 解析 JSON
data = json.loads(json_str)

# 转换为 YAML
yaml_str = yaml.dump(
    data,
    allow_unicode=True,
    default_flow_style=False,
    indent=2
)

print(yaml_str)
# age: 25
# name: 张三
# skills:
# - JavaScript
# - Python

# 自定义转换
def json_to_yaml(json_obj, indent=0):
    spaces = '  ' * indent

    if json_obj is None:
        return 'null'
    if isinstance(json_obj, (bool, int, float)):
        return str(json_obj)
    if isinstance(json_obj, str):
        if any(c in json_obj for c in '\\n: #"'):
            return f'"{json_obj}"'
        return json_obj
    if isinstance(json_obj, list):
        lines = []
        for item in json_obj:
            val = json_to_yaml(item, indent + 1)
            if isinstance(item, dict):
                lines.append(f'-\\n{val}')
            else:
                lines.append(f'- {val}')
        return '\\n'.join(lines)
    if isinstance(json_obj, dict):
        lines = []
        for k, v in json_obj.items():
            val = json_to_yaml(v, indent + 1)
            if isinstance(v, dict):
                lines.append(f'{k}:\\n{val}')
            else:
                lines.append(f'{k}: {val}')
        return '\\n'.join(lines)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
    "gopkg.in/yaml.v3"
)

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

func main() {
    jsonStr := \`{
        "name": "张三",
        "age": 25,
        "skills": ["JavaScript", "Python"]
    }\`

    yamlStr, err := jsonToYaml(jsonStr)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println(yamlStr)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;

public class JsonToYaml {
    public static String convert(String json) {
        try {
            ObjectMapper jsonMapper = new ObjectMapper();
            Object data = jsonMapper.readValue(json, Object.class);

            YAMLFactory yamlFactory = new YAMLFactory()
                .disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER);
            ObjectMapper yamlMapper = new ObjectMapper(yamlFactory);

            return yamlMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        String json = "{\\"name\\":\\"张三\\",\\"age\\":25}";
        System.out.println(convert(json));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonToYamlDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 简单的 JSON 转 YAML 实现
  const jsonToYaml = (obj: unknown, indent: number = 0): string => {
    const spaces = '  '.repeat(indent)
    if (obj === null) return 'null'
    if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
      // 如果字符串包含换行或特殊字符，使用引号
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

  const handleConvert = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(jsonToYaml(parsed))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="connection-demo">
      {error && (
        <div className="info-box warning">
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label>输入 JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='输入 JSON 数据...'
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <div className="demo-controls">
        <button onClick={handleConvert}>转换</button>
        <button onClick={handleCopy} disabled={!output}>复制结果</button>
        <button onClick={handleClear}>清空</button>
      </div>

      {output && (
        <div style={{ marginTop: '16px' }}>
          <div className="config-item">
            <label>YAML 输出</label>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '13px'
            }}>
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
