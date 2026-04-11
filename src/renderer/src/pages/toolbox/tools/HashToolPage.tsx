import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import { hashStringAll, hashFileAll, type HashAlgo } from '../hashUtils'
import '../toolbox.css'

const ALGOS: HashAlgo[] = ['MD5', 'SHA1', 'SHA256']

export default function HashToolPage() {
  const [hashText, setHashText] = useState('')
  const [hashTextResults, setHashTextResults] = useState<Record<HashAlgo, string>>({
    MD5: '',
    SHA1: '',
    SHA256: ''
  })
  const [hashFileName, setHashFileName] = useState<string | null>(null)
  const [hashFileResults, setHashFileResults] = useState<Record<HashAlgo, string>>({
    MD5: '',
    SHA1: '',
    SHA256: ''
  })
  const [hashBusy, setHashBusy] = useState(false)
  const [hashError, setHashError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleHashText = () => {
    setHashError(null)
    try {
      setHashTextResults(hashStringAll(hashText))
    } catch (e) {
      setHashError(e instanceof Error ? e.message : '计算失败')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setHashError(null)
    setHashFileResults({ MD5: '', SHA1: '', SHA256: '' })
    if (!file) {
      setHashFileName(null)
      return
    }
    setHashFileName(file.name)
    setHashBusy(true)
    try {
      const results = await hashFileAll(file)
      setHashFileResults(results)
    } catch (err) {
      setHashError(err instanceof Error ? err.message : '文件 Hash 计算失败')
    } finally {
      setHashBusy(false)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/encoding" className="toolbox-back">
        ← 返回编码与加解密
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">#️⃣</span>
          <h1>Hash 计算</h1>
        </div>
        <p className="page-sub">计算字符串或文件的 MD5、SHA1、SHA256 哈希值</p>
      </div>

      <section className="tool-card">
        {hashError && (
          <div className="error-message">
            <span>❌ {hashError}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">字符串 Hash</div>
          <textarea
            className="tool-textarea"
            value={hashText}
            onChange={(e) => setHashText(e.target.value)}
            placeholder="输入要计算 Hash 的文本..."
            rows={4}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleHashText}>
              计算
            </button>
          </div>
          {ALGOS.map(
            (algo) =>
              hashTextResults[algo] && (
                <div key={algo} style={{ marginTop: 12 }}>
                  <div className="tool-label" style={{ marginBottom: 4 }}>
                    {algo}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <pre className="tool-result mono" style={{ flex: 1, margin: 0 }}>
                      {hashTextResults[algo]}
                    </pre>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onCopy(hashTextResults[algo])}
                    >
                      复制
                    </button>
                  </div>
                </div>
              )
          )}
        </div>

        <div className="tool-block">
          <div className="tool-block-title">文件 Hash</div>
          <input type="file" className="tool-file" onChange={handleFileChange} />
          {hashFileName && <div className="tool-meta">已选：{hashFileName}</div>}
          {hashBusy && <div className="tool-meta">计算中...</div>}
          {ALGOS.map(
            (algo) =>
              hashFileResults[algo] && (
                <div key={algo} style={{ marginTop: 12 }}>
                  <div className="tool-label" style={{ marginBottom: 4 }}>
                    {algo}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <pre className="tool-result mono" style={{ flex: 1, margin: 0 }}>
                      {hashFileResults[algo]}
                    </pre>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onCopy(hashFileResults[algo])}
                    >
                      复制
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      </section>
    </div>
  )
}
