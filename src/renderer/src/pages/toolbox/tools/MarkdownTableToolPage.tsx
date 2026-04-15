import { useState } from 'react'
import './ToolPage.css'

interface Column {
  name: string
  align: 'left' | 'center' | 'right'
}

export default function MarkdownTableToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Markdown 表格生成器</h1>
        <p>可视化创建 Markdown 表格，支持对齐设置和快速编辑</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>表格语法</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>基本结构</h3>
                <p>使用管道符 | 分隔列，使用连字符 - 创建分隔行</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px', overflow: 'auto'}}>
{`| 标题1 | 标题2 |
|-------|-------|
| 数据1 | 数据2 |`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>对齐方式</h3>
                <p>通过冒号位置控制对齐：左对齐、居中、右对齐</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px', overflow: 'auto'}}>
{`| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容   | 内容 | 内容   |`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>简洁写法</h3>
                <p>左右两侧的管道符可以省略，分隔符至少需要3个连字符</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px', overflow: 'auto'}}>
{`标题1 | 标题2
----- | -----
数据1 | 数据2`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>特殊字符</h3>
                <p>在表格中使用管道符需要转义，使用反斜杠</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px', overflow: 'auto'}}>
{`| 命令 | 说明 |
|------|------|
| \\|   | 管道符 |`}
                </pre>
              </div>
            </div>

            <h2>对齐规则</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>语法</th>
                    <th>对齐方式</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>:---</code></td>
                    <td>左对齐（默认）</td>
                    <td style={{textAlign: 'left'}}>文本靠左显示</td>
                  </tr>
                  <tr>
                    <td><code>:---:</code></td>
                    <td>居中对齐</td>
                    <td style={{textAlign: 'center'}}>文本居中显示</td>
                  </tr>
                  <tr>
                    <td><code>---:</code></td>
                    <td>右对齐</td>
                    <td style={{textAlign: 'right'}}>文本靠右显示</td>
                  </tr>
                  <tr>
                    <td><code>---</code></td>
                    <td>默认（左对齐）</td>
                    <td style={{textAlign: 'left'}}>同左对齐效果</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>数据展示</strong> - API 参数表、配置项说明、属性列表</li>
              <li><strong>对比分析</strong> - 技术方案对比、版本差异、功能对比</li>
              <li><strong>文档编写</strong> - 目录结构、时间规划、任务清单</li>
              <li><strong>报告输出</strong> - 测试结果、性能数据、统计报表</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>常见问题</strong>
              <ul>
                <li>表格前后需要空一行，否则可能无法正确渲染</li>
                <li>各列的管道符数量不需要对齐，但建议保持整齐便于阅读</li>
                <li>单元格内容默认不支持多行，可使用 HTML 的 br 标签换行</li>
                <li>复杂表格需求建议使用 HTML table 标签</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>表格生成器</h2>
            <TableGeneratorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// Markdown 表格生成函数
function generateMarkdownTable(data, options = {}) {
  const { align = [] } = options

  // 获取列数
  const columns = data[0]?.length || 0

  // 计算每列最大宽度
  const widths = Array(columns).fill(0)
  data.forEach(row => {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i], String(cell).length)
    })
  })

  // 生成对齐分隔符
  const getSeparator = (i) => {
    const width = widths[i]
    const alignment = align[i] || 'left'
    switch (alignment) {
      case 'center': return ':' + '-'.repeat(width - 2) + ':'
      case 'right':  return '-'.repeat(width - 1) + ':'
      default:       return '-'.repeat(width)
    }
  }

  // 生成行
  const formatRow = (row) => {
    return '| ' + row.map((cell, i) =>
      String(cell).padEnd(widths[i])
    ).join(' | ') + ' |'
  }

  const header = formatRow(data[0])
  const separator = '| ' + widths.map((_, i) => getSeparator(i)).join(' | ') + ' |'
  const rows = data.slice(1).map(formatRow)

  return [header, separator, ...rows].join('\\n')
}

// 使用示例
const data = [
  ['姓名', '年龄', '城市'],
  ['张三', '25', '北京'],
  ['李四', '30', '上海'],
]

