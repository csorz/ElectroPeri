import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from './clipboard'
import { hashFile, hashString, type HashAlgo } from './hashUtils'
import './toolbox.css'

export default function ToolboxEncodingPage() {
  const [hashAlgo, setHashAlgo] = useState<HashAlgo>('SHA256')
  const [hashText, setHashText] = useState('')
  const [hashTextResult, setHashTextResult] = useState('')
  const [hashFileName, setHashFileName] = useState<string | null>(null)
  const [hashFileResult, setHashFileResult] = useState('')
  const [hashBusy, setHashBusy] = useState(false)
  const [hashError, setHashError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleHashText = () => {
    setHashError(null)
    try {
      setHashTextResult(hashString(hashAlgo, hashText))
    } catch (e) {
      setHashError(e instanceof Error ? e.message : '计算失败')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setHashError(null)
    setHashFileResult('')
    if (!file) {
      setHashFileName(null)
      return
    }
    setHashFileName(file.name)
    setHashBusy(true)
    try {
      setHashFileResult(await hashFile(hashAlgo, file))
    } catch (err) {
      setHashError(err instanceof Error ? err.message : '文件 Hash 计算失败')
    } finally {
      setHashBusy(false)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>1. 编码与加解密</h1>
        <p className="page-sub">Hash 计算（字符串 / 文件），算法 MD5 / SHA1 / SHA256</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            算法
            <select value={hashAlgo} onChange={(e) => setHashAlgo(e.target.value as HashAlgo)}>
              <option value="MD5">MD5</option>
              <option value="SHA1">SHA1</option>
              <option value="SHA256">SHA256</option>
            </select>
          </label>
        </div>

        {hashError && (
          <div className="error-message">
            <span>❌ {hashError}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">字符串</div>
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
            {hashTextResult && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(hashTextResult)}>
                复制结果
              </button>
            )}
          </div>
          {hashTextResult && <pre className="tool-result mono">{hashTextResult}</pre>}
        </div>

        <div className="tool-block">
          <div className="tool-block-title">文件</div>
          <input type="file" className="tool-file" onChange={handleFileChange} />
          {hashFileName && <div className="tool-meta">已选：{hashFileName}</div>}
          {hashBusy && <div className="tool-meta">计算中...</div>}
          {hashFileResult && (
            <>
              <pre className="tool-result mono">{hashFileResult}</pre>
              <div className="tool-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onCopy(hashFileResult)}>
                  复制结果
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
