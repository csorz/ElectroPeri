import { useState } from 'react'
import './ToolPage.css'

export default function HtmlMdToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>HTML/Markdown 互转</h1>
        <p>HTML 与 Markdown 格式的相互转换工具</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>转换原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>HTML 转 Markdown</h3>
                <p>解析 HTML 标签，提取语义内容，转换为对应的 Markdown 语法</p>
              </div>
              <div className="feature-card">
                <h3>Markdown 转 HTML</h3>
                <p>解析 Markdown 语法，生成对应的 HTML 标签和结构</p>
              </div>
              <div className="feature-card">
                <h3>语义映射</h3>
                <p>HTML 标签与 Markdown 语法之间存在明确的映射关系</p>
              </div>
              <div className="feature-card">
                <h3>格式保留</h3>
                <p>转换过程中尽可能保留原始内容的语义和格式</p>
              </div>
            </div>

            <h2>标签映射对照</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>HTML 标签</th>
                    <th>Markdown 语法</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>&lt;h1&gt; - &lt;h6&gt;</code></td>
                    <td><code># - ######</code></td>
                    <td>标题层级</td>
                  </tr>
                  <tr>
                    <td><code>&lt;p&gt;</code></td>
                    <td>空行分隔</td>
                    <td>段落</td>
                  </tr>
                  <tr>
                    <td><code>&lt;strong&gt;, &lt;b&gt;</code></td>
                    <td><code>**文本**</code></td>
                    <td>粗体</td>
                  </tr>
                  <tr>
                    <td><code>&lt;em&gt;, &lt;i&gt;</code></td>
                    <td><code>*文本*</code></td>
                    <td>斜体</td>
                  </tr>
                  <tr>
                    <td><code>&lt;a href="..."&gt;</code></td>
                    <td><code>[文本](URL)</code></td>
                    <td>链接</td>
                  </tr>
                  <tr>
                    <td><code>&lt;img src="..."&gt;</code></td>
                    <td><code>![alt](URL)</code></td>
                    <td>图片</td>
                  </tr>
                  <tr>
                    <td><code>&lt;ul&gt;/&lt;ol&gt;</code></td>
                    <td><code>- / 1.</code></td>
                    <td>无序/有序列表</td>
                  </tr>
                  <tr>
                    <td><code>&lt;blockquote&gt;</code></td>
                    <td><code>&gt; 引用</code></td>
                    <td>引用块</td>
                  </tr>
                  <tr>
                    <td><code>&lt;code&gt;</code></td>
                    <td><code>`代码`</code></td>
                    <td>行内代码</td>
                  </tr>
                  <tr>
                    <td><code>&lt;pre&gt;&lt;code&gt;</code></td>
                    <td><code>```代码块```</code></td>
                    <td>代码块</td>
                  </tr>
                  <tr>
                    <td><code>&lt;table&gt;</code></td>
                    <td><code>| 表格 |</code></td>
                    <td>表格</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>转换限制</h2>
            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>HTML 的样式属性（class、style）无法直接转换为 Markdown</li>
                <li>复杂的 HTML 结构（如嵌套 div）可能丢失部分语义</li>
                <li>Markdown 不支持的功能（如按钮、表单）需保留 HTML 标签</li>
                <li>HTML 实体字符需要正确编解码</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>内容迁移</strong> - 从 HTML 网站迁移到 Markdown 博客系统</li>
              <li><strong>格式转换</strong> - 网页内容转 Markdown 便于存档和编辑</li>
              <li><strong>文档编辑</strong> - 富文本编辑器内容与 Markdown 互转</li>
              <li><strong>数据导入</strong> - HTML 邮件或网页内容导入 Markdown 笔记</li>
              <li><strong>版本控制</strong> - HTML 文档转 Markdown 方便 Git 管理</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>格式转换器</h2>
            <HtmlMdConverterDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// HTML 转 Markdown