const table = generateMarkdownTable(data, { align: ['left', 'center', 'right'] })
console.log(table)`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# Markdown 表格生成
from typing import List, Optional

def generate_markdown_table(
    headers: List[str],
    rows: List[List[str]],
    align: Optional[List[str]] = None
) -> str:
    """生成 Markdown 表格"""

    # 计算每列宽度
    all_data = [headers] + rows
    widths = [
        max(len(str(row[i])) for row in all_data)
        for i in range(len(headers))
    ]

    # 对齐分隔符
    def get_separator(width: int, align_type: str = 'left') -> str:
        if align_type == 'center':
            return ':' + '-' * (width - 2) + ':'
        elif align_type == 'right':
            return '-' * (width - 1) + ':'
        return '-' * width

    # 格式化行
    def format_row(row: List[str]) -> str:
        cells = [str(cell).ljust(widths[i]) for i, cell in enumerate(row)]
        return '| ' + ' | '.join(cells) + ' |'

    # 构建表格
    align = align or ['left'] * len(headers)

    header_row = format_row(headers)
    separator = '| ' + ' | '.join(
        get_separator(widths[i], align[i]) for i in range(len(headers))
    ) + ' |'
    data_rows = [format_row(row) for row in rows]

    return '\\n'.join([header_row, separator] + data_rows)

# 使用示例
headers = ['名称', '价格', '库存']
rows = [
    ['苹果', '5.00', '100'],
    ['香蕉', '3.50', '200'],
]
table = generate_markdown_table(headers, rows, ['left', 'right', 'center'])
print(table)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "strings"
)

// TableConfig 表格配置
type TableConfig struct {
    Headers []string
    Rows    [][]string
    Align   []string // "left", "center", "right"
}

// GenerateMarkdownTable 生成 Markdown 表格
func GenerateMarkdownTable(config TableConfig) string {
    // 计算列数和宽度
    colCount := len(config.Headers)
    widths := make([]int, colCount)

    // 计算每列最大宽度
    for i, h := range config.Headers {
        widths[i] = len(h)
    }
    for _, row := range config.Rows {
        for i, cell := range row {
            if i < colCount && len(cell) > widths[i] {
                widths[i] = len(cell)
            }
        }
    }

    // 生成对齐分隔符
    getSeparator := func(width int, align string) string {
        switch align {
        case "center":
            return ":" + strings.Repeat("-", width-2) + ":"
        case "right":
            return strings.Repeat("-", width-1) + ":"
        default:
            return strings.Repeat("-", width)
        }
    }

    // 格式化行
    formatRow := func(cells []string) string {
        padded := make([]string, len(cells))
        for i, cell := range cells {
            if i < len(widths) {
                padded[i] = fmt.Sprintf("%-*s", widths[i], cell)
            }
        }
        return "| " + strings.Join(padded, " | ") + " |"
    }

    // 构建表格
    var builder strings.Builder

    // 表头
    builder.WriteString(formatRow(config.Headers) + "\\n")

    // 分隔符
    separators := make([]string, colCount)
    for i := 0; i < colCount; i++ {
        align := "left"
        if i < len(config.Align) {
            align = config.Align[i]
        }
        separators[i] = getSeparator(widths[i], align)
    }
    builder.WriteString("| " + strings.Join(separators, " | ") + " |\\n")

    // 数据行
    for _, row := range config.Rows {
        builder.WriteString(formatRow(row) + "\\n")
    }

    return builder.String()
}

func main() {
    config := TableConfig{
        Headers: []string{"项目", "状态", "进度"},
        Rows: [][]string{
            {"任务A", "进行中", "50%"},
            {"任务B", "已完成", "100%"},
        },
        Align: []string{"left", "center", "right"},
    }
    fmt.Println(GenerateMarkdownTable(config))
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.List;
import java.util.ArrayList;

public class MarkdownTableGenerator {

    public static String generateTable(List<String> headers,
                                       List<List<String>> rows,
                                       List<String> alignments) {
        // 计算每列最大宽度
        int columns = headers.size();
        int[] widths = new int[columns];

        for (int i = 0; i < columns; i++) {
            widths[i] = headers.get(i).length();
        }

        for (List<String> row : rows) {
            for (int i = 0; i < row.size() && i < columns; i++) {
                widths[i] = Math.max(widths[i], row.get(i).length());
            }
        }

        StringBuilder sb = new StringBuilder();

        // 表头行
        sb.append(formatRow(headers, widths)).append("\\n");

        // 分隔行
        sb.append(formatSeparator(widths, alignments)).append("\\n");

        // 数据行
        for (List<String> row : rows) {
            sb.append(formatRow(row, widths)).append("\\n");
        }

        return sb.toString();
    }

    private static String formatRow(List<String> cells, int[] widths) {
        StringBuilder sb = new StringBuilder("| ");
        for (int i = 0; i < cells.size(); i++) {
            if (i > 0) sb.append(" | ");
            sb.append(String.format("%-" + widths[i] + "s", cells.get(i)));
        }
        sb.append(" |");
        return sb.toString();
    }

    private static String formatSeparator(int[] widths, List<String> alignments) {
        StringBuilder sb = new StringBuilder("| ");
        for (int i = 0; i < widths.length; i++) {
            if (i > 0) sb.append(" | ");
            String align = i < alignments.size() ? alignments.get(i) : "left";
            sb.append(getSeparator(widths[i], align));
        }
        sb.append(" |");
        return sb.toString();
    }

    private static String getSeparator(int width, String align) {
        String dashes = "-".repeat(width);
        return switch (align) {
            case "center" -> ":" + dashes.substring(1, dashes.length() - 1) + ":";
            case "right"  -> dashes.substring(0, dashes.length() - 1) + ":";
            default       -> dashes;
        };
    }

    public static void main(String[] args) {
        List<String> headers = List.of("名称", "类型", "说明");
        List<List<String>> rows = List.of(
            List.of("id", "int", "主键ID"),
            List.of("name", "string", "名称")
        );
        List<String> alignments = List.of("left", "center", "left");

        System.out.println(generateTable(headers, rows, alignments));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 表格生成器演示组件
function TableGeneratorDemo() {
  const [columns, setColumns] = useState<Column[]>([
    { name: '列1', align: 'left' },
    { name: '列2', align: 'left' },
    { name: '列3', align: 'left' }
  ])
  const [rows, setRows] = useState<string[][]>([
    ['数据1', '数据2', '数据3'],
    ['数据4', '数据5', '数据6']
  ])
  const [result, setResult] = useState('')

  const addColumn = () => {
    const newColName = `列${columns.length + 1}`
    setColumns([...columns, { name: newColName, align: 'left' }])
    setRows(rows.map(row => [...row, '']))
  }

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return
    setColumns(columns.filter((_, i) => i !== index))
    setRows(rows.map(row => row.filter((_, i) => i !== index)))
  }

  const updateColumnName = (index: number, name: string) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], name }
    setColumns(newColumns)
  }

  const updateColumnAlign = (index: number, align: 'left' | 'center' | 'right') => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], align }
    setColumns(newColumns)
  }

  const addRow = () => {
    setRows([...rows, columns.map(() => '')])
  }

  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    setRows(rows.filter((_, i) => i !== index))
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows]
    newRows[rowIndex][colIndex] = value
    setRows(newRows)
  }

  const generateTable = () => {
    const separator = columns.map(col => {
      switch (col.align) {
        case 'left': return ':---'
        case 'center': return ':---:'
        case 'right': return '---:'
      }
    })

    const header = `| ${columns.map(c => c.name).join(' | ')} |`
    const sep = `| ${separator.join(' | ')} |`
    const body = rows.map(row => `| ${row.join(' | ')} |`).join('\n')

    setResult(`${header}\n${sep}\n${body}`)
  }

  const loadExample = () => {
    setColumns([
      { name: '姓名', align: 'left' },
      { name: '年龄', align: 'center' },
      { name: '城市', align: 'left' }
    ])
    setRows([
      ['张三', '25', '北京'],
      ['李四', '30', '上海'],
      ['王五', '28', '广州']
    ])
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
      {/* 列设置 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>列设置</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {columns.map((col, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#fff', padding: '12px', borderRadius: '6px' }}>
              <input
                type="text"
                value={col.name}
                onChange={(e) => updateColumnName(index, e.target.value)}
                placeholder="列名"
                style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
              />
              <select
                value={col.align}
                onChange={(e) => updateColumnAlign(index, e.target.value as 'left' | 'center' | 'right')}
                style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
              <button
                onClick={() => removeColumn(index)}
                disabled={columns.length <= 1}
                style={{ fontSize: '12px', padding: '4px 8px', background: '#ef5350', color: '#fff', border: 'none', borderRadius: '4px', cursor: columns.length <= 1 ? 'not-allowed' : 'pointer' }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="demo-controls" style={{ marginTop: '12px' }}>
          <button onClick={addColumn}>添加列</button>
        </div>
      </div>

      {/* 数据行 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>数据行</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content', background: '#fff' }}>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} style={{ padding: '8px', border: '1px solid #ddd', background: '#f5f5f5' }}>
                    {col.name}
                  </th>
                ))}
                <th style={{ width: '60px', border: '1px solid #ddd', background: '#f5f5f5' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} style={{ padding: '4px', border: '1px solid #ddd' }}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '3px', boxSizing: 'border-box' }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => removeRow(rowIndex)}
                      disabled={rows.length <= 1}
                      style={{ fontSize: '12px', padding: '4px 8px', background: '#ef5350', color: '#fff', border: 'none', borderRadius: '4px', cursor: rows.length <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="demo-controls" style={{ marginTop: '12px' }}>
          <button onClick={addRow}>添加行</button>
          <button onClick={loadExample} style={{ background: '#e0e0e0', color: '#333' }}>加载示例</button>
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="demo-controls">
        <button onClick={generateTable}>生成 Markdown 表格</button>
      </div>

      {/* 结果输出 */}
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Markdown 输出</h4>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {result}
          </pre>
          <div className="demo-controls" style={{ marginTop: '12px' }}>
            <button onClick={() => handleCopy(result)}>复制到剪贴板</button>
          </div>
        </div>
      )}
    </div>
  )
}
