import { useState } from 'react'
import './ToolPage.css'

export default function RegexToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>正则测试</h1>
        <p>Regular Expression - 正则表达式在线测试与匹配</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>正则表达式</h3>
                <p>一种用于描述字符串匹配模式的工具，通过特定语法规则实现对文本的搜索、替换、提取等操作</p>
              </div>
              <div className="feature-card">
                <h3>元字符</h3>
                <p>具有特殊含义的字符，如 . * + ? ^ $ | \ ( ) [ ] { }，用于构建复杂的匹配模式</p>
              </div>
              <div className="feature-card">
                <h3>字符类</h3>
                <p>用方括号定义字符集合，如 [abc] 匹配任意一个字符，[^abc] 匹配除 abc 外的任意字符</p>
              </div>
              <div className="feature-card">
                <h3>量词</h3>
                <p>指定匹配次数，如 * (0次或多次)、+ (1次或多次)、? (0次或1次)、{'{n,m}'} (n到m次)</p>
              </div>
            </div>

            <h2>常用语法</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>语法</th>
                    <th>说明</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>.</code></td>
                    <td>匹配任意单个字符（除换行符）</td>
                    <td><code>a.c</code> 匹配 "abc"、"adc"</td>
                  </tr>
                  <tr>
                    <td><code>\d</code></td>
                    <td>匹配数字字符</td>
                    <td><code>\d+</code> 匹配 "123"、"456"</td>
                  </tr>
                  <tr>
                    <td><code>\w</code></td>
                    <td>匹配字母、数字、下划线</td>
                    <td><code>\w+</code> 匹配 "hello_123"</td>
                  </tr>
                  <tr>
                    <td><code>\s</code></td>
                    <td>匹配空白字符</td>
                    <td><code>\s+</code> 匹配空格、制表符</td>
                  </tr>
                  <tr>
                    <td><code>^</code></td>
                    <td>匹配字符串开头</td>
                    <td><code>^Hello</code> 匹配开头的 "Hello"</td>
                  </tr>
                  <tr>
                    <td><code>$</code></td>
                    <td>匹配字符串结尾</td>
                    <td><code>world$</code> 匹配结尾的 "world"</td>
                  </tr>
                  <tr>
                    <td><code>()</code></td>
                    <td>捕获组，提取匹配内容</td>
                    <td><code>(\d+)-(\d+)</code> 提取两组数字</td>
                  </tr>
                  <tr>
                    <td><code>|</code></td>
                    <td>或运算符</td>
                    <td><code>cat|dog</code> 匹配 "cat" 或 "dog"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>常用标志</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>标志</th>
                    <th>名称</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>g</code></td>
                    <td>global</td>
                    <td>全局匹配，查找所有匹配项</td>
                  </tr>
                  <tr>
                    <td><code>i</code></td>
                    <td>ignoreCase</td>
                    <td>忽略大小写</td>
                  </tr>
                  <tr>
                    <td><code>m</code></td>
                    <td>multiline</td>
                    <td>多行模式，^ 和 $ 匹配行首行尾</td>
                  </tr>
                  <tr>
                    <td><code>s</code></td>
                    <td>dotAll</td>
                    <td>让 . 匹配换行符</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>表单验证</strong> - 邮箱、手机号、身份证号格式验证</li>
              <li><strong>数据提取</strong> - 从文本中提取特定格式的数据</li>
              <li><strong>文本替换</strong> - 批量替换符合模式的文本</li>
              <li><strong>日志分析</strong> - 解析日志文件，提取关键信息</li>
              <li><strong>爬虫解析</strong> - 从 HTML 中提取链接、图片等</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>正则表达式测试</h2>
            <RegexDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 创建正则表达式
const regex1 = /\\d+/g
const regex2 = new RegExp('\\\\d+', 'g')

// 测试匹配
const text = "订单号: 12345, 金额: 678.90"
const matches = text.matchAll(/\\d+/g)
for (const match of matches) {
  console.log(match[0], match.index)
}

// 替换
const result = text.replace(/\\d+/g, '***')
console.log(result) // "订单号: ***, 金额: ***"

// 捕获组
const dateRegex = /(\\d{4})-(\\d{2})-(\\d{2})/
const dateStr = "2024-01-15"
const [, year, month, day] = dateStr.match(dateRegex) || []
console.log(year, month, day) // "2024" "01" "15"`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import re

# 创建正则表达式
pattern = r'\\d+'

# 查找所有匹配
text = "订单号: 12345, 金额: 678.90"
matches = re.findall(pattern, text)
print(matches)  # ['12345', '678', '90']

# 搜索第一个匹配
match = re.search(r'(\\d+)', text)
if match:
    print(match.group(0))  # '12345'
    print(match.start())   # 匹配位置