function htmlToMarkdown(html) {
  let md = html

  // 移除注释
  md = md.replace(/<!--[\\s\\S]*?-->/g, '')

  // 标题转换
  md = md.replace(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/gi, '# $1\\n\\n')
  md = md.replace(/<h2[^>]*>([\\s\\S]*?)<\\/h2>/gi, '## $1\\n\\n')
  md = md.replace(/<h3[^>]*>([\\s\\S]*?)<\\/h3>/gi, '### $1\\n\\n')

  // 粗体和斜体
  md = md.replace(/<(strong|b)[^>]*>([\\s\\S]*?)<\\/(strong|b)>/gi, '**$2**')
  md = md.replace(/<(em|i)[^>]*>([\\s\\S]*?)<\\/(em|i)>/gi, '*$2*')

  // 链接
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/gi, '[$2]($1)')

  // 图片
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\\/?>/gi, '![$2]($1)')

  // 代码
  md = md.replace(/<code[^>]*>([\\s\\S]*?)<\\/code>/gi, '\`$1\`')
  md = md.replace(/<pre[^>]*><code[^>]*>([\\s\\S]*?)<\\/code><\\/pre>/gi, '\\\`\\\`\\\`\\n$1\\n\\\`\\\`\\\`')

  // 列表
  md = md.replace(/<li[^>]*>([\\s\\S]*?)<\\/li>/gi, '- $1\\n')

  // 引用
  md = md.replace(/<blockquote[^>]*>([\\s\\S]*?)<\\/blockquote>/gi, '> $1\\n\\n')

  // 段落
  md = md.replace(/<p[^>]*>([\\s\\S]*?)<\\/p>/gi, '$1\\n\\n')
  md = md.replace(/<br\\s*\\/?>/gi, '\\n')

  // 清理剩余标签
  md = md.replace(/<[^>]+>/g, '')

  // 解码 HTML 实体
  md = md.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')

  // 清理多余空行
  md = md.replace(/\\n{3,}/g, '\\n\\n').trim()

  return md
}

// 使用 Turndown 库 (推荐)
import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// 添加自定义规则
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => '~~' + content + '~~'
})

