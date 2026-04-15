import { useState } from 'react'
import './ToolPage.css'

export default function CsvJsonToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>CSV/JSON 互转</h1>
        <p>CSV to JSON Converter - CSV 与 JSON 格式互相转换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>格式对比</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>CSV 格式</h3>
                <p>逗号分隔值（Comma-Separated Values），以纯文本形式存储表格数据，每行一条记录，字段间用逗号分隔</p>
              </div>
              <div className="feature-card">
                <h3>JSON 格式</h3>
                <p>JavaScript 对象表示法（JavaScript Object Notation），轻量级数据交换格式，支持对象、数组、字符串、数字等类型</p>
              </div>
              <div className="feature-card">
                <h3>转换场景</h3>
                <p>数据导入导出、API 数据处理、配置文件转换、数据库迁移等场景需要在这两种格式间转换</p>
              </div>
              <div className="feature-card">
                <h3>注意事项</h3>
                <p>CSV 是扁平结构，JSON 可嵌套；转换嵌套 JSON 时需要特殊处理，可能丢失层级信息</p>
              </div>
            </div>

            <h2>CSV 格式规则</h2>
            <div className="info-box">
              <strong>CSV 基本语法</strong>
              <ul>
                <li>每行代表一条记录</li>
                <li>第一行通常为表头（字段名）</li>
                <li>字段用逗号分隔，也可用分号、制表符等</li>
                <li>包含特殊字符的字段需用双引号包裹</li>
                <li>字段内的双引号需要转义为两个双引号</li>
              </ul>
            </div>

            <h2>格式对比表</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>特性</th>
                    <th>CSV</th>
                    <th>JSON</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>数据类型</td>
                    <td>仅字符串</td>
                    <td>字符串、数字、布尔、null、对象、数组</td>
                  </tr>
                  <tr>
                    <td>结构</td>
                    <td>扁平表格</td>
                    <td>可嵌套</td>
                  </tr>
                  <tr>
                    <td>可读性</td>
                    <td>较高，类似表格</td>
                    <td>中等，需要格式化</td>
                  </tr>
                  <tr>
                    <td>文件大小</td>
                    <td>较小</td>
                    <td>较大（键名重复）</td>
                  </tr>
                  <tr>
                    <td>解析速度</td>
                    <td>较快</td>
                    <td>较快</td>
                  </tr>
                  <tr>
                    <td>标准支持</td>
                    <td>RFC 4180</td>
                    <td>ECMA-404</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Excel 数据处理</strong> - Excel 导出 CSV，转为 JSON 供前端使用</li>
              <li><strong>数据库迁移</strong> - 导出 CSV 后转为 JSON 导入 NoSQL 数据库</li>
              <li><strong>API 数据转换</strong> - 将 API 返回的 JSON 转为 CSV 用于报表</li>
              <li><strong>数据分析</strong> - CSV 数据转为 JSON 方便程序处理</li>
              <li><strong>配置管理</strong> - 批量配置数据在两种格式间转换</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>CSV/JSON 转换</h2>
            <CsvJsonDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// CSV 转 JSON
function csvToJson(csv, delimiter = ',') {
  const lines = csv.trim().split('\\n')
  if (lines.length === 0) return '[]'

  // 解析表头
  const headers = parseCsvLine(lines[0], delimiter)

  // 解析数据行
  const result = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCsvLine(lines[i], delimiter)
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      result.push(obj)
    }
  }

  return JSON.stringify(result, null, 2)
}

