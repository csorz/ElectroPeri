import { useCallback, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface DiffLine {
  type: 'same' | 'add' | 'remove'
  content: string
  lineNumLeft?: number
  lineNumRight?: number
}

export default function TextDiffToolPage() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const diffResult = useMemo(() => {
    const leftLines = leftText.split('\n')
    const rightLines = rightText.split('\n')
    const result: DiffLine[] = []

    // 简单的逐行比对算法
    let leftIdx = 0
    let rightIdx = 0

    while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
      const leftLine = leftLines[leftIdx]
      const rightLine = rightLines[rightIdx]

      if (leftIdx >= leftLines.length) {
        result.push({ type: 'add', content: rightLine, lineNumRight: rightIdx + 1 })
        rightIdx++
      } else if (rightIdx >= rightLines.length) {
        result.push({ type: 'remove', content: leftLine, lineNumLeft: leftIdx + 1 })
        leftIdx++
      } else if (leftLine === rightLine) {
        result.push({ type: 'same', content: leftLine, lineNumLeft: leftIdx + 1, lineNumRight: rightIdx + 1 })
        leftIdx++
        rightIdx++
      } else {
        // 查找右侧是否在后面能找到左侧当前行
        const rightMatchIdx = rightLines.slice(rightIdx + 1).indexOf(leftLine)
        const leftMatchIdx = leftLines.slice(leftIdx + 1).indexOf(rightLine)

        if (rightMatchIdx === -1 && leftMatchIdx === -1) {
          // 两边都找不到，视为修改
          result.push({ type: 'remove', content: leftLine, lineNumLeft: leftIdx + 1 })
          result.push({ type: 'add', content: rightLine, lineNumRight: rightIdx + 1 })
          leftIdx++
          rightIdx++
        } else if (rightMatchIdx === -1 || (leftMatchIdx !== -1 && leftMatchIdx < rightMatchIdx)) {
          // 左侧先出现新增
          result.push({ type: 'remove', content: leftLine, lineNumLeft: leftIdx + 1 })
          leftIdx++
        } else {
          // 右侧先出现新增
          result.push({ type: 'add', content: rightLine, lineNumRight: rightIdx + 1 })
          rightIdx++
        }
      }
    }

    return result
  }, [leftText, rightText])

  const stats = useMemo(() => {
    const added = diffResult.filter(l => l.type === 'add').length
    const removed = diffResult.filter(l => l.type === 'remove').length
    const same = diffResult.filter(l => l.type === 'same').length
    return { added, removed, same }
  }, [diffResult])

  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return { background: 'rgba(0, 200, 83, 0.15)', borderLeft: '3px solid #00c853' }
      case 'remove':
        return { background: 'rgba(255, 82, 82, 0.15)', borderLeft: '3px solid #ff5252' }
      default:
        return { borderLeft: '3px solid transparent' }
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/text" className="toolbox-back">
        ← 返回文本与数据转换
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📋</span>
          <h1>文本比对</h1>
        </div>
        <p className="page-sub">两段文本的差异对比</p>
      </div>

      <section className="tool-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">原始文本</div>
            <textarea
              className="tool-textarea"
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="输入原始文本..."
              rows={12}
            />
          </div>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">修改后文本</div>
            <textarea
              className="tool-textarea"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="输入修改后文本..."
              rows={12}
            />
          </div>
        </div>

        {(leftText || rightText) && (
          <div className="tool-block">
            <div className="tool-block-title">
              差异对比
              <span style={{ marginLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                +{stats.added} -{stats.removed} ={stats.same}
              </span>
            </div>
            <div className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto', fontSize: '13px' }}>
              {diffResult.map((line, index) => (
                <div
                  key={index}
                  style={{
                    ...getLineStyle(line.type),
                    padding: '2px 8px',
                    display: 'flex',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  <span style={{ width: '40px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </span>
                  <span style={{ width: '40px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {line.lineNumLeft || line.lineNumRight || ''}
                  </span>
                  <span>{line.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tool-actions">
          <button type="button" className="btn btn-secondary" onClick={() => onCopy(diffResult.map(l => l.content).join('\n'))}>
            复制合并结果
          </button>
        </div>
      </section>
    </div>
  )
}
