import { useState, useMemo } from 'react'
import './ToolPage.css'

export default function WordCountToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>字数统计</h1>
        <p>Word Count - 统计字符数、单词数、行数等</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>统计指标</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>字符数</h3>
                <p>文本中所有字符的总数，包括字母、数字、标点、空格、换行符等</p>
              </div>
              <div className="feature-card">
                <h3>字符数（不含空格）</h3>
                <p>去除空格、制表符、换行符等空白字符后的字符数量</p>
              </div>
              <div className="feature-card">
                <h3>单词数</h3>
                <p>按空白字符分割后的词组数量，适用于英文和混合文本</p>
              </div>
              <div className="feature-card">
                <h3>行数/段落数</h3>
                <p>行数按换行符统计，段落数按空行分隔统计</p>
              </div>
            </div>

            <h2>统计项目说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>统计项</th>
                    <th>计算方式</th>
                    <th>应用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>字符数</code></td>
                    <td>text.length</td>
                    <td>字符限制、存储大小估算</td>
                  </tr>
                  <tr>
                    <td><code>字符数（不含空格）</code></td>
                    <td>去除 \s 后的长度</td>
                    <td>代码行数、有效字符统计</td>
                  </tr>
                  <tr>
                    <td><code>单词数</code></td>
                    <td>按空白分割后的词组数</td>
                    <td>文章字数、阅读时间估算</td>
                  </tr>
                  <tr>
                    <td><code>行数</code></td>
                    <td>按换行符分割</td>
                    <td>代码行数统计</td>
                  </tr>
                  <tr>
                    <td><code>段落数</code></td>
                    <td>按空行分隔</td>
                    <td>文章结构分析</td>
                  </tr>
                  <tr>
                    <td><code>中文字符</code></td>
                    <td>匹配 \u4e00-\u9fa5</td>
                    <td>中文文章字数统计</td>
                  </tr>
                  <tr>
                    <td><code>英文单词</code></td>
                    <td>匹配 [a-zA-Z]+</td>
                    <td>英文单词统计</td>
                  </tr>
                  <tr>
                    <td><code>数字</code></td>
                    <td>匹配 \d+</td>
                    <td>数据项统计</td>
                  </tr>
                  <tr>
                    <td><code>标点符号</code></td>
                    <td>匹配中英文标点</td>
                    <td>文章分析</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>正则表达式说明</h2>
            <div className="info-box">
              <strong>常用匹配模式</strong>
              <ul>
                <li><code>/[\u4e00-\u9fa5]/g</code> - 匹配中文字符（CJK 统一汉字）</li>
                <li><code>/[a-zA-Z]+/g</code> - 匹配英文单词</li>
                <li><code>/\d+/g</code> - 匹配数字序列</li>
                <li><code>/\s+/g</code> - 匹配空白字符（空格、制表、换行）</li>
                <li><code>/\n/g</code> - 匹配换行符</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>写作统计</strong> - 统计文章字数，估算阅读时间</li>
              <li><strong>代码统计</strong> - 统计代码行数、有效代码量</li>
              <li><strong>内容审核</strong> - 检查文本长度是否符合限制</li>
              <li><strong>SEO 分析</strong> - 统计关键词密度、标题长度</li>
              <li><strong>学术写作</strong> - 统计论文字数、参考文献数</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>字数统计</h2>
            <WordCountDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 字数统计函数
