import { BrowserWindow, ipcMain } from 'electron'
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

let mainWindow: BrowserWindow | null = null
let tsharkProcess: ReturnType<typeof spawn> | null = null
let isCapturing = false

// Wireshark 可能的安装路径
const WIRESHARK_PATHS = [
  'D:\\csApps\\Wireshark',
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Wireshark'),
  'C:\\Program Files\\Wireshark',
  'C:\\Program Files (x86)\\Wireshark'
]

function findTshark(): string | null {
  for (const dir of WIRESHARK_PATHS) {
    const exe = path.join(dir, 'tshark.exe')
    if (fs.existsSync(exe)) return exe
  }
  // 尝试 PATH
  return 'tshark'
}

function getInterfaces(): { index: number; name: string; description: string; mac: string | null }[] {
  const tsharkPath = findTshark() || 'tshark'
  try {
    const result = spawnSync(tsharkPath, ['-D'], { encoding: 'utf-8', timeout: 10000 })
    if (result.error) return []

    const lines = (result.stdout as string).trim().split(/\r?\n/)
    const devices: { index: number; name: string; description: string; mac: string | null }[] = []

    for (const line of lines) {
      const match = line.match(/^(\d+)\.\s+(.+?)(?:\s+\((.+)\))?$/)
      if (match) {
        const name = match[2].trim()
        const description = match[3] || match[2].trim()
        if (name === 'etwdump' || description.includes('Event Tracing') || description.includes('loopback traffic capture')) {
          continue
        }
        devices.push({ index: parseInt(match[1]), name, description, mac: null })
      }
    }

    // 获取 MAC 地址 (Windows)
    try {
      const macResult = spawnSync('powershell', [
        '-Command',
        '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress | ConvertTo-Json'
      ], { encoding: 'utf-8', timeout: 10000 })

      if (macResult.stdout) {
        let adapters: any[] = JSON.parse(macResult.stdout as string)
        if (!Array.isArray(adapters)) adapters = [adapters]
        const macMap = new Map<string, string>()
        for (const a of adapters) {
          if (a.MacAddress) {
            const mac = a.MacAddress.replace(/-/g, ':').toUpperCase()
            if (a.Name) macMap.set(a.Name, mac)
            if (a.InterfaceDescription) macMap.set(a.InterfaceDescription, mac)
          }
        }
        for (const d of devices) {
          if (macMap.has(d.description)) {
            d.mac = macMap.get(d.description)!
          } else {
            for (const [desc, mac] of macMap) {
              if (d.description.includes(desc) || desc.includes(d.description)) {
                d.mac = mac
                break
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return devices
  } catch {
    return []
  }
}

// 工业协议端口映射
const INDUSTRIAL_PORTS: Record<number, string> = {
  502: 'Modbus TCP',
  503: 'Modbus UDP',
  44818: 'Ethernet/IP',
  2222: 'Ethernet/IP (Explicit)',
  34960: 'PROFINET RT',
  34961: 'PROFINET RT',
  34962: 'PROFINET RT',
  34963: 'PROFINET RT',
  34964: 'PROFINET RT',
  4840: 'OPC UA',
  102: 'S7Comm (Siemens)',
  2000: 'Modbus Plus',
  789: 'CC-Link',
  5000: 'BACnet',
  5001: 'BACnet',
  1883: 'MQTT',
  8883: 'MQTT TLS'
}

function detectIndustrialProtocol(port: number): string | null {
  return INDUSTRIAL_PORTS[port] || null
}

// 十六进制字符串转字节数组
function hexToBytes(hex: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  return bytes
}

function readUInt16BE(bytes: number[], offset: number): number {
  return ((bytes[offset] << 8) | bytes[offset + 1]) >>> 0
}

function readUInt32LE(bytes: number[], offset: number): number {
  return (
    ((bytes[offset]) |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)) >>> 0
  )
}

function parseModbusTCP(hex: string): Record<string, any> {
  const data = hexToBytes(hex)
  if (data.length < 8) return { valid: false, error: 'Data too short' }

  try {
    const transactionId = readUInt16BE(data, 0)
    const protocolId = readUInt16BE(data, 2)
    const length = readUInt16BE(data, 4)
    const unitId = data[6]
    const functionCode = data[7]

    const functionNames: Record<number, string> = {
      1: 'Read Coils', 2: 'Read Discrete Inputs', 3: 'Read Holding Registers',
      4: 'Read Input Registers', 5: 'Write Single Coil', 6: 'Write Single Register',
      7: 'Read Exception Status', 15: 'Write Multiple Coils', 16: 'Write Multiple Registers',
      22: 'Mask Write Register', 23: 'Read/Write Multiple Registers', 43: 'Read Device Identification'
    }

    const result: Record<string, any> = {
      valid: true,
      protocol: 'Modbus TCP',
      transactionId,
      protocolId,
      length,
      unitId,
      functionCode,
      functionName: functionNames[functionCode] || `Unknown (${functionCode})`,
      direction: functionCode <= 4 ? 'Request' : 'Response'
    }

    if (data.length > 8) {
      const payload = data.slice(8)
      switch (functionCode) {
        case 3: case 4:
          if (payload.length >= 4) {
            result.startAddress = readUInt16BE(payload, 0)
            result.quantity = readUInt16BE(payload, 2)
            result.description = `Read ${result.quantity} registers from address ${result.startAddress}`
          }
          break
        case 6:
          if (payload.length >= 4) {
            result.address = readUInt16BE(payload, 0)
            result.value = readUInt16BE(payload, 2)
            result.description = `Write value ${result.value} to address ${result.address}`
          }
          break
        case 16:
          if (payload.length >= 4) {
            result.startAddress = readUInt16BE(payload, 0)
            result.quantity = readUInt16BE(payload, 2)
            result.description = `Write ${result.quantity} registers to address ${result.startAddress}`
          }
          break
      }
    }
    return result
  } catch {
    return { valid: false, error: 'Parse error' }
  }
}

function parseEthernetIP(hex: string): Record<string, any> {
  const data = hexToBytes(hex)
  if (data.length < 24) return { valid: false, error: 'Data too short' }

  try {
    const command = data[0] | (data[1] << 8)
    const length = data[2] | (data[3] << 8)
    const sessionHandle = readUInt32LE(data, 4)
    const status = readUInt32LE(data, 8)
    const senderContext = data.slice(12, 20).map(b => b.toString(16).padStart(2, '0')).join('')
    const options = readUInt32LE(data, 20)

    const commandNames: Record<number, string> = {
      0x0001: 'NOP', 0x0004: 'List Services', 0x0064: 'List Identity',
      0x0065: 'List Interfaces', 0x0066: 'Register Session',
      0x0067: 'Unregister Session', 0x006F: 'Send RR Data',
      0x0070: 'Send Unit Data', 0x0072: 'Indicate Status', 0x0073: 'Initiate Keep Alive'
    }

    const result: Record<string, any> = {
      valid: true,
      protocol: 'Ethernet/IP',
      command,
      commandName: commandNames[command] || `Unknown (0x${command.toString(16)})`,
      length,
      sessionHandle,
      status,
      senderContext,
      options
    }

    if (data.length > 24) {
      const cipData = data.slice(24)
      if (cipData.length >= 6) {
        result.interfaceHandle = readUInt32LE(cipData, 0)
        result.timeout = cipData[4] | (cipData[5] << 8)
        result.hasCIP = true
      }
    }
    return result
  } catch {
    return { valid: false, error: 'Parse error' }
  }
}

function parseS7Comm(hex: string): Record<string, any> {
  const data = hexToBytes(hex)
  if (data.length < 10) return { valid: false, error: 'Data too short' }

  try {
    const tpktVersion = data[0]
    if (tpktVersion !== 3) return { valid: false, error: 'Not a valid S7Comm packet' }

    const tpktLength = readUInt16BE(data, 2)
    const isoTpduCode = data[5]

    const result: Record<string, any> = {
      valid: true,
      protocol: 'S7Comm (Siemens)',
      tpktLength,
      isoTpduCode
    }

    if (data.length > 7) {
      const s7Data = data.slice(7)
      if (s7Data.length >= 4) {
        result.pduType = s7Data[0]
        result.reserved = s7Data[1]
        result.pduReference = readUInt16BE(s7Data, 2)

        const pduNames: Record<number, string> = {
          0x01: 'Job Request', 0x02: 'Ack', 0x03: 'Ack Data', 0x07: 'User Data'
        }
        result.pduName = pduNames[result.pduType] || `Unknown (0x${result.pduType.toString(16)})`
      }
    }
    return result
  } catch {
    return { valid: false, error: 'Parse error' }
  }
}

function parseMQTT(hex: string): Record<string, any> {
  const data = hexToBytes(hex)
  if (data.length < 2) return { valid: false, error: 'Data too short' }

  try {
    const messageType = (data[0] >> 4) & 0x0F
    const flags = data[0] & 0x0F
    const remainingLength = data[1]

    const typeNames: Record<number, string> = {
      1: 'CONNECT', 2: 'CONNACK', 3: 'PUBLISH', 4: 'PUBACK',
      5: 'PUBREC', 6: 'PUBREL', 7: 'PUBCOMP', 8: 'SUBSCRIBE',
      9: 'SUBACK', 10: 'UNSUBSCRIBE', 11: 'UNSUBACK',
      12: 'PINGREQ', 13: 'PINGRESP', 14: 'DISCONNECT', 15: 'AUTH'
    }

    const result: Record<string, any> = {
      valid: true,
      protocol: 'MQTT',
      messageType,
      messageName: typeNames[messageType] || `Unknown (${messageType})`,
      flags,
      remainingLength
    }

    if (messageType === 3 && data.length > 4) {
      const topicLength = readUInt16BE(data, 2)
      if (data.length >= 4 + topicLength) {
        result.topic = Buffer.from(data.slice(4, 4 + topicLength)).toString('utf8')
      }
    }
    return result
  } catch {
    return { valid: false, error: 'Parse error' }
  }
}

function parseApplicationLayer(srcPort: number, dstPort: number, payloadHex: string): Record<string, any> | null {
  const srcProtocol = detectIndustrialProtocol(srcPort)
  const dstProtocol = detectIndustrialProtocol(dstPort)
  const protocol = srcProtocol || dstProtocol
  const port = srcProtocol ? srcPort : dstPort

  if (!protocol || !payloadHex || payloadHex.length === 0) {
    return null
  }

  let parsed: Record<string, any> | null = null

  switch (port) {
    case 502: case 503:
      parsed = parseModbusTCP(payloadHex)
      break
    case 44818: case 2222:
      parsed = parseEthernetIP(payloadHex)
      break
    case 102:
      parsed = parseS7Comm(payloadHex)
      break
    case 1883: case 8883:
      parsed = parseMQTT(payloadHex)
      break
    default:
      parsed = { valid: true, protocol, raw: payloadHex }
  }

  return {
    isIndustrial: true,
    protocol,
    port,
    parsed
  }
}

// EtherType 映射
const ETHER_TYPES: Record<string, string> = {
  '0x0800': 'IPv4', '0x0806': 'ARP', '0x0835': 'RARP', '0x86dd': 'IPv6', '0x88cc': 'LLDP'
}

// IP 协议映射
const IP_PROTOCOLS: Record<string, string> = {
  '1': 'ICMP', '6': 'TCP', '17': 'UDP', '47': 'GRE', '89': 'OSPF'
}

function parseTsharkLine(line: string) {
  const fields = line.split('|')
  if (fields.length < 4) return null

  const [timeEpoch, srcMac, dstMac, ethType, srcIp, dstIp, ipProto, tcpSrcPort, tcpDstPort, _tcpFlags, udpSrcPort, udpDstPort, appData] = fields

  const packet: any = {
    timestamp: parseFloat(timeEpoch) * 1000 || Date.now(),
    ethernet: {
      srcMac: srcMac || '00:00:00:00:00:00',
      dstMac: dstMac || '00:00:00:00:00:00',
      etherType: ETHER_TYPES[(ethType || '').toLowerCase()] || ethType || 'Unknown'
    }
  }

  if (srcIp || dstIp) {
    packet.ip = {
      srcIp: srcIp || '',
      dstIp: dstIp || '',
      protocol: IP_PROTOCOLS[ipProto] || (ipProto ? `Protocol(${ipProto})` : 'Unknown')
    }
  }

  if (tcpSrcPort || tcpDstPort) {
    packet.transport = {
      srcPort: parseInt(tcpSrcPort) || 0,
      dstPort: parseInt(tcpDstPort) || 0,
      protocol: 'TCP'
    }
  } else if (udpSrcPort || udpDstPort) {
    packet.transport = {
      srcPort: parseInt(udpSrcPort) || 0,
      dstPort: parseInt(udpDstPort) || 0,
      protocol: 'UDP'
    }
  }

  if (appData && appData.length > 0) {
    packet.payload = appData.toUpperCase()
    packet.payloadLength = Math.ceil(appData.length / 2)
  }

  // 工业协议解析
  if (packet.transport && appData && appData.length > 0) {
    const appLayer = parseApplicationLayer(
      packet.transport.srcPort,
      packet.transport.dstPort,
      appData
    )
    if (appLayer) {
      packet.application = appLayer
    }
  }

  return packet
}

export function setupMacScanHandlers(): void {
  // 检查 tshark 是否可用
  ipcMain.handle('mac-scan:check', async () => {
    const tsharkPath = findTshark() || 'tshark'
    try {
      const result = spawnSync(tsharkPath, ['--version'], { encoding: 'utf-8', timeout: 5000 })
      if (result.error) {
        return { available: false, error: '未找到 tshark，请安装 Wireshark: https://www.wireshark.org/' }
      }
      const version = (result.stdout as string).split('\n')[0] || ''
      return { available: true, version, path: tsharkPath }
    } catch {
      return { available: false, error: '未找到 tshark，请安装 Wireshark: https://www.wireshark.org/' }
    }
  })

  // 列出网络接口
  ipcMain.handle('mac-scan:listInterfaces', async () => {
    return getInterfaces()
  })

  // 开始捕获
  ipcMain.handle('mac-scan:start', async (event, deviceIndex: number, filter?: string) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender)

    if (isCapturing) {
      return { success: true, message: 'already capturing' }
    }

    const tsharkPath = findTshark() || 'tshark'

    const args = [
      '-i', String(deviceIndex),
      '-l',
      '-T', 'fields',
      '-e', 'frame.time_epoch',
      '-e', 'eth.src',
      '-e', 'eth.dst',
      '-e', 'eth.type',
      '-e', 'ip.src',
      '-e', 'ip.dst',
      '-e', 'ip.proto',
      '-e', 'tcp.srcport',
      '-e', 'tcp.dstport',
      '-e', 'tcp.flags',
      '-e', 'udp.srcport',
      '-e', 'udp.dstport',
      '-e', 'data',
      '-E', 'separator=|',
      '-E', 'quote=n'
    ]

    if (filter && filter.trim()) {
      args.push('-Y', filter.trim())
    }

    const proc = spawn(tsharkPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    tsharkProcess = proc
    isCapturing = true

    proc.stdout.on('data', (data: Buffer) => {
      if (!isCapturing) return

      const lines = data.toString().trim().split('\n')
      for (const line of lines) {
        if (!line.trim()) continue
        const packet = parseTsharkLine(line)
        if (packet) {
          mainWindow?.webContents.send('mac-scan:data', packet)
        }
      }
    })

    proc.stderr.on('data', (data: Buffer) => {
      const msg = data.toString()
      if (!msg.includes('Capturing on')) {
        mainWindow?.webContents.send('mac-scan:error', msg)
      }
    })

    proc.on('error', (err) => {
      mainWindow?.webContents.send('mac-scan:error', `tshark 启动失败: ${err.message}`)
      isCapturing = false
    })

    proc.on('close', (code) => {
      isCapturing = false
      if (code !== 0 && code !== null) {
        mainWindow?.webContents.send('mac-scan:error', `tshark 退出，代码: ${code}`)
      }
    })

    return { success: true }
  })

  // 停止捕获
  ipcMain.handle('mac-scan:stop', async () => {
    if (!isCapturing) {
      return { success: true, message: 'not capturing' }
    }

    isCapturing = false
    if (tsharkProcess) {
      tsharkProcess.kill('SIGTERM')
      tsharkProcess = null
    }

    return { success: true }
  })
}
