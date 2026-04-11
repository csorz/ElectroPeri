import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function FileTransferToolPage() {
  const [files, setFiles] = useState<File[]>([])
  const [shareLink, setShareLink] = useState('')
  const [uploading, setUploading] = useState(false)
  const [receivedCode, setReceivedCode] = useState('')
  const [receivedFiles, setReceivedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
  }

  const handleGenerateLink = () => {
    if (files.length === 0) {
      alert('请先选择文件')
      return
    }

    setUploading(true)

    // 模拟生成分享链接
    // 实际项目中需要后端支持
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      setShareLink(`https://share.example.com/${code}`)
      setUploading(false)
    }, 1500)
  }

  const handleReceive = () => {
    if (!receivedCode.trim()) {
      alert('请输入接收码')
      return
    }

    // 模拟接收文件
    setReceivedFiles(['示例文件.pdf', '示例图片.png'])
  }

  const handleClear = () => {
    setFiles([])
    setShareLink('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/utils" className="toolbox-back">
        ← 返回实用工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📁</span>
          <h1>文件传输</h1>
        </div>
        <p className="page-sub">快速分享文件，生成分享链接</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">发送文件</div>
          <input
            ref={fileInputRef}
            type="file"
            className="tool-file"
            multiple
            onChange={handleFileSelect}
          />
          {files.length > 0 && (
            <div className="tool-result" style={{ marginTop: '8px' }}>
              <p><strong>已选择 {files.length} 个文件：</strong></p>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name} ({formatFileSize(file.size)})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="tool-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateLink}
              disabled={uploading || files.length === 0}
            >
              {uploading ? '生成中...' : '生成分享链接'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              清除
            </button>
          </div>
        </div>

        {shareLink && (
          <div className="tool-block">
            <div className="tool-block-title">分享链接</div>
            <div className="tool-result" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                className="tool-input"
                value={shareLink}
                readOnly
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(shareLink)}>
                复制
              </button>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">接收文件</div>
          <div className="tool-row">
            <input
              type="text"
              className="tool-input"
              value={receivedCode}
              onChange={(e) => setReceivedCode(e.target.value)}
              placeholder="输入接收码"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary" onClick={handleReceive}>
              接收
            </button>
          </div>
          {receivedFiles.length > 0 && (
            <div className="tool-result" style={{ marginTop: '8px' }}>
              <p><strong>接收到的文件：</strong></p>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                {receivedFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <p>本功能为演示版本，实际文件传输需要后端服务支持。</p>
            <p style={{ marginTop: '8px' }}>推荐的在线文件传输服务：</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>
                <a href="https://snapdrop.net" target="_blank" rel="noopener noreferrer">
                  Snapdrop
                </a>
                {' '}- 局域网文件传输
              </li>
              <li>
                <a href="https://sendAnywhere.com" target="_blank" rel="noopener noreferrer">
                  SendAnywhere
                </a>
                {' '}- 跨平台文件传输
              </li>
              <li>
                <a href="https://wormhole.app" target="_blank" rel="noopener noreferrer">
                  Wormhole
                </a>
                {' '}- 端到端加密传输
              </li>
            </ul>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">安全提示</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>不要分享敏感或私密文件</li>
              <li>分享链接具有一定的有效期</li>
              <li>建议使用端到端加密的传输服务</li>
              <li>传输完成后及时删除分享记录</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