// 解析 CSV 行
function parseCsvLine(line, delimiter) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// JSON 转 CSV
function jsonToCsv(json, delimiter = ',') {
  const data = JSON.parse(json)
  if (!Array.isArray(data) || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const lines = [headers.join(delimiter)]

  for (const item of data) {
    const values = headers.map(h => {
      const val = String(item[h] ?? '')
      if (val.includes(delimiter) || val.includes('"') || val.includes('\\n')) {
        return \`"\${val.replace(/"/g, '""')}"\`
      }
      return val
    })
    lines.push(values.join(delimiter))
  }

  return lines.join('\\n')
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import csv
import json
from io import StringIO

def csv_to_json(csv_text, delimiter=','):
    """CSV 转 JSON"""
    reader = csv.DictReader(StringIO(csv_text), delimiter=delimiter)
    result = [row for row in reader]
    return json.dumps(result, indent=2, ensure_ascii=False)

def json_to_csv(json_text, delimiter=','):
    """JSON 转 CSV"""
    data = json.loads(json_text)
    if not isinstance(data, list) or len(data) == 0:
        return ''

    output = StringIO()
    fieldnames = list(data[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames, delimiter=delimiter)

    writer.writeheader()
    for row in data:
        writer.writerow(row)

    return output.getvalue()

# 使用示例
csv_data = '''name,age,city
Alice,25,Beijing
Bob,30,Shanghai'''

json_result = csv_to_json(csv_data)
print(json_result)
# [{"name": "Alice", "age": "25", "city": "Beijing"}, ...]

json_data = '''[
    {"name": "Alice", "age": 25, "city": "Beijing"},
    {"name": "Bob", "age": 30, "city": "Shanghai"}
]'''

csv_result = json_to_csv(json_data)
print(csv_result)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/csv"
    "encoding/json"
    "fmt"
    "strings"
)

// CSV 转 JSON
func csvToJSON(csvText string, delimiter rune) (string, error) {
    reader := csv.NewReader(strings.NewReader(csvText))
    reader.Comma = delimiter

    records, err := reader.ReadAll()
    if err != nil {
        return "", err
    }
    if len(records) < 1 {
        return "[]", nil
    }

    headers := records[0]
    result := make([]map[string]string, 0, len(records)-1)

    for i := 1; i < len(records); i++ {
        row := make(map[string]string)
        for j, value := range records[i] {
            if j < len(headers) {
                row[headers[j]] = value
            }
        }
        result = append(result, row)
    }

    jsonBytes, err := json.MarshalIndent(result, "", "  ")
    return string(jsonBytes), err
}

// JSON 转 CSV
func jsonToCSV(jsonText string, delimiter rune) (string, error) {
    var data []map[string]interface{}
    if err := json.Unmarshal([]byte(jsonText), &data); err != nil {
        return "", err
    }
    if len(data) == 0 {
        return "", nil
    }

    // 获取表头
    headers := make([]string, 0)
    for k := range data[0] {
        headers = append(headers, k)
    }

    var builder strings.Builder
    writer := csv.NewWriter(&builder)
    writer.Comma = delimiter

    // 写入表头
    writer.Write(headers)

    // 写入数据
    for _, row := range data {
        values := make([]string, len(headers))
        for i, h := range headers {
            if v, ok := row[h]; ok {
                values[i] = fmt.Sprintf("%v", v)
            }
        }
        writer.Write(values)
    }

    writer.Flush()
    return builder.String(), nil
}

func main() {
    csvText := \`name,age,city
Alice,25,Beijing
Bob,30,Shanghai\`

    jsonResult, _ := csvToJSON(csvText, ',')
    fmt.Println("CSV to JSON:")
    fmt.Println(jsonResult)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import java.util.*;

public class CsvJsonConverter {

    private static final ObjectMapper jsonMapper = new ObjectMapper();
    private static final CsvMapper csvMapper = new CsvMapper();

    // CSV 转 JSON
    public static String csvToJson(String csvText) throws Exception {
        CsvSchema schema = CsvSchema.emptySchema().withHeader();
        List<Map<String, String>> result = csvMapper
            .readerFor(Map.class)
            .with(schema)
            .<Map<String, String>>readValues(csvText)
            .readAll();
        return jsonMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(result);
    }

    // JSON 转 CSV
    public static String jsonToCsv(String jsonText) throws Exception {
        List<Map<String, Object>> data = jsonMapper.readValue(jsonText,
            jsonMapper.getTypeFactory().constructCollectionType(
                List.class, Map.class));
        if (data.isEmpty()) return "";

        // 从第一条记录获取列名
        Set<String> columns = data.get(0).keySet();
        CsvSchema.Builder schemaBuilder = CsvSchema.builder();
        for (String col : columns) {
            schemaBuilder.addColumn(col);
        }

        return csvMapper.writer(schemaBuilder.build())
            .writeValueAsString(data);
    }

    public static void main(String[] args) throws Exception {
        String csv = "name,age,city\\nAlice,25,Beijing\\nBob,30,Shanghai";
        System.out.println(csvToJson(csv));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// CSV/JSON 转换演示组件
function CsvJsonDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'csvToJson' | 'jsonToCsv'>('csvToJson')
  const [delimiter, setDelimiter] = useState(',')
  const [error, setError] = useState<string | null>(null)

  const csvToJson = (csv: string, delim: string) => {
    const lines = csv.trim().split('\n')
    if (lines.length === 0) return '[]'

    const headers = parseCsvLine(lines[0], delim)
    const result: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCsvLine(lines[i], delim)
        const obj: Record<string, string> = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        result.push(obj)
      }
    }

    return JSON.stringify(result, null, 2)
  }

  const parseCsvLine = (line: string, delim: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delim && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const jsonToCsv = (json: string, delim: string) => {
    const data = JSON.parse(json)
    if (!Array.isArray(data) || data.length === 0) {
      return ''
    }

    const headers = Object.keys(data[0])
    const lines: string[] = [headers.join(delim)]

    for (const item of data) {
      const values = headers.map(h => {
        const val = String(item[h] ?? '')
        if (val.includes(delim) || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      })
      lines.push(values.join(delim))
    }

    return lines.join('\n')
  }

  const handleConvert = () => {
    setError(null)
    setOutput('')
    try {
      if (mode === 'csvToJson') {
        setOutput(csvToJson(input, delimiter))
      } else {
        setOutput(jsonToCsv(input, delimiter))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="csv-json-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>转换模式</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as 'csvToJson' | 'jsonToCsv')}>
            <option value="csvToJson">CSV to JSON</option>
            <option value="jsonToCsv">JSON to CSV</option>
          </select>
        </div>
        <div className="config-item">
          <label>分隔符</label>
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
            <option value=",">逗号 (,)</option>
            <option value=";">分号 (;)</option>
            <option value="\t">制表符 (Tab)</option>
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
        <label>{mode === 'csvToJson' ? 'CSV 输入' : 'JSON 输入'}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'csvToJson' ? 'name,age,city\nAlice,25,Beijing\nBob,30,Shanghai' : '[{"name": "Alice", "age": 25}]'}
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
            {mode === 'csvToJson' ? 'JSON 输出' : 'CSV 输出'}
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
