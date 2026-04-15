import { useState, useMemo } from 'react'
import './ToolPage.css'

interface DiffLine {
  type: 'same' | 'add' | 'remove'
  content: string
  lineNumLeft?: number
  lineNumRight?: number
}

export default function TextDiffToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>文本比对</h1>
        <p>Text Diff - 两段文本的差异对比</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>文本差异</h3>
                <p>文本差异（Diff）是比较两段文本的不同之处，标记出增加、删除和修改的内容</p>
              </div>
              <div className="feature-card">
                <h3>逐行比对</h3>
                <p>将文本按行分割后逐行比较，识别每一行的变化类型：新增、删除或未改变</p>
              </div>
              <div className="feature-card">
                <h3>最长公共子序列</h3>
                <p>LCS 算法用于找到两个序列的最长公共子序列，是差异比对的核心算法</p>
              </div>
              <div className="feature-card">
                <h3>统一差异格式</h3>
                <p>Unified Diff 是一种标准的差异输出格式，被 Git、diff 命令等广泛使用</p>
              </div>
            </div>

            <h2>差异标记说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>符号</th>
                    <th>颜色</th>
                    <th>含义</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>+</code></td>
                    <td style={{ color: '#4caf50' }}>绿色</td>
                    <td>新增行，在修改后文本中新增的内容</td>
                  </tr>
                  <tr>
                    <td><code>-</code></td>
                    <td style={{ color: '#f44336' }}>红色</td>
                    <td>删除行，在原始文本中被删除的内容</td>
                  </tr>
                  <tr>
                    <td><code> </code></td>
                    <td style={{ color: '#666' }}>灰色</td>
                    <td>未改变行，两段文本中相同的内容</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>比对算法</h2>
            <div className="info-box">
              <strong>LCS (最长公共子序列) 算法</strong>
              <p>通过动态规划找到两个文本序列的最长公共子序列，从而确定最小编辑距离。时间复杂度 O(m*n)，其中 m 和 n 分别是两段文本的行数。</p>
              <ul>
                <li>空间优化：可以使用滚动数组减少空间复杂度</li>
                <li>路径回溯：从 DP 表回溯找到具体的差异位置</li>
                <li>语义优化：可以按句子或单词而非字符进行比对</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>版本控制</strong> - Git、SVN 等版本控制系统显示文件变更</li>
              <li><strong>代码审查</strong> - Pull Request 中查看代码改动</li>
              <li><strong>文档对比</strong> - 比较两版文档的差异</li>
              <li><strong>配置比较</strong> - 比较配置文件的变更</li>
              <li><strong>协同编辑</strong> - 多人协作时显示他人的修改</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>文本比对</h2>
            <TextDiffDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 简单的文本差异算法
function diffLines(oldText, newText) {
  const oldLines = oldText.split('\\n')
  const newLines = newText.split('\\n')
  const result = []

  // 使用 LCS 算法找到公共行
  const lcs = longestCommonSubsequence(oldLines, newLines)

  let oldIdx = 0, newIdx = 0, lcsIdx = 0

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length &&
        oldLines[oldIdx] === lcs[lcsIdx] &&
        newLines[newIdx] === lcs[lcsIdx]) {
      result.push({ type: 'same', content: oldLines[oldIdx] })
      oldIdx++; newIdx++; lcsIdx++
    } else if (oldIdx < oldLines.length &&
               (lcsIdx >= lcs.length || oldLines[oldIdx] !== lcs[lcsIdx])) {
      result.push({ type: 'remove', content: oldLines[oldIdx] })
      oldIdx++
    } else {
      result.push({ type: 'add', content: newLines[newIdx] })
      newIdx++
    }
  }
  return result
}

// LCS 算法
function longestCommonSubsequence(arr1, arr2) {
  const m = arr1.length, n = arr2.length
  const dp = Array(m + 1).fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i-1] === arr2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
      }
    }
  }

  // 回溯找到 LCS
  const lcs = []
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (arr1[i-1] === arr2[j-1]) {
      lcs.unshift(arr1[i-1])
      i--; j--
    } else if (dp[i-1][j] > dp[i][j-1]) {
      i--
    } else {
      j--
    }
  }
  return lcs
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import difflib

def diff_texts(text1, text2):
    """比较两段文本的差异"""
    lines1 = text1.splitlines(keepends=True)
    lines2 = text2.splitlines(keepends=True)

    # 使用 difflib 生成差异
    differ = difflib.Differ()
    diff = list(differ.compare(lines1, lines2))

    result = []
    for line in diff:
        if line.startswith('  '):
            result.append(('same', line[2:]))
        elif line.startswith('- '):
            result.append(('remove', line[2:]))
        elif line.startswith('+ '):
            result.append(('add', line[2:]))

    return result

# 使用 unified_diff 生成标准格式
def unified_diff(text1, text2, filename1='original', filename2='modified'):
    lines1 = text1.splitlines(keepends=True)
    lines2 = text2.splitlines(keepends=True)

    diff = difflib.unified_diff(
        lines1, lines2,
        fromfile=filename1,
        tofile=filename2,
        lineterm=''
    )
    return ''.join(diff)

# 示例
old = "Hello\\nWorld\\nPython"
new = "Hello\\nPython\\nCode"

