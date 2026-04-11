import { create } from 'zustand'

// 串口设备类型
export interface SerialPortDevice {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  locationId?: string
  vendorId?: string
  productId?: string
}

// USB设备类型
export interface UsbDevice {
  deviceAddress: number
  vendorId: number
  productId: number
  manufacturer?: string
  product?: string
  serialNumber?: string
  deviceClass: number
  deviceSubclass: number
  deviceProtocol: number
  interfaces?: UsbInterface[]
}

export interface UsbInterface {
  interfaceNumber: number
  interfaceClass: number
  interfaceSubclass: number
  interfaceProtocol: number
}

// 蓝牙设备类型
export interface BluetoothDevice {
  id: string
  name: string
  address: string
  rssi?: number
  deviceClass?: number
  connected: boolean
  services?: string[]
}

// 网络接口类型
export interface NetworkInterfaceItem {
  name: string
  address: string
  family: 'IPv4' | 'IPv6'
  mac: string
  internal: boolean
  cidr?: string | null
}

// 设备状态
export type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

// Store 状态接口
interface DeviceStore {
  // 串口
  serialPorts: SerialPortDevice[]
  serialStatus: DeviceStatus
  serialError: string | null
  serialData: string

  // USB
  usbDevices: UsbDevice[]
  usbStatus: DeviceStatus
  usbError: string | null
  usbData: string

  // 蓝牙
  bluetoothDevices: BluetoothDevice[]
  bluetoothStatus: DeviceStatus
  bluetoothError: string | null
  bluetoothData: string

  // 网络
  networkInterfaces: NetworkInterfaceItem[]
  networkStatus: DeviceStatus
  networkError: string | null
  networkData: string

  // Actions - 串口
  setSerialPorts: (ports: SerialPortDevice[]) => void
  setSerialStatus: (status: DeviceStatus) => void
  setSerialError: (error: string | null) => void
  setSerialData: (data: string) => void
  appendSerialData: (data: string) => void
  clearSerialData: () => void

  // Actions - USB
  setUsbDevices: (devices: UsbDevice[]) => void
  setUsbStatus: (status: DeviceStatus) => void
  setUsbError: (error: string | null) => void
  setUsbData: (data: string) => void

  // Actions - 蓝牙
  setBluetoothDevices: (devices: BluetoothDevice[]) => void
  setBluetoothStatus: (status: DeviceStatus) => void
  setBluetoothError: (error: string | null) => void
  setBluetoothData: (data: string) => void

  // Actions - 网络
  setNetworkInterfaces: (items: NetworkInterfaceItem[]) => void
  setNetworkStatus: (status: DeviceStatus) => void
  setNetworkError: (error: string | null) => void
  appendNetworkData: (data: string) => void
  clearNetworkData: () => void
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  // 串口初始状态
  serialPorts: [],
  serialStatus: 'idle',
  serialError: null,
  serialData: '',

  // USB初始状态
  usbDevices: [],
  usbStatus: 'idle',
  usbError: null,
  usbData: '',

  // 蓝牙初始状态
  bluetoothDevices: [],
  bluetoothStatus: 'idle',
  bluetoothError: null,
  bluetoothData: '',

  // 网络初始状态
  networkInterfaces: [],
  networkStatus: 'idle',
  networkError: null,
  networkData: '',

  // 串口 Actions
  setSerialPorts: (ports) => set({ serialPorts: ports }),
  setSerialStatus: (status) => set({ serialStatus: status }),
  setSerialError: (error) => set({ serialError: error }),
  setSerialData: (data) => set({ serialData: data }),
  appendSerialData: (data) =>
    set((state) => ({ serialData: state.serialData + data })),
  clearSerialData: () => set({ serialData: '' }),

  // USB Actions
  setUsbDevices: (devices) => set({ usbDevices: devices }),
  setUsbStatus: (status) => set({ usbStatus: status }),
  setUsbError: (error) => set({ usbError: error }),
  setUsbData: (data) => set({ usbData: data }),

  // 蓝牙 Actions
  setBluetoothDevices: (devices) => set({ bluetoothDevices: devices }),
  setBluetoothStatus: (status) => set({ bluetoothStatus: status }),
  setBluetoothError: (error) => set({ bluetoothError: error }),
  setBluetoothData: (data) => set({ bluetoothData: data }),

  // 网络 Actions
  setNetworkInterfaces: (items) => set({ networkInterfaces: items }),
  setNetworkStatus: (status) => set({ networkStatus: status }),
  setNetworkError: (error) => set({ networkError: error }),
  appendNetworkData: (data) => set((state) => ({ networkData: state.networkData + data })),
  clearNetworkData: () => set({ networkData: '' })
}))