function countWords(text) {
  return {
    // 字符数
    chars: text.length,

    // 字符数（不含空格）
    charsNoSpace: text.replace(/\\s/g, '').length,

    // 单词数（按空白分割）
    words: text.trim() ? text.trim().split(/\\s+/).filter(Boolean).length : 0,

    // 行数
    lines: text ? text.split('\\n').length : 0,

    // 段落数（按空行分隔）
    paragraphs: text.trim() ? text.split(/\\n\\s*\\n/).filter(Boolean).length : 0,

    // 中文字符
    chineseChars: (text.match(/[\\u4e00-\\u9fa5]/g) || []).length,

    // 英文单词
    englishWords: (text.match(/[a-zA-Z]+/g) || []).length,

    // 数字
    numbers: (text.match(/\\d+/g) || []).length,

    // 标点符号
    punctuation: (text.match(/[，。！？、；：""''（）【】《》,.!?;:'"()\\[\\]<>]/g) || []).length
  }
}

// 阅读时间估算（假设每分钟 300 字）
function estimateReadingTime(text) {
  const stats = countWords(text)
  const totalWords = stats.chineseChars + stats.englishWords
  const minutes = Math.ceil(totalWords / 300)
  return { minutes, totalWords }
}

// 使用示例
const text = \`
你好，世界！Hello World!
这是一段测试文本。
This is a test text with 123 numbers.
\`

console.log(countWords(text))`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import re
from collections import Counter

def count_words(text: str) -> dict:
    """统计文本字数"""

    # 字符数
    chars = len(text)

    # 字符数（不含空格）
    chars_no_space = len(re.sub(r'\\s', '', text))

    # 单词数
    words = len(text.split()) if text.strip() else 0

    # 行数
    lines = len(text.split('\\n')) if text else 0

    # 段落数
    paragraphs = len([p for p in text.split('\\n\\n') if p.strip()]) if text.strip() else 0

    # 中文字符
    chinese_chars = len(re.findall(r'[\\u4e00-\\u9fa5]', text))

    # 英文单词
    english_words = len(re.findall(r'[a-zA-Z]+', text))

    # 数字
    numbers = len(re.findall(r'\\d+', text))

    # 标点符号
    punctuation = len(re.findall(r'[，。！？、；：""''（）【】《》,.!?;:\'"()\\[\\]<>]', text))

    return {
        'chars': chars,
        'chars_no_space': chars_no_space,
        'words': words,
        'lines': lines,
        'paragraphs': paragraphs,
        'chinese_chars': chinese_chars,
        'english_words': english_words,
        'numbers': numbers,
        'punctuation': punctuation
    }

def estimate_reading_time(text: str, words_per_minute: int = 300) -> dict:
    """估算阅读时间"""
    stats = count_words(text)
    total_words = stats['chinese_chars'] + stats['english_words']
    minutes = max(1, (total_words + words_per_minute - 1) // words_per_minute)
    return {'minutes': minutes, 'total_words': total_words}

# 使用示例
text = """
你好，世界！Hello World!
这是一段测试文本。
This is a test text with 123 numbers.
"""

print(count_words(text))`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "regexp"
    "strings"
)

type WordStats struct {
    Chars          int
    CharsNoSpace   int
    Words          int
    Lines          int
    Paragraphs     int
    ChineseChars   int
    EnglishWords   int
    Numbers        int
    Punctuation    int
}

func CountWords(text string) WordStats {
    stats := WordStats{}

    // 字符数
    stats.Chars = len(text)

    // 字符数（不含空格）
    stats.CharsNoSpace = len(strings.ReplaceAll(
        strings.ReplaceAll(
            strings.ReplaceAll(text, " ", ""),
            "\\t", ""),
        "\\n", ""))

    // 单词数
    if strings.TrimSpace(text) != "" {
        stats.Words = len(strings.Fields(text))
    }

    // 行数
    if text != "" {
        stats.Lines = len(strings.Split(text, "\\n"))
    }

    // 段落数
    if strings.TrimSpace(text) != "" {
        paragraphs := strings.Split(text, "\\n\\n")
        for _, p := range paragraphs {
            if strings.TrimSpace(p) != "" {
                stats.Paragraphs++
            }
        }
    }

    // 中文字符
    chineseRegex := regexp.MustCompile(\`[\\x{4e00}-\\x{9fa5}]\`)
    stats.ChineseChars = len(chineseRegex.FindAllString(text, -1))

    // 英文单词
    englishRegex := regexp.MustCompile(\`[a-zA-Z]+\`)
    stats.EnglishWords = len(englishRegex.FindAllString(text, -1))

    // 数字
    numberRegex := regexp.MustCompile(\`\\d+\`)
    stats.Numbers = len(numberRegex.FindAllString(text, -1))

    // 标点符号
    punctuationRegex := regexp.MustCompile(\`[，。！？、；：""''（）【】《》,.!?;:'"()\\[\\]<>]\`)
    stats.Punctuation = len(punctuationRegex.FindAllString(text, -1))

    return stats
}

func main() {
    text := \`你好，世界！Hello World!
这是一段测试文本。
This is a test text with 123 numbers.\`

    stats := CountWords(text)
    fmt.Printf("%+v\\n", stats)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.regex.*;

public class WordCounter {

    public static class WordStats {
        public int chars;
        public int charsNoSpace;
        public int words;
        public int lines;
        public int paragraphs;
        public int chineseChars;
        public int englishWords;
        public int numbers;
        public int punctuation;
    }

    public static WordStats countWords(String text) {
        WordStats stats = new WordStats();

        if (text == null || text.isEmpty()) {
            return stats;
        }

        // 字符数
        stats.chars = text.length();

        // 字符数（不含空格）
        stats.charsNoSpace = text.replaceAll("\\\\s", "").length();

        // 单词数
        String trimmed = text.trim();
        if (!trimmed.isEmpty()) {
            stats.words = trimmed.split("\\\\s+").length;
        }

        // 行数
        stats.lines = text.split("\\n", -1).length;

        // 段落数
        String[] paragraphs = text.split("\\n\\\\s*\\n");
        for (String p : paragraphs) {
            if (!p.trim().isEmpty()) {
                stats.paragraphs++;
            }
        }

        // 中文字符
        stats.chineseChars = countMatches(text, "[\\u4e00-\\u9fa5]");

        // 英文单词
        stats.englishWords = countMatches(text, "[a-zA-Z]+");

        // 数字
        stats.numbers = countMatches(text, "\\\\d+");

        // 标点符号
        stats.punctuation = countMatches(text,
            "[，。！？、；：""''（）【】《》,.!?;:'\"()\\\\[\\\\]<>]");

        return stats;
    }

    private static int countMatches(String text, String regex) {
        Matcher matcher = Pattern.compile(regex).matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    // 阅读时间估算
    public static int estimateReadingTime(String text) {
        WordStats stats = countWords(text);
        int totalWords = stats.chineseChars + stats.englishWords;
        return Math.max(1, (totalWords + 299) / 300);
    }

    public static void main(String[] args) {
        String text = \"""
            你好，世界！Hello World!
            这是一段测试文本。
            This is a test text with 123 numbers.
            \""";

        WordStats stats = countWords(text);
        System.out.println("字符数: " + stats.chars);
        System.out.println("中文: " + stats.chineseChars);
        System.out.println("英文单词: " + stats.englishWords);
        System.out.println("阅读时间: " + estimateReadingTime(text) + " 分钟");
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 字数统计演示组件
function WordCountDemo() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
    const lines = text ? text.split('\n').length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
    const numbers = (text.match(/\d+/g) || []).length
    const punctuation = (text.match(/[，。！？、；：""''（）【】《》,.!?;:'"()\[\]<>]/g) || []).length

    return {
      chars,
      charsNoSpace,
      words,
      lines,
      paragraphs,
      chineseChars,
      englishWords,
      numbers,
      punctuation
    }
  }, [text])

  const statItems = [
    { label: '字符数', value: stats.chars, desc: '包含所有字符', color: '#4fc3f7' },
    { label: '字符数（不含空格）', value: stats.charsNoSpace, desc: '去除空格后', color: '#29b6f6' },
    { label: '单词数', value: stats.words, desc: '按空格分割', color: '#4caf50' },
    { label: '行数', value: stats.lines, desc: '按换行分割', color: '#8bc34a' },
    { label: '段落数', value: stats.paragraphs, desc: '按空行分割', color: '#cddc39' },
    { label: '中文字符', value: stats.chineseChars, desc: '汉字数量', color: '#ff9800' },
    { label: '英文单词', value: stats.englishWords, desc: '英文单词数', color: '#ff5722' },
    { label: '数字', value: stats.numbers, desc: '数字组数', color: '#9c27b0' },
    { label: '标点符号', value: stats.punctuation, desc: '中英文标点', color: '#673ab7' }
  ]

  const handleClear = () => setText('')
  const handleCopy = () => navigator.clipboard.writeText(text)

  return (
    <div className="word-count-demo">
      <div className="config-item">
        <label>输入文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴或输入要统计的文本..."
          rows={8}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'inherit',
            fontSize: '13px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0' }}>统计结果</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {statItems.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                borderLeft: `3px solid ${item.color}`
              }}
            >
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: item.color
              }}>
                {item.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', marginTop: '4px', color: '#333' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-controls" style={{ marginTop: '16px' }}>
        <button onClick={handleClear}>清空</button>
        {text && <button onClick={handleCopy}>复制文本</button>}
      </div>
    </div>
  )
}
