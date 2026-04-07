import { ipcMain } from 'electron'

// Note: Bluetooth in Electron requires the Web Bluetooth API in the renderer process
// This handler provides a bridge for native bluetooth operations if needed
// For most cases, Web Bluetooth API in renderer is preferred

let scanTimeout: NodeJS.Timeout | null = null

export function setupBluetoothHandlers(): void {
  // Request Bluetooth device (uses Web Bluetooth API)
  ipcMain.handle('bluetooth:scan', async () => {
    try {
      // For Electron, we use the Web Bluetooth API in the renderer
      // This handler just triggers the scan request
      // The actual device selection happens in the renderer via navigator.bluetooth

      // Alternative: Use noble package for native Bluetooth LE scanning
      // This requires native dependencies

      return [] // Return empty array - actual scanning done in renderer
    } catch (error) {
      console.error('Failed to scan Bluetooth devices:', error)
      throw error
    }
  })

  ipcMain.handle('bluetooth:stopScan', async () => {
    if (scanTimeout) {
      clearTimeout(scanTimeout)
      scanTimeout = null
    }
    return { success: true }
  })

  ipcMain.handle('bluetooth:connect', async (_event, deviceId: string) => {
    try {
      // Connection handled in renderer via Web Bluetooth API
      console.log('Bluetooth connect request for device:', deviceId)
      return { success: true }
    } catch (error) {
      console.error('Failed to connect Bluetooth device:', error)
      throw error
    }
  })

  ipcMain.handle('bluetooth:disconnect', async () => {
    try {
      console.log('Bluetooth disconnect request')
      return { success: true }
    } catch (error) {
      console.error('Failed to disconnect Bluetooth device:', error)
      throw error
    }
  })

  ipcMain.handle('bluetooth:write', async (_event, data: string) => {
    try {
      console.log('Bluetooth write request:', data)
      return { success: true }
    } catch (error) {
      console.error('Failed to write to Bluetooth device:', error)
      throw error
    }
  })

  ipcMain.handle('bluetooth:discoverServices', async (_event, serviceUuid: string) => {
    try {
      console.log('Discover services request for:', serviceUuid)
      return []
    } catch (error) {
      console.error('Failed to discover Bluetooth services:', error)
      throw error
    }
  })

  // Handle Bluetooth pairing request (Windows)
  ipcMain.on('bluetooth-pairing-request', (_event, details) => {
    console.log('Bluetooth pairing request:', details)
  })
}
