import { useState } from 'react'
import './ToolPage.css'

export default function JsonValidateToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>✅ JSON 校验</h1>
        <p>校验 JSON 格式是否正确</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 JSON 校验</h2>
            <div className="info-box">
              <p>JSON 校验是指验证 JSON 字符串是否符合 JSON 语法规范的过程。通过校验可以发现语法错误、数据类型问题，确保数据能被正确解析和使用。</p>
            </div>

            <h2>JSON 语法规则</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>键名必须加引号</h3>
                <p>JSON 中的键名必须用双引号包裹，不能用单引号或不加引号</p>
              </div>
              <div className="feature-card">
                <h3>字符串双引号</h3>
                <p>字符串值必须使用双引号，不支持单引号</p>
              </div>
              <div className="feature-card">
                <h3>数据类型</h3>
                <p>支持 string、number、boolean、null、object、array 六种类型</p>
              </div>
              <div className="feature-card">
                <h3>尾随逗号</h3>
                <p>标准 JSON 不允许对象或数组末尾有逗号</p>
              </div>
            </div>

            <h2>常见错误</h2>
            <ul className="scenario-list">
              <li><strong>单引号字符串</strong> - <code>{`{ name: 'value' }`}</code> 应改为 <code>{`{ "name": "value" }`}</code></li>
              <li><strong>未加引号的键</strong> - <code>{`{ name: "value" }`}</code> 应改为 <code>{`{ "name": "value" }`}</code></li>
              <li><strong>尾随逗号</strong> - <code>{`{ "a": 1, }`}</code> 应改为 <code>{`{ "a": 1 }`}</code></li>
              <li><strong>未定义值</strong> - JSON 不支持 undefined，应使用 null</li>
              <li><strong>注释</strong> - 标准 JSON 不支持注释</li>
              <li><strong>NaN/Infinity</strong> - JSON 不支持这些特殊数值</li>
            </ul>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 开发</strong> - 验证请求/响应数据格式</li>
              <li><strong>配置文件</strong> - 确保 JSON 配置文件语法正确</li>
              <li><strong>数据导入</strong> - 导入 JSON 数据前的格式检查</li>
              <li><strong>表单验证</strong> - 用户输入的 JSON 数据校验</li>
              <li><strong>调试排错</strong> - 快速定位 JSON 语法错误位置</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>使用提醒</strong>
              <ul>
                <li>JSON Schema 校验比基本语法校验更严格</li>
                <li>某些 JSON 解析器支持扩展语法（如注释、尾随逗号）</li>
                <li>大文件校验可能消耗较多内存</li>
                <li>错误位置提示有助于快速定位问题</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON 校验工具</h2>
            <JsonValidateDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// JSON 校验
function validateJSON(json) {
  try {
    JSON.parse(json);
    return { valid: true, message: 'JSON 格式正确' };
  } catch (e) {
    // 提取错误位置
    const match = e.message.match(/position (\\d+)/);
    const position = match ? parseInt(match[1]) : -1;

    return {
      valid: false,
      message: e.message,
      position: position
    };
  }
}

// 使用示例
const result = validateJSON('{"name": "test"}');
console.log(result);
// { valid: true, message: 'JSON 格式正确' }

// 显示错误位置
function showErrorPosition(json, position) {
  if (position < 0) return json;
  return json.slice(0, position) + '[ERROR]' + json.slice(position);
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import json

def validate_json(json_str):
    """校验 JSON 格式"""
    try:
        json.loads(json_str)
        return {'valid': True, 'message': 'JSON 格式正确'}
    except json.JSONDecodeError as e:
        return {
            'valid': False,
            'message': str(e),
            'line': e.lineno,
            'column': e.colno,
            'position': e.pos
        }

# 使用示例
result = validate_json('{"name": "test"}')
print(result)

# 带位置提示的错误显示
def show_error(json_str, position):
    if position < 0:
        return json_str
    return json_str[:position] + '[ERROR]' + json_str[position:]`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
)

type ValidationResult struct {
    Valid    bool
    Message  string
    Position int
}

func validateJSON(input string) ValidationResult {
    var data interface{}
    err := json.Unmarshal([]byte(input), &data)
    if err != nil {
        return ValidationResult{
            Valid:    false,
            Message:  err.Error(),
            Position: -1,
        }
    }
    return ValidationResult{
        Valid:   true,
        Message: "JSON 格式正确",
    }
}

func main() {
    result := validateJSON("{\"name\": \"test\"}")
    fmt.Printf("%+v\\n", result)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

public class JsonValidator {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static Map<String, Object> validate(String json) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.readTree(json);
            result.put("valid", true);
            result.put("message", "JSON 格式正确");
        } catch (Exception e) {
            result.put("valid", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    public static void main(String[] args) {
        String json = "{\\"name\\": \\"test\\"}";
        System.out.println(validate(json));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonValidateDemo() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; message: string; path?: string } | null>(null)

  const handleValidate = () => {
    if (!input.trim()) {
      setResult({ valid: false, message: '请输入 JSON 数据' })
      return
    }
    try {
      JSON.parse(input)
      setResult({ valid: true, message: 'JSON 格式正确' })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'JSON 格式错误'
      // 尝试提取错误位置
      const match = message.match(/position (\d+)/)
      const path = match ? `位置 ${match[1]}` : undefined
      setResult({ valid: false, message: `${message}`, path })
    }
  }

  const handleClear = () => {
    setInput('')
    setResult(null)
  }

  return (
    <div className="connection-demo">
      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label>输入 JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='输入要校验的 JSON 数据...'
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <div className="demo-controls">
        <button onClick={handleValidate}>校验</button>
        <button onClick={handleClear}>清空</button>
      </div>

      {result && (
        <div style={{ marginTop: '16px' }}>
          <div className={result.valid ? 'info-box' : 'info-box warning'}>
            <strong>校验结果</strong>
            <p>
              {result.valid ? '✅ ' : '❌ '}{result.message}
              {result.path && <span> ({result.path})</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
