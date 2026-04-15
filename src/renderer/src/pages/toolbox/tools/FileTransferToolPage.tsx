import { useCallback, useState, useRef, useEffect } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

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
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>文件传输</h1>
        <p>File Transfer - 创建本地 HTTP 服务器，局域网内快速传输文件</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>HTTP 服务器</h3>
                <p>在本地创建一个临时的 HTTP 服务器，提供文件下载服务</p>
              </div>
              <div className="feature-card">
                <h3>局域网通信</h3>
                <p>通过本机 IP 地址，同一局域网内的设备可以访问下载</p>
              </div>
              <div className="feature-card">
                <h3>传输码验证</h3>
                <p>生成随机传输码，防止未授权用户访问文件</p>
              </div>
              <div className="feature-card">
                <h3>自动过期</h3>
                <p>设置有效期，超时自动关闭服务器，保证安全</p>
              </div>
            </div>

            <h2>工作流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    发送方                     HTTP服务器                    接收方
       |                          |                          |
       |  ──── 选择文件 ────────> |                          |
       |                          |  [创建HTTP服务]           |
       |                          |  [生成传输码]             |
       |                          |  [绑定端口]               |
       |                          |                          |
       |  <─── 传输码/地址 ────── |                          |
       |                          |                          |
       |  ═════ 分享传输码/地址 ═════════════════════════> |
       |                          |                          |
       |                          |  <─── 请求下载 ───────── |
       |                          |  [验证传输码]             |
       |                          |  [返回文件列表]           |
       |                          |                          |
       |                          |  <─── 下载请求 ───────── |
       |                          |  ──── 文件数据 ─────────> |
       |                          |                          |
       |  ──── 关闭服务 ────────> |                          |
       |                          |  [停止服务]               |
              `}</pre>
            </div>

            <h2>技术要点</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>技术</th>
                    <th>说明</th>
                    <th>优势</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HTTP 协议</td>
                    <td><code>GET /files/{'{id}'}</code></td>
                    <td>无需安装客户端，浏览器即可下载</td>
                  </tr>
                  <tr>
                    <td>随机端口</td>
                    <td>自动选择可用端口</td>
                    <td>避免端口冲突</td>
                  </tr>
                  <tr>
                    <td>传输码验证</td>
                    <td>URL 参数或 Header</td>
                    <td>简单有效的访问控制</td>
                  </tr>
                  <tr>
                    <td>MIME 类型</td>
                    <td><code>Content-Type</code></td>
                    <td>正确的文件类型标识</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>跨设备传输</strong> - 手机、平板、电脑间快速传文件</li>
              <li><strong>临时分享</strong> - 会议现场快速分享文档</li>
              <li><strong>大文件传输</strong> - 无需上传云盘，直接局域网传输</li>
              <li><strong>无网络环境</strong> - 无外网时设备间文件共享</li>
              <li><strong>开发测试</strong> - 快速搭建临时文件服务</li>
            </ul>

            <div className="info-box warning">
              <strong>安全提示</strong>
              <ul>
                <li>仅在同一局域网内可访问</li>
                <li>传输完成后请及时关闭服务</li>
                <li>不要分享敏感或私密文件</li>
                <li>传输码需妥善保管，防止泄露</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>文件传输演示</h2>
            <FileTransferDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

func main() {
    // 设置要共享的目录
    shareDir := "./share"

    // 创建文件服务器
    fs := http.FileServer(http.Dir(shareDir))

    // 添加日志中间件
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("[%s] %s %s", r.Method, r.URL.Path, r.RemoteAddr)
        fs.ServeHTTP(w, r)
    })

    // 启动服务器
    addr := ":8080"
    fmt.Printf("文件服务器启动: http://localhost%s\\n", addr)
    fmt.Printf("共享目录: %s\\n", shareDir)

    if err := http.ListenAndServe(addr, handler); err != nil {
        log.Fatal(err)
    }
}

// 带传输码验证的文件服务器
func secureFileServer(shareDir, code string) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 验证传输码
        queryCode := r.URL.Query().Get("code")
        if queryCode != code {
            http.Error(w, "Invalid transfer code", http.StatusForbidden)
            return
        }

        // 提供文件
        filePath := filepath.Join(shareDir, r.URL.Path)
        http.ServeFile(w, r, filePath)
    })
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`#!/usr/bin/env python3
"""简单的文件共享服务器"""

import http.server
import socketserver
import os
import random
import string
from functools import partial

class FileHandler(http.server.SimpleHTTPRequestHandler):
    """自定义文件处理器"""

    def __init__(self, *args, transfer_code=None, **kwargs):
        self.transfer_code = transfer_code
        super().__init__(*args, **kwargs)

    def do_GET(self):
        # 验证传输码
        code = self.path.split('?code=')[-1] if '?code=' in self.path else ''
        if code != self.transfer_code:
            self.send_error(403, "Invalid transfer code")
            return

        # 移除查询参数
        self.path = self.path.split('?')[0]
        super().do_GET()

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

