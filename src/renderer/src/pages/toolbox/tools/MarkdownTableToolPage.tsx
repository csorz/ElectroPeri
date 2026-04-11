import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface Column {
  name: string
  align: 'left' | 'center' | 'right'
}

export default function MarkdownTableToolPage() {
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

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

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

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/markdown" className="toolbox-back">
        ← 返回 Markdown 工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📊</span>
          <h1>Markdown 表格生成器</h1>
        </div>
        <p className="page-sub">可视化生成 Markdown 表格</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">列设置</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
              {columns.map((col, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateColumnName(index, e.target.value)}
                    placeholder="列名"
                    style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length <= 1}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-secondary" onClick={addColumn}>
              添加列
            </button>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">数据行</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
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
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '3px' }}
                        />
                      </td>
                    ))}
                    <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeRow(rowIndex)}
                        disabled={rows.length <= 1}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-secondary" onClick={addRow}>
              添加行
            </button>
            <button type="button" className="btn btn-secondary" onClick={loadExample}>
              加载示例
            </button>
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={generateTable}>
            生成 Markdown 表格
          </button>
        </div>

        {result && (
          <div className="tool-block">
            <div className="tool-block-title">Markdown 输出</div>
            <textarea
              className="tool-textarea"
              value={result}
              readOnly
              rows={6}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(result)}>
                复制到剪贴板
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