print(unified_diff(old, new))`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "strings"

    "github.com/sergi/go-diff/diffmatchpatch"
)

func main() {
    oldText := "Hello\\nWorld\\nPython"
    newText := "Hello\\nPython\\nCode"

    // 使用 diffmatchpatch 库
    dmp := diffmatchpatch.New()

    // 按行差异
    diffs := dmp.DiffMain(oldText, newText, false)

    for _, diff := range diffs {
        switch diff.Type {
        case diffmatchpatch.DiffEqual:
            fmt.Printf("  %s\\n", diff.Text)
        case diffmatchpatch.DiffInsert:
            fmt.Printf("+ %s\\n", diff.Text)
        case diffmatchpatch.DiffDelete:
            fmt.Printf("- %s\\n", diff.Text)
        }
    }

    // 生成 patch
    patches := dmp.PatchMake(oldText, diffs)
    patchText := dmp.PatchToText(patches)
    fmt.Println("\\nPatch:")
    fmt.Println(patchText)
}

// 简单的行级差异实现
func simpleDiff(old, new string) []DiffLine {
    oldLines := strings.Split(old, "\\n")
    newLines := strings.Split(new, "\\n")

    // 使用 LCS 算法...
    // 实现略
    return nil
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.*;
import java.util.stream.*;

public class TextDiff {

    public static List<DiffLine> diff(String oldText, String newText) {
        String[] oldLines = oldText.split("\\n");
        String[] newLines = newText.split("\\n");

        List<DiffLine> result = new ArrayList<>();
        int[][] dp = computeLCS(oldLines, newLines);

        // 回溯生成差异
        backtrack(result, oldLines, newLines, dp,
                  oldLines.length, newLines.length);

        return result;
    }

    private static int[][] computeLCS(String[] a, String[] b) {
        int m = a.length, n = b.length;
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a[i-1].equals(b[j-1])) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
                }
            }
        }
        return dp;
    }

    private static void backtrack(List<DiffLine> result,
                                  String[] oldLines, String[] newLines,
                                  int[][] dp, int i, int j) {
        if (i > 0 && j > 0 && oldLines[i-1].equals(newLines[j-1])) {
            backtrack(result, oldLines, newLines, dp, i-1, j-1);
            result.add(new DiffLine(' ', oldLines[i-1], i, j));
        } else if (j > 0 && (i == 0 || dp[i][j-1] >= dp[i-1][j])) {
            backtrack(result, oldLines, newLines, dp, i, j-1);
            result.add(new DiffLine('+', newLines[j-1], -1, j));
        } else if (i > 0 && (j == 0 || dp[i][j-1] < dp[i-1][j])) {
            backtrack(result, oldLines, newLines, dp, i-1, j);
            result.add(new DiffLine('-', oldLines[i-1], i, -1));
        }
    }

    static class DiffLine {
        char type;
        String content;
        int oldLine, newLine;

        DiffLine(char type, String content, int oldLine, int newLine) {
            this.type = type;
            this.content = content;
            this.oldLine = oldLine;
            this.newLine = newLine;
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

// 文本比对演示组件
function TextDiffDemo() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')

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

  const copyMerged = () => {
    navigator.clipboard.writeText(diffResult.map(l => l.content).join('\n'))
  }

  return (
    <div className="diff-demo">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div className="config-item">
          <label>原始文本</label>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="输入原始文本..."
            rows={8}
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
        <div className="config-item">
          <label>修改后文本</label>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="输入修改后文本..."
            rows={8}
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
      </div>

      {(leftText || rightText) && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0 }}>差异对比</h4>
            <span style={{ fontSize: '12px', color: '#666' }}>
              <span style={{ color: '#4caf50' }}>+{stats.added}</span>{' '}
              <span style={{ color: '#f44336' }}>-{stats.removed}</span>{' '}
              <span style={{ color: '#666' }}>= {stats.same}</span>
            </span>
          </div>

          <div style={{
            maxHeight: '400px',
            overflow: 'auto',
            background: '#1e1e1e',
            borderRadius: '8px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '13px'
          }}>
            {diffResult.map((line, index) => (
              <div
                key={index}
                style={{
                  padding: '2px 8px',
                  display: 'flex',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  background: line.type === 'add' ? 'rgba(76, 175, 80, 0.2)' :
                              line.type === 'remove' ? 'rgba(244, 67, 54, 0.2)' :
                              'transparent',
                  borderLeft: line.type === 'add' ? '3px solid #4caf50' :
                              line.type === 'remove' ? '3px solid #f44336' :
                              '3px solid transparent'
                }}
              >
                <span style={{ width: '20px', color: '#888', flexShrink: 0 }}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </span>
                <span style={{ width: '40px', color: '#888', flexShrink: 0 }}>
                  {line.lineNumLeft || line.lineNumRight || ''}
                </span>
                <span style={{
                  color: line.type === 'add' ? '#4caf50' :
                         line.type === 'remove' ? '#f44336' : '#d4d4d4'
                }}>
                  {line.content}
                </span>
              </div>
            ))}
          </div>

          <div className="demo-controls" style={{ marginTop: '16px' }}>
            <button onClick={copyMerged}>复制合并结果</button>
          </div>
        </>
      )}
    </div>
  )
}
