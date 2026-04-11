import { ElectronAPI } from '@electron-toolkit/preload'

interface SerialApi {
  list: () => Promise<Array<{
    path: string
    manufacturer?: string
    serialNumber?: string
    pnpId?: string
    locationId?: string
    vendorId?: string
    productId?: string
  }>>
  open: (path: string, baudRate: number) => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  write: (data: string) => Promise<{ success: boolean }>
  onData: (callback: (data: string) => void) => void
  onError: (callback: (error: string) => void) => void
  onClosed: (callback: () => void) => void
}

interface UsbApi {
  list: () => Promise<Array<{
    deviceAddress: number
    vendorId: number
    productId: number
    manufacturer?: string
    product?: string
    serialNumber?: string
    deviceClass: number
    deviceSubclass: number
    deviceProtocol: number
    interfaces?: Array<{
      interfaceNumber: number
      interfaceClass: number
      interfaceSubclass: number
      interfaceProtocol: number
    }>
  }>>
  open: (vendorId: number, productId: number) => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  write: (endpointNumber: number, data: string) => Promise<{ success: boolean }>
  read: (endpointNumber: number, length?: number) => Promise<string>
  controlTransfer: (setup: {
    requestType: 'standard' | 'class' | 'vendor'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
    data?: string
  }) => Promise<string>
  onData: (callback: (data: string) => void) => void
}

interface BluetoothApi {
  scan: () => Promise<Array<{
    id: string
    name: string
    address: string
    rssi?: number
    deviceClass?: number
    connected: boolean
    services?: string[]
  }>>
  stopScan: () => Promise<{ success: boolean }>
  connect: (deviceId: string) => Promise<{ success: boolean }>
  disconnect: () => Promise<{ success: boolean }>
  write: (data: string) => Promise<{ success: boolean }>
  discoverServices: (serviceUuid: string) => Promise<string[]>
  onData: (callback: (data: string) => void) => void
}

interface NetworkApi {
  listInterfaces: () => Promise<Array<{
    name: string
    address: string
    family: 'IPv4' | 'IPv6'
    mac: string
    internal: boolean
    cidr?: string | null
  }>>
  tcpConnect: (host: string, port: number) => Promise<{ success: boolean }>
  tcpDisconnect: () => Promise<{ success: boolean }>
  tcpSend: (data: string) => Promise<{ success: boolean }>
  startEchoServer: (port: number) => Promise<{ success: boolean }>
  stopEchoServer: () => Promise<{ success: boolean }>
  onTcpData: (callback: (data: string) => void) => void
  onTcpError: (callback: (error: string) => void) => void
  onTcpClosed: (callback: () => void) => void
  onEchoData: (callback: (data: string) => void) => void
  onEchoError: (callback: (error: string) => void) => void
}

interface HidApi {
  list: () => Promise<Array<{
    vendorId: number
    productId: number
    path?: string
    serialNumber?: string
    product?: string
    manufacturer?: string
    usage?: number
    usagePage?: number
  }>>
  open: (vendorId: number, productId: number) => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  send: (reportId: number, data: string) => Promise<{ success: boolean }>
  onData: (callback: (data: string) => void) => void
  onError: (callback: (error: string) => void) => void
  onClosed: (callback: () => void) => void
}

interface GpioApi {
  open: (pin: number, direction: 'in' | 'out') => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  read: () => Promise<number>
  write: (value: 0 | 1) => Promise<{ success: boolean }>
  watch: (edge: 'none' | 'rising' | 'falling' | 'both') => Promise<{ success: boolean }>
  onData: (callback: (value: number) => void) => void
  onError: (callback: (error: string) => void) => void
  onClosed: (callback: () => void) => void
}

interface I2cApi {
  scan: (bus: number) => Promise<number[]>
  open: (bus: number) => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  write: (addr: number, hex: string) => Promise<{ success: boolean }>
  read: (addr: number, length: number) => Promise<string>
}

interface SpiApi {
  open: (bus: number, cs: number) => Promise<{ success: boolean }>
  close: () => Promise<{ success: boolean }>
  transfer: (hexTx: string, rxLength: number, speedHz?: number, mode?: 0 | 1 | 2 | 3) => Promise<string>
}

interface OnewireApi {
  list: () => Promise<string[]>
  read: (sensorId: string) => Promise<number>
}

interface SystemApi {
  basic: () => Promise<any>
}

interface StorageApi {
  fs: () => Promise<any>
}

interface DisplayApi {
  info: () => Promise<any>
}

interface PowerApi {
  snapshot: () => Promise<{ onBattery: boolean }>
}

interface ProcessApi {
  list: () => Promise<any[]>
  load: () => Promise<any>
}

interface PrinterApi {
  list: () => Promise<any[]>
}

interface MediaApi {
  devices: () => Promise<any>
}

interface EventsApi {
  onHotplug: (
    callback: (event: { type: string; message: string; ts: number }) => void
  ) => () => void
}

interface CodeRunnerApi {
  runJs: (code: string, timeout?: number) => Promise<{ success: boolean; output: string; error: string; time: number }>
  runPython: (code: string, timeout?: number) => Promise<{ success: boolean; output: string; error: string; time: number }>
  runGo: (code: string, timeout?: number) => Promise<{ success: boolean; output: string; error: string; time: number }>
  runJava: (code: string, timeout?: number) => Promise<{ success: boolean; output: string; error: string; time: number }>
  runRust: (code: string, timeout?: number) => Promise<{ success: boolean; output: string; error: string; time: number }>
}

interface DnsApi {
  query: (domain: string, type: string) => Promise<{ type: string; records: string[]; error?: string }>
  queryAll: (domain: string) => Promise<{ domain: string; results: Array<{ type: string; records: string[]; error?: string }> }>
  reverse: (ip: string) => Promise<{ success: boolean; hostnames: string[]; error?: string }>
  getServers: () => Promise<string[]>
}

interface MetaApi {
  check: (url: string) => Promise<{
    success: boolean
    url?: string
    meta?: {
      title: string
      description: string
      keywords: string
      author: string
      ogTitle: string
      ogDescription: string
      ogImage: string
      ogType: string
      twitterCard: string
      canonical: string
      robots: string
      viewport: string
      charset: string
      language: string
      favicon: string
      h1: string[]
      h2: string[]
      images: Array<{ alt: string; src: string }>
      links: Array<{ text: string; href: string }>
    }
    statusCode?: number
    error?: string
  }>
}

interface FileTransferApi {
  create: (files: string[]) => Promise<{
    success: boolean
    code?: string
    port?: number
    files?: Array<{ id: string; name: string; size: number; sizeText: string }>
    expiresIn?: number
    error?: string
  }>
  status: (code: string) => Promise<{ success: boolean; code?: string; port?: number; files?: any[]; error?: string }>
  close: (code: string) => Promise<{ success: boolean; error?: string }>
  getLocalIp: () => Promise<string[]>
  onExpired: (callback: (code: string) => void) => void
}

interface Api {
  serial: SerialApi
  usb: UsbApi
  bluetooth: BluetoothApi
  network: NetworkApi
  hid: HidApi
  gpio: GpioApi
  i2c: I2cApi
  spi: SpiApi
  onewire: OnewireApi
  system: SystemApi
  storage: StorageApi
  display: DisplayApi
  power: PowerApi
  process: ProcessApi
  printer: PrinterApi
  media: MediaApi
  events: EventsApi
  codeRunner: CodeRunnerApi
  dns: DnsApi
  meta: MetaApi
  fileTransfer: FileTransferApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

export type { SerialApi, UsbApi, BluetoothApi, NetworkApi, HidApi, Api }
