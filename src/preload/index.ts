import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Serial Port API
const serialApi = {
  list: () => ipcRenderer.invoke('serial:list'),
  open: (path: string, baudRate: number, dataBits = 8, stopBits = 1, parity = 'none') =>
    ipcRenderer.invoke('serial:open', path, baudRate, dataBits, stopBits, parity),
  close: (path?: string) => ipcRenderer.invoke('serial:close', path),
  write: (path: string, data: string, format?: 'text' | 'hex') => ipcRenderer.invoke('serial:write', path, data, format),
  isOpen: (path: string) => ipcRenderer.invoke('serial:isOpen', path),
  getOpenPorts: () => ipcRenderer.invoke('serial:getOpenPorts'),
  onData: (callback: (path: string, data: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, { path, data }: { path: string; data: string }) => callback(path, data)
    ipcRenderer.on('serial:data', handler)
    return () => ipcRenderer.removeListener('serial:data', handler)
  },
  onError: (callback: (path: string, error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, { path, error }: { path: string; error: string }) => callback(path, error)
    ipcRenderer.on('serial:error', handler)
    return () => ipcRenderer.removeListener('serial:error', handler)
  },
  onClosed: (callback: (path: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, { path }: { path: string }) => callback(path)
    ipcRenderer.on('serial:closed', handler)
    return () => ipcRenderer.removeListener('serial:closed', handler)
  }
}

