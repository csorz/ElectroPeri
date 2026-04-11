import { useCallback, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function WordCountToolPage() {
  const [text, setText] = useState('')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

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
    { label: '字符数', value: stats.chars, desc: '包含所有字符' },
    { label: '字符数（不含空格）', value: stats.charsNoSpace, desc: '去除空格后' },
    { label: '单词数', value: stats.words, desc: '按空格分割' },
    { label: '行数', value: stats.lines, desc: '按换行分割' },
    { label: '段落数', value: stats.paragraphs, desc: '按空行分割' },
    { label: '中文字符', value: stats.chineseChars, desc: '汉字数量' },
    { label: '英文单词', value: stats.englishWords, desc: '英文单词数' },
    { label: '数字', value: stats.numbers, desc: '数字组数' },
    { label: '标点符号', value: stats.punctuation, desc: '中英文标点' }
  ]

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/text" className="toolbox-back">
        ← 返回文本与数据转换
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔢</span>
          <h1>字数统计</h1>
        </div>
        <p className="page-sub">统计字符数、单词数、行数等</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入文本</div>
          <textarea
            className="tool-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴或输入要统计的文本..."
            rows={10}
          />
        </div>

        <div className="tool-block">
          <div className="tool-block-title">统计结果</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {statItems.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {item.value.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setText('')}>
            清空
          </button>
          {text && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(text)}>
              复制文本
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
