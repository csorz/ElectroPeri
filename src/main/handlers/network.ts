import { BrowserWindow, ipcMain } from 'electron'
import os from 'node:os'
import net from 'node:net'

type NetInterfaceItem = {
  name: string
  address: string
  family: 'IPv4' | 'IPv6'
  mac: string
  internal: boolean
  cidr?: string | null
}

let mainWindow: BrowserWindow | null = null
let tcpSocket: net.Socket | null = null
let echoServer: net.Server | null = null

function toInterfaceItems(): NetInterfaceItem[] {
  const interfaces = os.networkInterfaces()
  const items: NetInterfaceItem[] = []

  for (const [name, list] of Object.entries(interfaces)) {
    if (!list) continue
    for (const it of list) {
      items.push({
        name,
        address: it.address,
        family: it.family === 'IPv6' ? 'IPv6' : 'IPv4',
        mac: it.mac,
        internal: it.internal,
        cidr: it.cidr
      })
    }
  }
  return items
}

export function setupNetworkHandlers(): void {
  ipcMain.handle('network:listInterfaces', () => {
    return toInterfaceItems()
  })

  ipcMain.handle('network:tcpConnect', async (event, host: string, port: number) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (tcpSocket) {
      tcpSocket.removeAllListeners()
      tcpSocket.destroy()
      tcpSocket = null
    }

    tcpSocket = new net.Socket()

    tcpSocket.on('data', (buf) => {
      mainWindow?.webContents.send('network:tcpData', buf.toString('utf8'))
    })

    tcpSocket.on('error', (err) => {
      mainWindow?.webContents.send('network:tcpError', err.message)
    })

    tcpSocket.on('close', () => {
      mainWindow?.webContents.send('network:tcpClosed')
    })

    await new Promise<void>((resolve, reject) => {
      tcpSocket!.connect(port, host, () => resolve())
      tcpSocket!.once('error', reject)
    })

    return { success: true }
  })

  ipcMain.handle('network:tcpDisconnect', async () => {
    if (!tcpSocket) return { success: true }
    await new Promise<void>((resolve) => {
      tcpSocket!.end(() => resolve())
    })
    tcpSocket.destroy()
    tcpSocket = null
    return { success: true }
  })

  ipcMain.handle('network:tcpSend', async (_event, data: string) => {
    if (!tcpSocket) throw new Error('TCP not connected')
    await new Promise<void>((resolve, reject) => {
      tcpSocket!.write(data, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    return { success: true }
  })

  ipcMain.handle('network:startEchoServer', async (event, port: number) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (echoServer) {
      await new Promise<void>((resolve) => echoServer!.close(() => resolve()))
      echoServer = null
    }

    echoServer = net.createServer((socket) => {
      socket.on('data', (buf) => {
        // echo back + notify renderer
        const text = buf.toString('utf8')
        mainWindow?.webContents.send('network:echoData', text)
        socket.write(buf)
      })
      socket.on('error', (err) => {
        mainWindow?.webContents.send('network:echoError', err.message)
      })
    })

    await new Promise<void>((resolve, reject) => {
      echoServer!.once('error', reject)
      echoServer!.listen(port, '127.0.0.1', () => resolve())
    })

    return { success: true }
  })

  ipcMain.handle('network:stopEchoServer', async () => {
    if (!echoServer) return { success: true }
    await new Promise<void>((resolve) => echoServer!.close(() => resolve()))
    echoServer = null
    return { success: true }
  })
}

