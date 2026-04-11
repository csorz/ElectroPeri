import { BrowserWindow, ipcMain } from 'electron'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

interface TransferFile {
  id: string
  name: string
  size: number
  path: string
  addedAt: number
}

interface TransferServer {
  port: number
  code: string
  files: Map<string, TransferFile>
  server: http.Server | null
}

const transferServers = new Map<string, TransferServer>()

function generateCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export function setupFileTransferHandlers(): void {
  // 创建传输服务器
  ipcMain.handle('transfer:create', async (event, files: string[]) => {
    const code = generateCode()
    const transferFiles = new Map<string, TransferFile>()

    for (const filePath of files) {
      try {
        const stat = fs.statSync(filePath)
        if (stat.isFile()) {
          const id = crypto.randomBytes(8).toString('hex')
          transferFiles.set(id, {
            id,
            name: path.basename(filePath),
            size: stat.size,
            path: filePath,
            addedAt: Date.now()
          })
        }
      } catch {
        // 忽略无法访问的文件
      }
    }

    if (transferFiles.size === 0) {
      return { success: false, error: 'No valid files to transfer' }
    }

    const server = http.createServer((req, res) => {
      // 主页
      if (req.url === '/' || req.url === '') {
        const html = generateFileListPage(code, transferFiles)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
        return
      }

      // 下载文件
      const fileId = req.url?.slice(1)
      if (fileId && transferFiles.has(fileId)) {
        const file = transferFiles.get(fileId)!
        const stat = fs.statSync(file.path)
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': stat.size,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`
        })
        fs.createReadStream(file.path).pipe(res)
        return
      }

      res.writeHead(404)
      res.end('Not Found')
    })

    return new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address()
        if (typeof address === 'object' && address) {
          const port = address.port
          transferServers.set(code, { port, code, files: transferFiles, server })

          // 通知渲染进程
          const win = BrowserWindow.fromWebContents(event.sender)
          if (win) {
            // 5分钟后自动关闭
            setTimeout(() => {
              if (transferServers.has(code)) {
                server.close()
                transferServers.delete(code)
                win.webContents.send('transfer:expired', code)
              }
            }, 5 * 60 * 1000)
          }

          resolve({
            success: true,
            code,
            port,
            files: Array.from(transferFiles.values()).map(f => ({
              id: f.id,
              name: f.name,
              size: f.size,
              sizeText: formatSize(f.size)
            })),
            expiresIn: 300
          })
        } else {
          resolve({ success: false, error: 'Failed to start server' })
        }
      })
    })
  })

  // 获取服务器状态
  ipcMain.handle('transfer:status', (_event, code: string) => {
    const server = transferServers.get(code)
    if (!server) {
      return { success: false, error: 'Transfer not found' }
    }
    return {
      success: true,
      code: server.code,
      port: server.port,
      files: Array.from(server.files.values()).map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        sizeText: formatSize(f.size)
      }))
    }
  })

  // 关闭传输服务器
  ipcMain.handle('transfer:close', (_event, code: string) => {
    const server = transferServers.get(code)
    if (server) {
      server.server?.close()
      transferServers.delete(code)
      return { success: true }
    }
    return { success: false, error: 'Transfer not found' }
  })

  // 获取本机 IP 地址
  ipcMain.handle('transfer:getLocalIp', () => {
    const interfaces = os.networkInterfaces()
    const ips: string[] = []

    for (const [, list] of Object.entries(interfaces)) {
      if (!list) continue
      for (const it of list) {
        if (it.family === 'IPv4' && !it.internal) {
          ips.push(it.address)
        }
      }
    }

    return ips
  })
}

function generateFileListPage(code: string, files: Map<string, TransferFile>): string {
  const fileList = Array.from(files.values())
    .map(f => `
      <tr>
        <td>${f.name}</td>
        <td>${formatSize(f.size)}</td>
        <td><a href="/${f.id}" class="btn">下载</a></td>
      </tr>
    `)
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>文件传输 - ${code}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 20px; margin-bottom: 8px; }
    .code { font-size: 32px; font-weight: bold; color: #4fc3f7; text-align: center; margin: 16px 0; letter-spacing: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .btn { display: inline-block; padding: 6px 16px; background: #4fc3f7; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; }
    .btn:hover { background: #29b6f6; }
    .notice { margin-top: 16px; padding: 12px; background: #e3f2fd; border-radius: 8px; font-size: 13px; color: #1565c0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📁 文件传输</h1>
    <div class="code">${code}</div>
    <table>
      <thead>
        <tr>
          <th>文件名</th>
          <th>大小</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${fileList}
      </tbody>
    </table>
    <div class="notice">
      💡 点击下载按钮保存文件，传输码有效期 5 分钟
    </div>
  </div>
</body>
</html>`
}
