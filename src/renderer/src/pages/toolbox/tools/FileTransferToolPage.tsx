import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface TransferFile {
  id: string
  name: string
  size: number
  sizeText: string
}

interface TransferResult {
  success: boolean
  code?: string
  port?: number
  files?: TransferFile[]
  expiresIn?: number
  error?: string
}

export default function FileTransferToolPage() {
  const [files, setFiles] = useState<File[]>([])
  const [transfer, setTransfer] = useState<TransferResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [localIps, setLocalIps] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  useEffect(() => {
    // 获取本机 IP
    window.api.fileTransfer.getLocalIp().then(setLocalIps).catch(console.error)

    // 监听过期事件
    window.api.fileTransfer.onExpired((code) => {
      if (transfer?.code === code) {
        setTransfer(null)
        setCountdown(null)
      }
    })
  }, [transfer?.code])

  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    setTransfer(null)
  }

  const handleStartTransfer = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      const filePaths = files.map(f => (f as any).path).filter(Boolean)
      if (filePaths.length === 0) {
        alert('请通过文件选择器选择文件')
        setUploading(false)
        return
      }

      const result = await window.api.fileTransfer.create(filePaths)
      if (result.success && result.code && result.port) {
        setTransfer(result)
        setCountdown(result.expiresIn || 300)
      } else {
        alert(result.error || '创建传输失败')
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '创建传输失败')
    } finally {
      setUploading(false)
    }
  }

  const handleStopTransfer = async () => {
    if (!transfer || !transfer.code) return
    await window.api.fileTransfer.close(transfer.code)
    setTransfer(null)
    setCountdown(null)
  }

  const handleClear = () => {
    setFiles([])
    setTransfer(null)
    setCountdown(null)
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

  const getTransferUrl = () => {
    if (!transfer || localIps.length === 0) return ''
    return `http://${localIps[0]}:${transfer.port}`
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
        <p className="page-sub">创建本地 HTTP 服务器，局域网内快速传输文件</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">选择文件</div>
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
              onClick={handleStartTransfer}
              disabled={uploading || files.length === 0 || transfer !== null}
            >
              {uploading ? '创建中...' : '开始传输'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              清除
            </button>
          </div>
        </div>

        {transfer && (
          <div className="tool-block">
            <div className="tool-block-title">
              传输信息
              {countdown !== null && (
                <span style={{ float: 'right', color: countdown < 60 ? '#f44336' : '#888', fontSize: 12 }}>
                  剩余 {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
            <div className="tool-result">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#4fc3f7', letterSpacing: 8 }}>
                  {transfer.code}
                </div>
                <div style={{ color: '#888', marginTop: 4 }}>传输码</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong>访问地址：</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    className="tool-input"
                    value={getTransferUrl()}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(getTransferUrl())}>
                    复制
                  </button>
                </div>
              </div>

              <div>
                <strong>文件列表：</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {transfer.files && transfer.files.map((file) => (
                    <li key={file.id}>{file.name} ({file.sizeText})</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="tool-actions">
              <button type="button" className="btn btn-danger" onClick={handleStopTransfer}>
                停止传输
              </button>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <ol style={{ paddingLeft: '20px' }}>
              <li>选择要传输的文件</li>
              <li>点击"开始传输"创建本地 HTTP 服务器</li>
              <li>将访问地址或传输码分享给接收方</li>
              <li>接收方在浏览器中打开地址，即可下载文件</li>
            </ol>
            <p style={{ marginTop: 12, color: '#888' }}>
              💡 本机 IP: {localIps.length > 0 ? localIps.join(', ') : '获取中...'}
            </p>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">安全提示</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>仅在同一局域网内可访问</li>
              <li>传输码有效期 5 分钟</li>
              <li>不要分享敏感或私密文件</li>
              <li>传输完成后请及时关闭服务</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
