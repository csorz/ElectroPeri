import { useState } from 'react'
import './ToolPage.css'

export default function MarkdownEditorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Markdown 编辑器</h1>
        <p>轻量级标记语言，简洁高效的文档编写工具</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>简洁易学</h3>
                <p>语法简单直观，使用纯文本格式，无需复杂编辑器即可编写</p>
              </div>
              <div className="feature-card">
                <h3>平台无关</h3>
                <p>纯文本格式，可在任何平台、任何编辑器中编写和阅读</p>
              </div>
              <div className="feature-card">
                <h3>版本控制友好</h3>
                <p>文本格式便于 Git 追踪变更，适合文档协作和版本管理</p>
              </div>
              <div className="feature-card">
                <h3>高度可扩展</h3>
                <p>支持 HTML 嵌入、代码高亮、数学公式、图表等扩展功能</p>
              </div>
            </div>

            <h2>基础语法</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>元素</th>
                    <th>Markdown 语法</th>
                    <th>效果说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>标题</td>
                    <td><code># H1 / ## H2 / ### H3</code></td>
                    <td>1-6个#号对应h1-h6</td>
                  </tr>
                  <tr>
                    <td>粗体</td>
                    <td><code>**文本**</code></td>
                    <td><strong>加粗显示</strong></td>
                  </tr>
                  <tr>
                    <td>斜体</td>
                    <td><code>*文本*</code></td>
                    <td><em>斜体显示</em></td>
                  </tr>
                  <tr>
                    <td>链接</td>
                    <td><code>[显示文本](URL)</code></td>
                    <td>创建超链接</td>
                  </tr>
                  <tr>
                    <td>图片</td>
                    <td><code>![替代文本](图片URL)</code></td>
                    <td>插入图片</td>
                  </tr>
                  <tr>
                    <td>代码</td>
                    <td><code>`代码`</code> 或 <code>```代码块```</code></td>
                    <td>行内代码或代码块</td>
                  </tr>
                  <tr>
                    <td>引用</td>
                    <td><code>&gt; 引用文本</code></td>
                    <td>创建引用块</td>
                  </tr>
                  <tr>
                    <td>列表</td>
                    <td><code>- 项目</code> 或 <code>1. 项目</code></td>
                    <td>无序/有序列表</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>扩展语法</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>表格</h3>
                <p>使用 | 和 - 创建表格，支持对齐方式设置</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px', overflow: 'auto'}}>
{`| 列1 | 列2 |
|-----|-----|
| A   | B   |`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>任务列表</h3>
                <p>创建可勾选的任务清单</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px'}}>
{`- [ ] 待办
- [x] 已完成`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>删除线</h3>
                <p>表示删除或废弃内容</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px'}}>
{`~~删除内容~~`}
                </pre>
              </div>
              <div className="feature-card">
                <h3>脚注</h3>
                <p>添加引用说明和注释</p>
                <pre style={{fontSize: '11px', background: '#e8e8e8', padding: '8px', borderRadius: '4px'}}>
{`文本[^1]
[^1]: 脚注说明`}
                </pre>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>技术文档</strong> - README、API文档、开发指南</li>
              <li><strong>博客写作</strong> - 技术博客、个人笔记、知识库</li>
              <li><strong>项目管理</strong> - 需求文档、会议记录、周报</li>
              <li><strong>在线协作</strong> - GitHub/GitLab Wiki、Notion、飞书文档</li>
              <li><strong>电子书出版</strong> - 使用 GitBook、MkDocs 等工具生成</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Markdown 编辑器</h2>
            <MarkdownEditorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 marked.js 解析 Markdown
import { marked } from 'marked'

// 配置选项
marked.setOptions({
  breaks: true,        // 支持 GitHub 风格换行
  gfm: true,           // 启用 GitHub Flavored Markdown
  headerIds: true,     // 为标题生成 ID
  mangle: false,       // 不混淆邮箱地址
})

// 解析 Markdown
const markdown = \`
# 标题
这是一个 **Markdown** 示例。

- 列表项 1
- 列表项 2
\`

const html = await marked.parse(markdown)
console.log(html)

// 使用 highlight.js 实现代码高亮
import hljs from 'highlight.js'

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 使用 Python-Markdown 解析
import markdown
from markdown.extensions.codehilite import CodeHiliteExtension
from markdown.extensions.fenced_code import FencedCodeExtension

md = markdown.Markdown(
    extensions=[
        'fenced_code',      # 代码块
        'codehilite',       # 代码高亮
        'tables',           # 表格
        'toc',              # 目录
    ]
)

text = '''
# 标题
这是一个 **Markdown** 示例。
'''

html = md.convert(text)
print(html)

# 使用 markdown-it-py (更现代的选择)
from markdown_it import MarkdownIt

mdit = MarkdownIt()
result = mdit.render('# Hello **Markdown**')
print(result)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 blackfriday 库
package main

import (
    "fmt"
    "github.com/russross/blackfriday/v2"
)

func main() {
    markdown := \`
# 标题
这是一个 **Markdown** 示例。

- 列表项 1
- 列表项 2
\`

    // 基础渲染
    html := blackfriday.Run([]byte(markdown))
    fmt.Println(string(html))

    // 自义扩展
    html = blackfriday.Run([]byte(markdown),
        blackfriday.WithExtensions(
            blackfriday.Tables |
            blackfriday.FencedCode |
            blackfriday.Autolink,
        ),
    )
}

// 使用 goldmed 库 (更强大)
import "github.com/yuin/goldmark"

func renderWithGoldmark(md string) string {
    var buf bytes.Buffer
    if err := goldmark.Convert([]byte(md), &buf); err != nil {
        panic(err)
    }
    return buf.String()
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 commonmark-java 库
import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

public class MarkdownParser {
    public static void main(String[] args) {
        String markdown = "# 标题\\n" +
                         "这是一个 **Markdown** 示例。\\n";

        // 创建解析器和渲染器
        Parser parser = Parser.builder().build();
        HtmlRenderer renderer = HtmlRenderer.builder().build();

        // 解析并渲染
        Node document = parser.parse(markdown);
        String html = renderer.render(document);
        System.out.println(html);
    }
}

// 使用 flexmark-java (功能更丰富)
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;

public class FlexmarkParser {
    public static void main(String[] args) {
        MutableDataSet options = new MutableDataSet();

        Parser parser = Parser.builder(options).build();
        HtmlRenderer renderer = HtmlRenderer.builder(options).build();

        String html = renderer.render(parser.parse(markdown));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Markdown 编辑器演示组件
function MarkdownEditorDemo() {
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>编辑区</h4>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="输入 Markdown 内容..."
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, monospace',
            resize: 'vertical'
          }}
        />
        <div className="demo-controls" style={{ marginTop: '12px' }}>
          <button onClick={handlePreview}>预览</button>
          <button onClick={handleClear}>清空</button>
          <button onClick={() => handleCopy(markdown)}>复制 Markdown</button>
        </div>
      </div>

      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>预览区</h4>
        <div
          style={{
            minHeight: '300px',
            background: '#fff',
            color: '#333',
            padding: '16px',
            overflow: 'auto',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#999">点击"预览"按钮查看渲染结果</p>' }}
        />
        <div className="demo-controls" style={{ marginTop: '12px' }}>
          <button onClick={() => handleCopy(previewHtml)} disabled={!previewHtml}>复制 HTML</button>
        </div>
      </div>
    </div>
  )
}
