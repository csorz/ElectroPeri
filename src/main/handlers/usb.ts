import { ipcMain } from 'electron'
import type { WebUSBDevice } from 'usb'

// Store current connection
let currentDevice: WebUSBDevice | null = null

export function setupUsbHandlers(): void {
  ipcMain.handle('usb:list', async () => {
    try {
      const { WebUSB } = await import('usb')
      const webusb = new WebUSB({ allowAllDevices: true })
      const devices = await webusb.getDevices()

      return devices.map((device) => ({
        deviceAddress: device.deviceAddress,
        vendorId: device.vendorId,
        productId: device.productId,
        manufacturer: device.manufacturer,
        product: device.product,
        serialNumber: device.serialNumber,
        deviceClass: device.deviceClass,
        deviceSubclass: device.deviceSubclass,
        deviceProtocol: device.deviceProtocol,
        interfaces: device.configuration?.interfaces?.map((intf) => ({
          interfaceNumber: intf.interfaceNumber,
          interfaceClass: intf.interfaceClass,
          interfaceSubclass: intf.interfaceSubclass,
          interfaceProtocol: intf.interfaceProtocol
        }))
      }))
    } catch (error) {
      console.error('Failed to list USB devices:', error)
      throw error
    }
  })

  ipcMain.handle('usb:open', async (_event, vendorId: number, productId: number) => {
    try {
      const { WebUSB } = await import('usb')
      const webusb = new WebUSB({ allowAllDevices: true })

      const devices = await webusb.getDevices()
      const device = devices.find(
        (d) => d.vendorId === vendorId && d.productId === productId
      )

      if (!device) {
        throw new Error('Device not found')
      }

      await device.open()
      currentDevice = device

      // Claim the first interface if available
      if (device.configuration?.interfaces?.length) {
        const interfaceNumber = device.configuration.interfaces[0].interfaceNumber
        await device.claimInterface(interfaceNumber)
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to open USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:close', async () => {
    try {
      if (currentDevice && currentDevice.opened) {
        await currentDevice.close()
        currentDevice = null
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to close USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:write', async (_event, endpointNumber: number, data: string) => {
    try {
      if (!currentDevice || !currentDevice.opened) {
        throw new Error('USB device not open')
      }

      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      await currentDevice.transferOut(endpointNumber, dataBuffer.buffer)
      return { success: true }
    } catch (error) {
      console.error('Failed to write to USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:read', async (_event, endpointNumber: number, length = 64) => {
    try {
      if (!currentDevice || !currentDevice.opened) {
        throw new Error('USB device not open')
      }

      const result = await currentDevice.transferIn(endpointNumber, length)
      if (result.data) {
        const decoder = new TextDecoder()
        return decoder.decode(result.data)
      }
      return ''
    } catch (error) {
      console.error('Failed to read from USB device:', error)
      throw error
    }
  })

  ipcMain.handle('usb:controlTransfer', async (_event, setup: {
    requestType: 'standard' | 'class' | 'vendor'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
    data?: string
  }) => {
    try {
      if (!currentDevice || !currentDevice.opened) {
        throw new Error('USB device not open')
      }

      const result = await currentDevice.controlTransferIn(
        {
          requestType: setup.requestType,
          recipient: setup.recipient,
          request: setup.request,
          value: setup.value,
          index: setup.index
        },
        64
      )

      if (result.data) {
        const decoder = new TextDecoder()
        return decoder.decode(result.data)
      }
      return ''
    } catch (error) {
      console.error('Failed USB control transfer:', error)
      throw error
    }
  })
}
