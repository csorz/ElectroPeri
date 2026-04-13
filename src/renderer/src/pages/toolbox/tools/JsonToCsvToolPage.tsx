import { useState } from 'react'
import './ToolPage.css'

export default function JsonToCsvToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📊 JSON 转 CSV</h1>
        <p>将 JSON 数组转换为 CSV 格式</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
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
            <div className="feature-grid">
              <div className="feature-card">
                <h3>结构简单</h3>
                <p>CSV 是扁平的表格结构，适合二维数据表示</p>
              </div>
              <div className="feature-card">
                <h3>兼容性强</h3>
                <p>几乎所有电子表格软件都支持 CSV 格式</p>
              </div>
              <div className="feature-card">
                <h3>文件小巧</h3>
                <p>相比 JSON，CSV 没有键名重复，文件更小</p>
              </div>
              <div className="feature-card">
                <h3>易于处理</h3>
                <p>适合大数据处理、数据库导入导出</p>
              </div>
            </div>

            <h2>转换规则</h2>
            <ul className="scenario-list">
              <li><strong>数组必需</strong> - JSON 数据必须是数组格式，每个元素转换为 CSV 一行</li>
              <li><strong>表头生成</strong> - 自动提取所有对象的键作为 CSV 表头</li>
              <li><strong>字段对齐</strong> - 缺少字段的位置留空</li>
              <li><strong>特殊字符转义</strong> - 包含逗号、引号、换行的字段用双引号包裹</li>
              <li><strong>嵌套对象</strong> - 嵌套对象会转换为 JSON 字符串</li>
            </ul>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>数据导出</strong> - 将 API 返回的 JSON 数据导出为 Excel 可用的 CSV</li>
              <li><strong>数据分析</strong> - 转换数据格式用于数据分析工具</li>
              <li><strong>数据迁移</strong> - 在不同系统间迁移表格数据</li>
              <li><strong>报表生成</strong> - 生成可导入 Excel/Google Sheets 的数据</li>
              <li><strong>批量导入</strong> - 准备数据库批量导入的数据</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>使用提醒</strong>
              <ul>
                <li>JSON 必须是数组格式，单个对象无法直接转换</li>
                <li>嵌套结构和数组会转换为字符串形式</li>
                <li>注意 CSV 的编码问题，中文建议使用 UTF-8 with BOM</li>
                <li>字段顺序可能与原 JSON 不同（取决于实现）</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON 转 CSV 工具</h2>
            <JsonToCsvDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// JSON 转 CSV
const jsonToCsv = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // 获取所有字段
  const headers = [...new Set(data.flatMap(item => Object.keys(item)))];

  // 转义 CSV 字段
  const escapeField = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
      return \`"\${str.replace(/"/g, '""')}"\`;
    }
    return str;
  };

  // 生成 CSV
  const rows = [
    headers.map(escapeField).join(','),
    ...data.map(item =>
      headers.map(h => escapeField(item[h])).join(',')
    )
  ];

  return rows.join('\\n');
};

// 使用示例
const data = [
  { name: "张三", age: 25, city: "北京" },
  { name: "李四", age: 30, city: "上海" }
];

console.log(jsonToCsv(data));
// name,age,city
// 张三,25,北京
// 李四,30,上海`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import csv
import json
from io import StringIO

def json_to_csv(json_data):
    """将 JSON 数组转换为 CSV 字符串"""
    if not isinstance(json_data, list) or len(json_data) == 0:
        return ''

    # 获取所有字段名
    fieldnames = []
    for item in json_data:
        if isinstance(item, dict):
            for key in item.keys():
                if key not in fieldnames:
                    fieldnames.append(key)

    # 生成 CSV
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for item in json_data:
        if isinstance(item, dict):
            writer.writerow(item)

    return output.getvalue()

# 使用示例
data = [
    {"name": "张三", "age": 25, "city": "北京"},
    {"name": "李四", "age": 30, "city": "上海"}
]

csv_output = json_to_csv(data)
print(csv_output)
# name,age,city
# 张三,25,北京
# 李四,30,上海

# 保存到文件
def save_csv(json_data, filename):
    with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
        if json_data:
            writer = csv.DictWriter(f, fieldnames=json_data[0].keys())
            writer.writeheader()
            writer.writerows(json_data)`}</pre>
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

func jsonToCSV(jsonStr string) (string, error) {
    var data []map[string]interface{}
    if err := json.Unmarshal([]byte(jsonStr), &data); err != nil {
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

func main() {
    jsonStr := \`[
        {"name": "张三", "age": 25, "city": "北京"},
        {"name": "李四", "age": 30, "city": "上海"}
    ]\`

    csvStr, _ := jsonToCSV(jsonStr)
    fmt.Println(csvStr)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVWriter;
import java.io.StringWriter;
import java.util.*;

public class JsonToCsv {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String convert(String json) {
        try {
            List<Map<String, Object>> data = mapper.readValue(
                json,
                mapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            if (data.isEmpty()) return "";

            // 收集所有字段
            Set<String> headerSet = new LinkedHashSet<>();
            for (Map<String, Object> item : data) {
                headerSet.addAll(item.keySet());
            }
            String[] headers = headerSet.toArray(new String[0]);

            // 生成 CSV
            StringWriter sw = new StringWriter();
            CSVWriter writer = new CSVWriter(sw);

            writer.writeNext(headers);

            for (Map<String, Object> item : data) {
                String[] row = new String[headers.length];
                for (int i = 0; i < headers.length; i++) {
                    Object val = item.get(headers[i]);
                    row[i] = val != null ? val.toString() : "";
                }
                writer.writeNext(row);
            }

            writer.close();
            return sw.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        String json = "[{\\"name\\":\\"张三\\",\\"age\\":25}]";
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

function JsonToCsvDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const jsonToCsv = (data: unknown): string => {
    if (!Array.isArray(data)) {
      throw new Error('JSON 数据必须是数组格式')
    }
    if (data.length === 0) {
      return ''
    }

    // 获取所有字段
    const headers = new Set<string>()
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => headers.add(key))
      }
    })
    const headerList = Array.from(headers)

    // 生成 CSV
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = [
      headerList.map(escapeCsv).join(','),
      ...data.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return headerList.map((key) => escapeCsv((item as Record<string, unknown>)[key])).join(',')
        }
        return ''
      })
    ]
    return rows.join('\n')
  }

  const handleConvert = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(jsonToCsv(parsed))
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
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

      <div className="info-box" style={{ marginBottom: '16px' }}>
        <strong>提示</strong>
        <p>请输入 JSON 数组格式，例如：<code>{`[{"name": "张三", "age": 25}]`}</code></p>
      </div>

      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label>输入 JSON 数组</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={JSON.stringify([{"name": "张三", "age": 25}, {"name": "李四", "age": 30}])}
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
            <label>CSV 输出</label>
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
