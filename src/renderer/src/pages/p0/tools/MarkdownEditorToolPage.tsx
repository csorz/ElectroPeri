import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function MarkdownEditorToolPage() {
  const [markdown, setMarkdown] = useState(`# Markdown 编辑器

这是一个简单的 **Markdown** 编辑器。

## 功能特性

- 支持常见 Markdown 语法
- 实时预览
- 简单易用

### 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |

> 这是一个引用文本

[链接示例](https://example.com)
`)
  const [previewHtml, setPreviewHtml] = useState('')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 Markdown 解析器
  const parseMarkdown = (md: string): string => {
    let html = md

    // 转义 HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // 引用
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

    // 无序列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // 表格
    const tableRegex = /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g
    html = html.replace(tableRegex, (_, header, body) => {
      const headers = header.split('|').filter((h: string) => h.trim())
      const rows = body.trim().split('\n')
      let tableHtml = '<table><thead><tr>'
      headers.forEach((h: string) => {
        tableHtml += `<th>${h.trim()}</th>`
      })
      tableHtml += '</tr></thead><tbody>'
      rows.forEach((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim())
        tableHtml += '<tr>'
        cells.forEach((c: string) => {
          tableHtml += `<td>${c.trim()}</td>`
        })
        tableHtml += '</tr>'
      })
      tableHtml += '</tbody></table>'
      return tableHtml
    })

    // 段落
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    // 清理空段落
    html = html.replace(/<p>\s*<\/p>/g, '')
    html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<table>)/g, '$1')
    html = html.replace(/(<\/table>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1')

    return html
  }

  const handlePreview = () => {
    setPreviewHtml(parseMarkdown(markdown))
  }

  const handleClear = () => {
    setMarkdown('')
    setPreviewHtml('')
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/markdown" className="toolbox-back">
        ← 返回 Markdown 工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">✏️</span>
          <h1>Markdown 编辑器</h1>
        </div>
        <p className="page-sub">简单的 Markdown 编辑与实时预览</p>
      </div>

      <div className="toolbox-grid">
        <section className="tool-card">
          <h2>编辑区</h2>
          <textarea
            className="tool-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="输入 Markdown 内容..."
            style={{ minHeight: '400px' }}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handlePreview}>
              预览
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              清空
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(markdown)}>
              复制 Markdown
            </button>
          </div>
        </section>

        <section className="tool-card">
          <h2>预览区</h2>
          <div
            className="tool-result"
            style={{
              minHeight: '400px',
              background: '#fff',
              color: '#333',
              padding: '16px',
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#999">点击"预览"按钮查看渲染结果</p>' }}
          />
          <div className="tool-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onCopy(previewHtml)}
              disabled={!previewHtml}
            >
              复制 HTML
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
