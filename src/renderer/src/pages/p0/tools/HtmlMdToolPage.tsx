import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function HtmlMdToolPage() {
  const [mode, setMode] = useState<'htmlToMd' | 'mdToHtml'>('htmlToMd')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 HTML 转 Markdown
  const htmlToMarkdown = (html: string): string => {
    let md = html

    // 移除注释
    md = md.replace(/<!--[\s\S]*?-->/g, '')

    // 标题
    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n')
    md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n\n')
    md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n\n')

    // 段落
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')

    // 链接
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

    // 图片
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')

    // 粗体和斜体
    md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')

    // 代码
    md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```')

    // 列表
    md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n')

    // 引用
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n')

    // 换行
    md = md.replace(/<br\s*\/?>/gi, '\n')

    // 移除其他标签
    md = md.replace(/<[^>]+>/g, '')

    // 解码 HTML 实体
    md = md.replace(/&nbsp;/g, ' ')
    md = md.replace(/&amp;/g, '&')
    md = md.replace(/&lt;/g, '<')
    md = md.replace(/&gt;/g, '>')
    md = md.replace(/&quot;/g, '"')

    // 清理多余空行
    md = md.replace(/\n{3,}/g, '\n\n')
    md = md.trim()

    return md
  }

  // 简单的 Markdown 转 HTML
  const markdownToHtml = (md: string): string => {
    let html = md

    // 转义 HTML 特殊字符（排除已存在的 HTML 标签）
    html = html.replace(/&/g, '&amp;')
    html = html.replace(/</g, '&lt;')
    html = html.replace(/>/g, '&gt;')

    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 标题
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // 引用
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

    // 无序列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // 段落
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    // 清理
    html = html.replace(/<p>\s*<\/p>/g, '')
    html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1')
    html = html.replace(/<p>\s*(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1')

    return html
  }

  const handleConvert = () => {
    setError(null)
    try {
      if (mode === 'htmlToMd') {
        setOutput(htmlToMarkdown(input))
      } else {
        setOutput(markdownToHtml(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'htmlToMd' ? 'mdToHtml' : 'htmlToMd')
  }

  const loadExample = () => {
    if (mode === 'htmlToMd') {
      setInput(`<h1>HTML 示例</h1>
<p>这是一个<strong>HTML 转 Markdown</strong>的示例。</p>
<h2>列表</h2>
<ul>
<li>项目一</li>
<li>项目二</li>
</ul>
<p>访问 <a href="https://example.com">示例链接</a> 了解更多。</p>`)
    } else {
      setInput(`# Markdown 示例

这是一个 **Markdown 转 HTML** 的示例。

## 功能

- 支持常见 Markdown 语法
- 简单易用

[点击链接](https://example.com) 访问示例。`)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/markdown" className="toolbox-back">
        ← 返回 Markdown 工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔄</span>
          <h1>HTML/Markdown 互转</h1>
        </div>
        <p className="page-sub">HTML 与 Markdown 格式相互转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            转换模式
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'htmlToMd' | 'mdToHtml')}
            >
              <option value="htmlToMd">HTML 转 Markdown</option>
              <option value="mdToHtml">Markdown 转 HTML</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">
            {mode === 'htmlToMd' ? 'HTML 输入' : 'Markdown 输入'}
          </div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'htmlToMd' ? '输入 HTML 代码...' : '输入 Markdown 内容...'}
            rows={10}
          />
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={!input.trim()}
          >
            转换
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSwap}>
            交换输入输出
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadExample}>
            加载示例
          </button>
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">
              {mode === 'htmlToMd' ? 'Markdown 输出' : 'HTML 输出'}
            </div>
            <textarea
              className="tool-textarea"
              value={output}
              readOnly
              rows={10}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
                复制结果
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