// USB API
const usbApi = {
  check: () => ipcRenderer.invoke('usb:check'),
  list: () => ipcRenderer.invoke('usb:list'),
  open: (vendorId: number, productId: number) =>
    ipcRenderer.invoke('usb:open', vendorId, productId),
  close: () => ipcRenderer.invoke('usb:close'),
  write: (endpointNumber: number, data: string) =>
    ipcRenderer.invoke('usb:write', endpointNumber, data),
  read: (endpointNumber: number, length?: number) =>
    ipcRenderer.invoke('usb:read', endpointNumber, length),
  controlTransfer: (setup: {
    requestType: 'standard' | 'class' | 'vendor'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
    data?: string
  }) => ipcRenderer.invoke('usb:controlTransfer', setup),
  onData: (callback: (data: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('usb:data', handler)
    return () => ipcRenderer.removeListener('usb:data', handler)
  }
}

// Bluetooth API
const bluetoothApi = {
  check: () => ipcRenderer.invoke('bluetooth:check'),
  scan: () => ipcRenderer.invoke('bluetooth:scan'),
  stopScan: () => ipcRenderer.invoke('bluetooth:stopScan'),
  connect: (deviceId: string) => ipcRenderer.invoke('bluetooth:connect', deviceId),
  disconnect: () => ipcRenderer.invoke('bluetooth:disconnect'),
  write: (data: string) => ipcRenderer.invoke('bluetooth:write', data),
  discoverServices: (serviceUuid: string) =>
    ipcRenderer.invoke('bluetooth:discoverServices', serviceUuid),
  onData: (callback: (data: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('bluetooth:data', handler)
    return () => ipcRenderer.removeListener('bluetooth:data', handler)
  }
}

// Network API
const networkApi = {
  listInterfaces: () => ipcRenderer.invoke('network:listInterfaces'),
  tcpConnect: (host: string, port: number) => ipcRenderer.invoke('network:tcpConnect', host, port),
  tcpDisconnect: () => ipcRenderer.invoke('network:tcpDisconnect'),
  tcpSend: (data: string) => ipcRenderer.invoke('network:tcpSend', data),
  startEchoServer: (port: number) => ipcRenderer.invoke('network:startEchoServer', port),
  stopEchoServer: () => ipcRenderer.invoke('network:stopEchoServer'),
  onTcpData: (callback: (data: string) => void) => {
    ipcRenderer.on('network:tcpData', (_event, data) => callback(data))
  },
  onTcpError: (callback: (error: string) => void) => {
    ipcRenderer.on('network:tcpError', (_event, error) => callback(error))
  },
  onTcpClosed: (callback: () => void) => {
    ipcRenderer.on('network:tcpClosed', () => callback())
  },
  onEchoData: (callback: (data: string) => void) => {
    ipcRenderer.on('network:echoData', (_event, data) => callback(data))
  },
  onEchoError: (callback: (error: string) => void) => {
    ipcRenderer.on('network:echoError', (_event, error) => callback(error))
  }
}

// HID API
const hidApi = {
  check: () => ipcRenderer.invoke('hid:check'),
  list: () => ipcRenderer.invoke('hid:list'),
  open: (vendorId: number, productId: number) => ipcRenderer.invoke('hid:open', vendorId, productId),
  close: () => ipcRenderer.invoke('hid:close'),
  send: (reportId: number, data: string) => ipcRenderer.invoke('hid:send', reportId, data),
  onData: (callback: (data: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('hid:data', handler)
    return () => ipcRenderer.removeListener('hid:data', handler)
  },
  onError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    ipcRenderer.on('hid:error', handler)
    return () => ipcRenderer.removeListener('hid:error', handler)
  },
  onClosed: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('hid:closed', handler)
    return () => ipcRenderer.removeListener('hid:closed', handler)
  }
}

// P1 Embedded APIs
const gpioApi = {
  open: (pin: number, direction: 'in' | 'out') => ipcRenderer.invoke('gpio:open', pin, direction),
  close: () => ipcRenderer.invoke('gpio:close'),
  read: () => ipcRenderer.invoke('gpio:read'),
  write: (value: 0 | 1) => ipcRenderer.invoke('gpio:write', value),
  watch: (edge: 'none' | 'rising' | 'falling' | 'both') => ipcRenderer.invoke('gpio:watch', edge),
  onData: (callback: (value: number) => void) => {
    ipcRenderer.on('gpio:data', (_event, value) => callback(value))
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('gpio:error', (_event, error) => callback(error))
  },
  onClosed: (callback: () => void) => {
    ipcRenderer.on('gpio:closed', () => callback())
  }
}

const i2cApi = {
  scan: (bus: number) => ipcRenderer.invoke('i2c:scan', bus),
  open: (bus: number) => ipcRenderer.invoke('i2c:open', bus),
  close: () => ipcRenderer.invoke('i2c:close'),
  write: (addr: number, hex: string) => ipcRenderer.invoke('i2c:write', addr, hex),
  read: (addr: number, length: number) => ipcRenderer.invoke('i2c:read', addr, length)
}

const spiApi = {
  open: (bus: number, cs: number) => ipcRenderer.invoke('spi:open', bus, cs),
  close: () => ipcRenderer.invoke('spi:close'),
  transfer: (hexTx: string, rxLength: number, speedHz?: number, mode?: 0 | 1 | 2 | 3) =>
    ipcRenderer.invoke('spi:transfer', hexTx, rxLength, speedHz, mode)
}

const onewireApi = {
  list: () => ipcRenderer.invoke('onewire:list'),
  read: (sensorId: string) => ipcRenderer.invoke('onewire:read', sensorId)
}

// P2 System APIs
const systemApi = {
  basic: () => ipcRenderer.invoke('system:basic')
}

const storageApi = {
  fs: () => ipcRenderer.invoke('storage:fs')
}

const displayApi = {
  info: () => ipcRenderer.invoke('display:info')
}

const powerApi = {
  snapshot: () => ipcRenderer.invoke('power:snapshot')
}

const processApi = {
  list: () => ipcRenderer.invoke('process:list'),
  load: () => ipcRenderer.invoke('process:load')
}

const printerApi = {
  list: () => ipcRenderer.invoke('printer:list')
}

const mediaApi = {
  devices: () => ipcRenderer.invoke('media:devices')
}

const screenshotApi = {
  getSources: () => ipcRenderer.invoke('screenshot:getSources'),
  startCapture: (sourceId: string) => ipcRenderer.invoke('screenshot:startCapture', sourceId),
  cropRegion: (args: { sourceId: string; x: number; y: number; width: number; height: number }) =>
    ipcRenderer.invoke('screenshot:cropRegion', args),
  save: (args: { dataURL: string; defaultName: string }) =>
    ipcRenderer.invoke('screenshot:save', args),
  onRegionSelected: (callback: (region: { x: number; y: number; width: number; height: number }) => void) => {
    const listener = (_event: any, payload: any) => callback(payload)
    ipcRenderer.on('screenshot:regionSelected', listener)
    return () => ipcRenderer.removeListener('screenshot:regionSelected', listener)
  },
  onCaptureCancelled: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('screenshot:captureCancelled', listener)
    return () => ipcRenderer.removeListener('screenshot:captureCancelled', listener)
  }
}

const mixerApi = {
  getSources: () => ipcRenderer.invoke('mixer:getSources'),
  selectVideo: () => ipcRenderer.invoke('mixer:selectVideo'),
  saveRecording: (args: { defaultName: string }) =>
    ipcRenderer.invoke('mixer:saveRecording', args),
  writeFile: (args: { path: string; data: number[] }) =>
    ipcRenderer.invoke('mixer:writeFile', args)
}

