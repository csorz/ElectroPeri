import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Serial Port API
const serialApi = {
  list: () => ipcRenderer.invoke('serial:list'),
  open: (path: string, baudRate: number) => ipcRenderer.invoke('serial:open', path, baudRate),
  close: () => ipcRenderer.invoke('serial:close'),
  write: (data: string) => ipcRenderer.invoke('serial:write', data),
  onData: (callback: (data: string) => void) => {
    ipcRenderer.on('serial:data', (_event, data) => callback(data))
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('serial:error', (_event, error) => callback(error))
  },
  onClosed: (callback: () => void) => {
    ipcRenderer.on('serial:closed', () => callback())
  }
}

// USB API
const usbApi = {
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
    ipcRenderer.on('usb:data', (_event, data) => callback(data))
  }
}

// Bluetooth API
const bluetoothApi = {
  scan: () => ipcRenderer.invoke('bluetooth:scan'),
  stopScan: () => ipcRenderer.invoke('bluetooth:stopScan'),
  connect: (deviceId: string) => ipcRenderer.invoke('bluetooth:connect', deviceId),
  disconnect: () => ipcRenderer.invoke('bluetooth:disconnect'),
  write: (data: string) => ipcRenderer.invoke('bluetooth:write', data),
  discoverServices: (serviceUuid: string) =>
    ipcRenderer.invoke('bluetooth:discoverServices', serviceUuid),
  onData: (callback: (data: string) => void) => {
    ipcRenderer.on('bluetooth:data', (_event, data) => callback(data))
  }
}

// Custom APIs for renderer
const api = {
  serial: serialApi,
  usb: usbApi,
  bluetooth: bluetoothApi
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