const markdown = turndownService.turndown(htmlContent)`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# HTML 转 Markdown
import re
from bs4 import BeautifulSoup

def html_to_markdown(html):
    soup = BeautifulSoup(html, 'html.parser')

    def process_element(element):
        if element.name is None:
            return str(element)

        children = ''.join(process_element(child) for child in element.children)

        if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(element.name[1])
            return f"\\n{'#' * level} {children}\\n\\n"
        elif element.name == 'p':
            return f"\\n{children}\\n\\n"
        elif element.name in ['strong', 'b']:
            return f"**{children}**"
        elif element.name in ['em', 'i']:
            return f"*{children}*"
        elif element.name == 'a':
            href = element.get('href', '')
            return f"[{children}]({href})"
        elif element.name == 'img':
            src = element.get('src', '')
            alt = element.get('alt', '')
            return f"![{alt}]({src})"
        elif element.name == 'code':
            return f"\`{children}\`"
        elif element.name == 'li':
            return f"- {children}\\n"
        elif element.name == 'blockquote':
            lines = children.strip().split('\\n')
            return '\\n'.join(f"> {line}" for line in lines) + '\\n\\n'
        else:
            return children

    return process_element(soup)

# 使用 markdownify 库 (推荐)
from markdownify import markdownify as md

html = '<h1>标题</h1><p>这是<strong>粗体</strong>文本。</p>'
markdown = md(html, heading_style='ATX')
print(markdown)

# 使用 html2text 库
import html2text
h = html2text.HTML2Text()
h.ignore_links = False
markdown = h.handle(html)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "regexp"
    "strings"
)

// HTMLToMarkdown 将 HTML 转换为 Markdown
func HTMLToMarkdown(html string) string {
    md := html

    // 移除注释
    commentRegex := regexp.MustCompile("<!--[\\\\s\\\\S]*?-->")
    md = commentRegex.ReplaceAllString(md, "")

    // 标题
    for i := 6; i >= 1; i-- {
        pattern := regexp.MustCompile(
            fmt.Sprintf("<h%d[^>]*>([\\\\s\\\\S]*?)</h%d>", i, i),
        )
        replacement := fmt.Sprintf("%s $1\\n\\n", strings.Repeat("#", i))
        md = pattern.ReplaceAllString(md, replacement)
    }

    // 粗体
    boldRegex := regexp.MustCompile("<(strong|b)[^>]*>([\\\\s\\\\S]*?)</(strong|b)>")
    md = boldRegex.ReplaceAllString(md, "**$2**")

    // 斜体
    italicRegex := regexp.MustCompile("<(em|i)[^>]*>([\\\\s\\\\S]*?)</(em|i)>")
    md = italicRegex.ReplaceAllString(md, "*$2*")

    // 链接
    linkRegex := regexp.MustCompile("<a[^>]*href=\"([^\"]*)\"[^>]*>([\\\\s\\\\S]*?)</a>")
    md = linkRegex.ReplaceAllString(md, "[$2]($1)")

    // 图片
    imgRegex := regexp.MustCompile("<img[^>]*src=\"([^\"]*)\"[^>]*alt=\"([^\"]*)\"[^>]*\\\\/?>")
    md = imgRegex.ReplaceAllString(md, "![$2]($1)")

    // 代码
    codeRegex := regexp.MustCompile("<code[^>]*>([\\\\s\\\\S]*?)</code>")
    md = codeRegex.ReplaceAllString(md, "\`$1\`")

    // 段落
    pRegex := regexp.MustCompile("<p[^>]*>([\\\\s\\\\S]*?)</p>")
    md = pRegex.ReplaceAllString(md, "$1\\n\\n")

    // 换行
    brRegex := regexp.MustCompile("<br\\\\s*/?>")
    md = brRegex.ReplaceAllString(md, "\\n")

    // 清理剩余标签
    tagRegex := regexp.MustCompile("<[^>]+>")
    md = tagRegex.ReplaceAllString(md, "")

    // 解码 HTML 实体
    md = strings.ReplaceAll(md, "&amp;", "&")
    md = strings.ReplaceAll(md, "&lt;", "<")
    md = strings.ReplaceAll(md, "&gt;", ">")
    md = strings.ReplaceAll(md, "&nbsp;", " ")

    // 清理多余空行
    blankRegex := regexp.MustCompile("\\n{3,}")
    md = blankRegex.ReplaceAllString(md, "\\n\\n")

    return strings.TrimSpace(md)
}

// 使用 third-party 库 (推荐)
import "github.com/JohannesKaufmann/html-to-markdown"

func convertWithLibrary(html string) (string, error) {
    conv := md.NewConverter("", true, &md.Options{
        HeadingStyle: "atx",
        CodeBlockStyle: "fenced",
    })
    return conv.ConvertString(html)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;

public class HtmlToMarkdown {

    public static String convert(String html) {
        Document doc = Jsoup.parse(html);
        StringBuilder md = new StringBuilder();

        NodeTraversor.traverse(new NodeVisitor() {
            @Override
            public void head(org.jsoup.nodes.Node node, int depth) {
                if (node instanceof Element) {
                    Element el = (Element) node;
                    String tagName = el.tagName().toLowerCase();

                    switch (tagName) {
                        case "h1": md.append("# "); break;
                        case "h2": md.append("## "); break;
                        case "h3": md.append("### "); break;
                        case "strong":
                        case "b": md.append("**"); break;
                        case "em":
                        case "i": md.append("*"); break;
                        case "code": md.append("\`"); break;
                        case "a":
                            md.append("[");
                            break;
                    }
                } else if (node instanceof org.jsoup.nodes.TextNode) {
                    md.append(((org.jsoup.nodes.TextNode) node).text());
                }
            }

            @Override
            public void tail(org.jsoup.nodes.Node node, int depth) {
                if (node instanceof Element) {
                    Element el = (Element) node;
                    String tagName = el.tagName().toLowerCase();

                    switch (tagName) {
                        case "h1":
                        case "h2":
                        case "h3":
                        case "p":
                            md.append("\\n\\n");
                            break;
                        case "strong":
                        case "b": md.append("**"); break;
                        case "em":
                        case "i": md.append("*"); break;
                        case "code": md.append("\`"); break;
                        case "a":
                            md.append("](").append(el.attr("href")).append(")");
                            break;
                        case "li":
                            md.append("\\n");
                            break;
                    }
                }
            }
        }, doc.body());

        return md.toString().trim();
    }

    // 使用 commonmark 的反向转换
    public static String markdownToHtml(String markdown) {
        org.commonmark.parser.Parser parser =
            org.commonmark.parser.Parser.builder().build();
        org.commonmark.renderer.html.HtmlRenderer renderer =
            org.commonmark.renderer.html.HtmlRenderer.builder().build();

        org.commonmark.node.Node document = parser.parse(markdown);
        return renderer.render(document);
    }

    public static void main(String[] args) {
        String html = "<h1>Title</h1><p>This is <strong>bold</strong> text.</p>";
        System.out.println(convert(html));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// HTML/Markdown 转换器演示组件
function HtmlMdConverterDemo() {
  const [mode, setMode] = useState<'htmlToMd' | 'mdToHtml'>('htmlToMd')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
      {/* 模式选择 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>
          转换模式：
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'htmlToMd' | 'mdToHtml')}
            style={{ marginLeft: '8px', padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="htmlToMd">HTML 转 Markdown</option>
            <option value="mdToHtml">Markdown 转 HTML</option>
          </select>
        </label>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 输入区 */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          {mode === 'htmlToMd' ? 'HTML 输入' : 'Markdown 输入'}
        </h4>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'htmlToMd' ? '输入 HTML 代码...' : '输入 Markdown 内容...'}
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, monospace',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 操作按钮 */}
      <div className="demo-controls">
        <button onClick={handleConvert} disabled={!input.trim()}>转换</button>
        <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>交换输入输出</button>
        <button onClick={loadExample} style={{ background: '#e0e0e0', color: '#333' }}>加载示例</button>
      </div>

      {/* 输出区 */}
      {output && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            {mode === 'htmlToMd' ? 'Markdown 输出' : 'HTML 输出'}
          </h4>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {output}
          </pre>
          <div className="demo-controls" style={{ marginTop: '12px' }}>
            <button onClick={() => handleCopy(output)}>复制结果</button>
          </div>
        </div>
      )}
    </div>
  )
}