def generate_code(length=6):
    """生成随机传输码"""
    return ''.join(random.choices(string.digits, k=length))

def get_local_ip():
    """获取本机 IP 地址"""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

if __name__ == "__main__":
    PORT = 8000
    TRANSFER_CODE = generate_code()
    SHARE_DIR = os.getcwd()

    os.chdir(SHARE_DIR)

    handler = partial(FileHandler, transfer_code=TRANSFER_CODE)

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        local_ip = get_local_ip()
        print(f"文件服务器已启动")
        print(f"本机访问: http://localhost:{PORT}?code={TRANSFER_CODE}")
        print(f"局域网访问: http://{local_ip}:{PORT}?code={TRANSFER_CODE}")
        print(f"传输码: {TRANSFER_CODE}")
        print(f"共享目录: {SHARE_DIR}")
        print("按 Ctrl+C 停止服务器")

        httpd.serve_forever()`}</pre>
            </div>

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置
const PORT = 3000;
const TRANSFER_CODE = Math.random().toString().slice(2, 8);
const SHARE_DIR = process.cwd();

// 获取本机 IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

// MIME 类型映射
const mimeTypes = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg'
};

// 创建服务器
const server = http.createServer((req, res) => {
    // 验证传输码
    const url = new URL(req.url, \`http://localhost:\${PORT}\`);
    const code = url.searchParams.get('code');

    if (code !== TRANSFER_CODE) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Invalid transfer code');
        return;
    }

    // 获取文件路径
    let filePath = url.pathname;
    if (filePath === '/') {
        // 返回文件列表
        const files = fs.readdirSync(SHARE_DIR);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(\`<h1>文件列表</h1><ul>\${files.map(f => \`<li><a href="\${f}?code=\${TRANSFER_CODE}">\${f}</a></li>\`).join('')}</ul>\`);
        return;
    }

    filePath = path.join(SHARE_DIR, decodeURIComponent(filePath));

    // 检查文件是否存在
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        res.end('File not found');
        return;
    }

    // 发送文件
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': \`attachment; filename="\${path.basename(filePath)}"\`
    });

    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
    const localIP = getLocalIP();
    console.log(\`文件服务器已启动\`);
    console.log(\`本机访问: http://localhost:\${PORT}?code=\${TRANSFER_CODE}\`);
    console.log(\`局域网访问: http://\${localIP}:\${PORT}?code=\${TRANSFER_CODE}\`);
    console.log(\`传输码: \${TRANSFER_CODE}\`);
    console.log(\`共享目录: \${SHARE_DIR}\`);
});`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 文件传输演示组件
function FileTransferDemo() {
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
    <div className="file-transfer-demo">
      <div className="config-row" style={{ marginBottom: '16px' }}>
        <label>选择文件</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px dashed #ddd',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="step-info" style={{ marginBottom: '16px' }}>
          <h4>已选择 {files.length} 个文件</h4>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="demo-controls" style={{ marginBottom: '16px' }}>
        <button
          onClick={handleStartTransfer}
          disabled={uploading || files.length === 0 || transfer !== null}
        >
          {uploading ? '创建中...' : '开始传输'}
        </button>
        <button onClick={handleClear}>清除</button>
      </div>

      {transfer && (
        <div className="result-box" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4fc3f7', letterSpacing: '8px' }}>
            {transfer.code}
          </div>
          <p className="hint">传输码</p>

          {countdown !== null && (
            <p style={{ color: countdown < 60 ? '#f44336' : '#888', fontSize: '14px' }}>
              剩余时间: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
          )}

          <div style={{ marginTop: '16px' }}>
            <strong>访问地址：</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                value={getTransferUrl()}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              />
              <button onClick={() => onCopy(getTransferUrl())}>复制</button>
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'left' }}>
            <strong>文件列表：</strong>
            <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
              {transfer.files && transfer.files.map((file) => (
                <li key={file.id}>{file.name} ({file.sizeText})</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStopTransfer}
            style={{
              marginTop: '16px',
              background: '#f44336',
              color: '#fff'
            }}
          >
            停止传输
          </button>
        </div>
      )}

      <div className="info-box">
        <strong>使用说明</strong>
        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>选择要传输的文件</li>
          <li>点击"开始传输"创建本地 HTTP 服务器</li>
          <li>将访问地址或传输码分享给接收方</li>
          <li>接收方在浏览器中打开地址，即可下载文件</li>
        </ol>
        <p style={{ marginTop: '12px' }}>本机 IP: {localIps.length > 0 ? localIps.join(', ') : '获取中...'}</p>
      </div>
    </div>
  )
}