const eventsApi = {
  onHotplug: (callback: (event: { type: string; message: string; ts: number }) => void) => {
    const listener = (_event: any, payload: any) => callback(payload)
    ipcRenderer.on('events:hotplug', listener)
    return () => ipcRenderer.removeListener('events:hotplug', listener)
  }
}

// Code Runner API
const codeRunnerApi = {
  runJs: (code: string, timeout?: number) => ipcRenderer.invoke('code:runJs', code, timeout),
  runPython: (code: string, timeout?: number) => ipcRenderer.invoke('code:runPython', code, timeout),
  runGo: (code: string, timeout?: number) => ipcRenderer.invoke('code:runGo', code, timeout),
  runJava: (code: string, timeout?: number) => ipcRenderer.invoke('code:runJava', code, timeout),
  runRust: (code: string, timeout?: number) => ipcRenderer.invoke('code:runRust', code, timeout)
}

// DNS API
const dnsApi = {
  query: (domain: string, type: string) => ipcRenderer.invoke('dns:query', domain, type),
  queryAll: (domain: string) => ipcRenderer.invoke('dns:queryAll', domain),
  reverse: (ip: string) => ipcRenderer.invoke('dns:reverse', ip),
  getServers: () => ipcRenderer.invoke('dns:getServers')
}

// Meta Checker API
const metaApi = {
  check: (url: string) => ipcRenderer.invoke('meta:check', url)
}

// File Transfer API
const fileTransferApi = {
  create: (files: string[]) => ipcRenderer.invoke('transfer:create', files),
  status: (code: string) => ipcRenderer.invoke('transfer:status', code),
  close: (code: string) => ipcRenderer.invoke('transfer:close', code),
  getLocalIp: () => ipcRenderer.invoke('transfer:getLocalIp'),
  onExpired: (callback: (code: string) => void) => {
    ipcRenderer.on('transfer:expired', (_event, code) => callback(code))
  }
}

// MQTT API
const mqttApi = {
  connect: (options: {
    url: string
    port?: number
    username?: string
    password?: string
    clientId?: string
    clean?: boolean
    keepalive?: number
  }) => ipcRenderer.invoke('mqtt:connect', options),
  disconnect: () => ipcRenderer.invoke('mqtt:disconnect'),
  subscribe: (topic: string, qos?: 0 | 1 | 2) => ipcRenderer.invoke('mqtt:subscribe', topic, qos),
  unsubscribe: (topic: string) => ipcRenderer.invoke('mqtt:unsubscribe', topic),
  publish: (topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) =>
    ipcRenderer.invoke('mqtt:publish', topic, message, qos, retain),
  onMessage: (callback: (topic: string, message: string) => void) => {
    const listener = (_event: any, data: { topic: string; message: string }) => callback(data.topic, data.message)
    ipcRenderer.on('mqtt:message', listener)
  },
  onConnect: (callback: () => void) => {
    ipcRenderer.on('mqtt:connected', () => callback())
  },
  onDisconnect: (callback: () => void) => {
    ipcRenderer.on('mqtt:disconnected', () => callback())
  },
  onError: (callback: (error: string) => void) => {
    const listener = (_event: any, data: { error: string }) => callback(data.error)
    ipcRenderer.on('mqtt:error', listener)
  }
}

// Startup Log API
const startupLogApi = {
  path: () => ipcRenderer.invoke('startup-log:path'),
  list: () => ipcRenderer.invoke('startup-log:list'),
  read: (filename: string) => ipcRenderer.invoke('startup-log:read', filename),
  latest: () => ipcRenderer.invoke('startup-log:latest')
}

// Custom APIs for renderer
const api = {
  serial: serialApi,
  usb: usbApi,
  bluetooth: bluetoothApi,
  network: networkApi,
  hid: hidApi,
  gpio: gpioApi,
  i2c: i2cApi,
  spi: spiApi,
  onewire: onewireApi,
  system: systemApi,
  storage: storageApi,
  display: displayApi,
  power: powerApi,
  process: processApi,
  printer: printerApi,
  media: mediaApi,
  screenshot: screenshotApi,
  mixer: mixerApi,
  events: eventsApi,
  codeRunner: codeRunnerApi,
  dns: dnsApi,
  meta: metaApi,
  fileTransfer: fileTransferApi,
  mqtt: mqttApi,
  startupLog: startupLogApi
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
