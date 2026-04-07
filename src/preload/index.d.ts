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

interface Api {
  serial: SerialApi
  usb: UsbApi
  bluetooth: BluetoothApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

export type { SerialApi, UsbApi, BluetoothApi, Api }
