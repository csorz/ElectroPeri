import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type ConvertMode = 'json-to-csv' | 'csv-to-json'

export default function JsonToCsvToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📊 JSON/CSV 互转</h1>
        <p>JSON 与 CSV 格式互相转换，支持导出文件</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 CSV</h2>
            <div className="info-box">
              <p>CSV（Comma-Separated Values）是一种简单的表格数据格式，每行代表一条记录，字段之间用逗号分隔。CSV 格式广泛用于数据交换、电子表格导入导出等场景。</p>
            </div>

            <h2>JSON 与 CSV 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>JSON</th>
                  <th>CSV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>结构</td>
                  <td>嵌套对象、数组</td>
                  <td>扁平表格</td>
                </tr>
                <tr>
                  <td>数据类型</td>
                  <td>丰富（对象、数组、数字、布尔等）</td>
                  <td>纯文本（无类型）</td>
                </tr>
                <tr>
                  <td>可读性</td>
                  <td>中等</td>
                  <td>高（表格形式）</td>
                </tr>
                <tr>
                  <td>文件大小</td>
                  <td>较大（键名重复）</td>
                  <td>较小</td>
                </tr>
                <tr>
                  <td>兼容性</td>
                  <td>现代应用</td>
                  <td>Excel、数据库</td>
                </tr>
              </tbody>
            </table>

            <h2>转换规则</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>数组必需</h3>
                <p>JSON 必须是对象数组格式</p>
              </div>
              <div className="feature-card">
                <h3>表头生成</h3>
                <p>自动提取所有对象的键作为表头</p>
              </div>
              <div className="feature-card">
                <h3>特殊字符转义</h3>
                <p>逗号、引号、换行自动处理</p>
              </div>
              <div className="feature-card">
                <h3>嵌套对象</h3>
                <p>嵌套对象转为 JSON 字符串</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>📊 数据导出</h4>
                <p>API 数据导出为 Excel 可用格式</p>
              </div>
              <div className="scenario-card">
                <h4>📈 数据分析</h4>
                <p>转换为表格用于分析工具</p>
              </div>
              <div className="scenario-card">
                <h4>🔄 数据迁移</h4>
                <p>不同系统间迁移表格数据</p>
              </div>
              <div className="scenario-card">
                <h4>📋 批量导入</h4>
                <p>准备数据库批量导入数据</p>
              </div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>⚠️ 使用提醒</strong>
              <ul>
                <li>JSON 转 CSV 要求输入必须是对象数组，如 <code>[{`{"key": "value"}`}]</code></li>
                <li>嵌套对象和数组会转换为 JSON 字符串</li>
                <li>CSV 没有类型系统，所有值都是字符串</li>
                <li>中文建议使用 UTF-8 编码，Excel 兼容需 BOM</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON/CSV 双向转换</h2>
            <JsonCsvConverter />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript - 使用 papaparse</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>📦 安装: <code>npm install papaparse</code></p>
              <p>✅ 功能强大，支持大文件、流式解析</p>
            </div>
            <div className="code-block">
              <pre>{`import Papa from 'papaparse';

// ============ JSON 转 CSV ============
const jsonData = [
  { name: "张三", age: 25, city: "北京" },
  { name: "李四", age: 30, city: "上海" },
  { name: "王五", age: 28, city: "广州" }
];

const csv = Papa.unparse(jsonData, {
  quotes: false,        // 是否强制加引号
  quoteChar: '"',       // 引号字符
  escapeChar: '"',      // 转义字符
  delimiter: ",",       // 分隔符
  header: true,         // 包含表头
  newline: "\\r\\n"      // 换行符
});

console.log(csv);
// name,age,city
// 张三,25,北京
// 李四,30,上海
// 王五,28,广州

// ============ CSV 转 JSON ============
const csvStr = \`name,age,city
张三,25,北京
李四,30,上海\`;

const result = Papa.parse(csvStr, {
  header: true,        // 第一行作为字段名
  dynamicTyping: true, // 自动转换数字
  skipEmptyLines: true
});

console.log(result.data);
// [{ name: "张三", age: 25, city: "北京" }, ...]

// ============ 处理特殊字符 ============
const specialData = [
  { name: '张,三', desc: '包含"引号"' },
  { name: '李四', desc: '包含\\n换行' }
];

const specialCsv = Papa.unparse(specialData);
// 自动处理引号和转义
// name,desc
// "张,三","包含""引号"""
// 李四,"包含\\n换行"`}</pre>
            </div>

            <h2>JavaScript - 纯实现（无依赖）</h2>
            <div className="code-block">
              <pre>{`// ============ JSON 转 CSV (无依赖) ============
function jsonToCsv(jsonArray, delimiter = ',') {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return '';
  }

  // 获取所有字段名
  const headers = [...new Set(jsonArray.flatMap(obj => Object.keys(obj)))];

  // 转义字段值
  const escapeField = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // 包含特殊字符时需要加引号
    if (str.includes(delimiter) || str.includes('"') || str.includes('\\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // 构建CSV
  const headerLine = headers.map(escapeField).join(delimiter);
  const dataLines = jsonArray.map(obj =>
    headers.map(h => escapeField(obj[h])).join(delimiter)
  );

  return [headerLine, ...dataLines].join('\\n');
}

// ============ CSV 转 JSON (无依赖) ============
function csvToJson(csvStr, delimiter = ',') {
  const lines = csvStr.split(/\\r?\\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  // 解析一行CSV
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // 尝试转换数字
      if (/^-?\\d+(\\.\\d+)?$/.test(value)) {
        value = parseFloat(value);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      obj[header] = value;
    });
    data.push(obj);
  }

  return data;
}

// 使用示例
const data = [
  { name: '张三', age: 25 },
  { name: '李四', age: 30 }
];

const csv = jsonToCsv(data);
console.log(csv);
// name,age
// 张三,25
// 李四,30

const json = csvToJson(csv);
console.log(json);
// [{ name: '张三', age: 25 }, { name: '李四', age: 30 }]`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import csv
import json
from io import StringIO

# ============ JSON 转 CSV ============
json_data = [
    {"name": "张三", "age": 25, "city": "北京"},
    {"name": "李四", "age": 30, "city": "上海"}
]

# 转换为 CSV 字符串
output = StringIO()
if json_data:
    writer = csv.DictWriter(output, fieldnames=json_data[0].keys())
    writer.writeheader()
    writer.writerows(json_data)

csv_str = output.getvalue()
print(csv_str)

# 保存到文件（UTF-8 with BOM，Excel 兼容）
with open('output.csv', 'w', newline='', encoding='utf-8-sig') as f:
    if json_data:
        writer = csv.DictWriter(f, fieldnames=json_data[0].keys())
        writer.writeheader()
        writer.writerows(json_data)

# ============ CSV 转 JSON ============
with open('data.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    data = list(reader)

# 转换为 JSON
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print(json_str)

# ============ 使用 pandas ============
import pandas as pd

# 读取各种格式
df_json = pd.read_json('data.json')
df_csv = pd.read_csv('data.csv')

# 转换格式
df_json.to_csv('output.csv', index=False, encoding='utf-8-sig')
df_csv.to_json('output.json', orient='records', force_ascii=False, indent=2)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/csv"
    "encoding/json"
    "fmt"
    "os"
    "sort"
    "strings"
)

// ============ JSON 转 CSV ============
func jsonToCsv(jsonBytes []byte) (string, error) {
    var data []map[string]interface{}
    if err := json.Unmarshal(jsonBytes, &data); err != nil {
        return "", err
    }

    if len(data) == 0 {
        return "", nil
    }

    // 收集所有字段
    headerSet := make(map[string]bool)
    for _, item := range data {
        for k := range item {
            headerSet[k] = true
        }
    }

    var headers []string
    for k := range headerSet {
        headers = append(headers, k)
    }
    sort.Strings(headers)

    // 生成 CSV
    var buf strings.Builder
    writer := csv.NewWriter(&buf)

    // 写入表头
    writer.Write(headers)

    // 写入数据行
    for _, item := range data {
        row := make([]string, len(headers))
        for i, h := range headers {
            if v, ok := item[h]; ok {
                row[i] = fmt.Sprintf("%v", v)
            }
        }
        writer.Write(row)
    }

    writer.Flush()
    return buf.String(), nil
}

// ============ CSV 转 JSON ============
func csvToJson(csvStr string) (string, error) {
    reader := csv.NewReader(strings.NewReader(csvStr))
    records, err := reader.ReadAll()
    if err != nil {
        return "", err
    }

    if len(records) < 2 {
        return "[]", nil
    }

    headers := records[0]
    var result []map[string]string

    for _, record := range records[1:] {
        row := make(map[string]string)
        for i, h := range headers {
            if i < len(record) {
                row[h] = record[i]
            }
        }
        result = append(result, row)
    }

    jsonBytes, _ := json.MarshalIndent(result, "", "  ")
    return string(jsonBytes), nil
}

func main() {
    jsonStr := \`[
        {"name": "张三", "age": 25, "city": "北京"},
        {"name": "李四", "age": 30, "city": "上海"}
    ]\`

    // JSON → CSV
    csvStr, _ := jsonToCsv([]byte(jsonStr))
    fmt.Println("CSV:")
    fmt.Println(csvStr)

    // CSV → JSON
    jsonOut, _ := csvToJson(csvStr)
    fmt.Println("JSON:")
    fmt.Println(jsonOut)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import java.util.List;
import java.util.Map;

public class JsonCsvConverter {

    private static final ObjectMapper jsonMapper = new ObjectMapper();
    private static final CsvMapper csvMapper = new CsvMapper();

    // JSON 转 CSV
    public static String jsonToCsv(String json) throws Exception {
        List<Map<String, Object>> data = jsonMapper.readValue(json,
            jsonMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

        if (data.isEmpty()) return "";

        // 构建 CSV Schema
        CsvSchema.Builder builder = CsvSchema.builder();
        for (String key : data.get(0).keySet()) {
            builder.addColumn(key);
        }
        CsvSchema schema = builder.build().withHeader();

        return csvMapper.writer(schema).writeValueAsString(data);
    }

    // CSV 转 JSON
    public static String csvToJson(String csv) throws Exception {
        CsvSchema schema = CsvSchema.emptySchema().withHeader();
        List<Map<String, String>> data = csvMapper.readerFor(Map.class)
            .with(schema)
            .<Map<String, String>>readValues(csv)
            .readAll();

        return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
    }

    public static void main(String[] args) throws Exception {
        String json = \"""
            [
                {"name": "张三", "age": 25, "city": "北京"},
                {"name": "李四", "age": 30, "city": "上海"}
            ]
            \""";

        // JSON → CSV
        String csv = jsonToCsv(json);
        System.out.println("CSV:\\n" + csv);

        // CSV → JSON
        String jsonOut = csvToJson(csv);
        System.out.println("JSON:\\n" + jsonOut);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonCsvConverter() {
  const [mode, setMode] = useState<ConvertMode>('json-to-csv')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // JSON 转 CSV
  const jsonToCsv = (jsonArray: unknown[]): string => {
    if (!Array.isArray(jsonArray)) {
      throw new Error('JSON 数据必须是数组格式')
    }
    if (jsonArray.length === 0) {
      return ''
    }

    // 获取所有字段
    const headers = new Set<string>()
    jsonArray.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => headers.add(key))
      }
    })
    const headerList = Array.from(headers)

    // 转义 CSV 字段
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return ''
      let str: string
      if (typeof value === 'object') {
        str = JSON.stringify(value)
      } else {
        str = String(value)
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = [
      headerList.map(escapeCsv).join(','),
      ...jsonArray.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return headerList.map((key) => escapeCsv((item as Record<string, unknown>)[key])).join(',')
        }
        return ''
      })
    ]
    return rows.join('\n')
  }

  // CSV 转 JSON
  const csvToJson = (csvStr: string): unknown[] => {
    // 移除 BOM 如果存在
    let cleanStr = csvStr
    if (csvStr.charCodeAt(0) === 0xFEFF) {
      cleanStr = csvStr.slice(1)
    }

    const lines = cleanStr.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV 格式错误：至少需要表头和一行数据')
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (inQuotes) {
          if (char === '"') {
            if (line[i + 1] === '"') {
              current += '"'
              i++
            } else {
              inQuotes = false
            }
          } else {
            current += char
          }
        } else {
          if (char === '"') {
            inQuotes = true
          } else if (char === ',') {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0])

    if (headers.length === 0 || headers.every(h => !h)) {
      throw new Error('CSV 表头为空，请确保第一行是字段名')
    }

    const data: unknown[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i])
      const obj: Record<string, unknown> = {}
      headers.forEach((header, index) => {
        if (header) {  // 只处理非空表头
          let value: unknown = values[index] ?? ''
          if (typeof value === 'string') {
            if (/^-?\d+(\.\d+)?$/.test(value)) {
              value = parseFloat(value)
            } else if (value === 'true') {
              value = true
            } else if (value === 'false') {
              value = false
            }
          }
          obj[header] = value
        }
      })
      data.push(obj)
    }

    return data
  }

  const handleConvert = () => {
    setError(null)
    try {
      if (mode === 'json-to-csv') {
        const parsed = JSON.parse(input)
        setOutput(jsonToCsv(parsed))
      } else {
        const parsed = csvToJson(input)
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
      setMode(mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv')
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

    const filename = mode === 'json-to-csv' ? 'data.csv' : 'data.json'
    const mimeType = mode === 'json-to-csv' ? 'text/csv' : 'application/json'

    // CSV 添加 BOM 以支持 Excel 中文
    const content = mode === 'json-to-csv' ? '\uFEFF' + output : output

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sampleJsonArray = `[
  {"name": "张三", "age": 25, "city": "北京"},
  {"name": "李四", "age": 30, "city": "上海"},
  {"name": "王五", "age": 28, "city": "广州"}
]`

  const sampleCsv = `name,age,city
张三,25,北京
李四,30,上海
王五,28,广州`

  const loadSample = () => {
    setInput(mode === 'json-to-csv' ? sampleJsonArray : sampleCsv)
  }

  return (
    <div className="connection-demo">
      <div className="config-grid" style={{ marginBottom: 16 }}>
        <div className="config-item">
          <label>转换方向</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as ConvertMode)}>
            <option value="json-to-csv">JSON → CSV</option>
            <option value="csv-to-json">CSV → JSON</option>
          </select>
        </div>
      </div>

      {mode === 'json-to-csv' && (
        <div className="info-box" style={{ marginBottom: 12 }}>
          <strong>提示</strong>
          <p style={{ marginTop: 4 }}>
            JSON 必须是对象数组格式，如 <code>[{`{"key": "value"}`}]</code>。嵌套对象会被转为 JSON 字符串。
          </p>
        </div>
      )}

      {error && (
        <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginBottom: 12 }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>输入 {mode === 'json-to-csv' ? 'JSON' : 'CSV'}</label>
          <button onClick={loadSample} style={{ padding: '4px 8px', fontSize: '12px', background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            加载示例
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'json-to-csv' ? '输入 JSON 对象数组...' : '输入 CSV 数据...'}
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
              导出 .{mode === 'json-to-csv' ? 'csv' : 'json'}
            </button>
          </>
        )}
        <button onClick={handleClear} style={{ background: '#e0e0e0', color: '#333' }}>清空</button>
      </div>

      {output && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            输出 {mode === 'json-to-csv' ? 'CSV' : 'JSON'}
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