# 替换
result = re.sub(r'\\d+', '***', text)
print(result)  # "订单号: ***, 金额: ***.**"

# 捕获组
date_pattern = r'(\\d{4})-(\\d{2})-(\\d{2})'
date_str = "2024-01-15"
match = re.match(date_pattern, date_str)
if match:
    year, month, day = match.groups()
    print(year, month, day)  # '2024' '01' '15'`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "regexp"
)

func main() {
    // 编译正则表达式
    re := regexp.MustCompile(\`\\d+\`)

    // 查找所有匹配
    text := "订单号: 12345, 金额: 678.90"
    matches := re.FindAllString(text, -1)
    fmt.Println(matches) // [12345 678 90]

    // 查找匹配位置
    loc := re.FindStringIndex(text)
    fmt.Println(loc) // [7 12]

    // 替换
    result := re.ReplaceAllString(text, "***")
    fmt.Println(result) // "订单号: ***, 金额: ***.**"

    // 捕获组
    dateRe := regexp.MustCompile(\`(\\d{4})-(\\d{2})-(\\d{2})\`)
    dateStr := "2024-01-15"
    submatches := dateRe.FindStringSubmatch(dateStr)
    fmt.Println(submatches) // [2024-01-15 2024 01 15]
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.regex.*;
import java.util.List;
import java.util.ArrayList;

public class RegexExample {
    public static void main(String[] args) {
        String text = "订单号: 12345, 金额: 678.90";

        // 编译正则表达式
        Pattern pattern = Pattern.compile("\\\\d+");
        Matcher matcher = pattern.matcher(text);

        // 查找所有匹配
        List<String> matches = new ArrayList<>();
        while (matcher.find()) {
            matches.add(matcher.group());
            System.out.println("匹配: " + matcher.group() +
                             " 位置: " + matcher.start());
        }

        // 替换
        matcher.reset();
        String result = matcher.replaceAll("***");
        System.out.println(result);

        // 捕获组
        Pattern datePattern = Pattern.compile("(\\\\d{4})-(\\\\d{2})-(\\\\d{2})");
        Matcher dateMatcher = datePattern.matcher("2024-01-15");
        if (dateMatcher.matches()) {
            System.out.println("年: " + dateMatcher.group(1));
            System.out.println("月: " + dateMatcher.group(2));
            System.out.println("日: " + dateMatcher.group(3));
        }
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 正则测试演示组件
function RegexDemo() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = () => {
    setError(null)
    setMatches(null)
    try {
      const regex = new RegExp(pattern, flags)
      const allMatches = [...text.matchAll(regex)]
      if (allMatches.length > 0) {
        setMatches(allMatches)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '正则表达式错误')
    }
  }

  const handleClear = () => {
    setPattern('')
    setText('')
    setMatches(null)
    setError(null)
  }

  const copyMatches = () => {
    if (matches) {
      navigator.clipboard.writeText(matches.map(m => m[0]).join('\n'))
    }
  }

  return (
    <div className="regex-demo">
      {error && (
        <div className="info-box warning">
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="config-grid">
        <div className="config-item">
          <label>正则表达式</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式，如：\d+"
          />
        </div>
        <div className="config-item">
          <label>标志</label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="gimsuvy"
            style={{ width: '100px' }}
          />
        </div>
      </div>

      <div className="config-item" style={{ marginTop: '16px' }}>
        <label>测试文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要测试的文本..."
          rows={6}
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
        <button onClick={handleTest}>测试匹配</button>
        <button onClick={handleClear}>清空</button>
        {matches && matches.length > 0 && (
          <button onClick={copyMatches}>复制所有匹配</button>
        )}
      </div>

      {matches && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>匹配结果 ({matches.length} 个)</h4>
          <div style={{
            maxHeight: '300px',
            overflow: 'auto',
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '12px'
          }}>
            {matches.map((match, index) => (
              <div key={index} style={{
                marginBottom: '8px',
                padding: '12px',
                background: '#fff',
                borderRadius: '6px',
                borderLeft: '3px solid #4fc3f7'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>匹配 {index + 1}:</div>
                <div style={{
                  fontFamily: 'monospace',
                  margin: '4px 0',
                  color: '#0288d1',
                  wordBreak: 'break-all'
                }}>
                  "{match[0]}"
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  位置: {match.index}
                  {match.length > 1 && (
                    <span> | 捕获组: {JSON.stringify(match.slice(1))}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches && matches.length === 0 && (
        <div className="info-box" style={{ marginTop: '16px' }}>
          <p>未找到匹配项</p>
        </div>
      )}
    </div>
  )
}
