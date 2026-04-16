import { BrowserWindow, ipcMain } from 'electron'
import mqtt, { MqttClient } from 'mqtt'

// Single connection for the tool page
let currentConnection: { client: MqttClient; window: BrowserWindow } | null = null

export function setupMqttHandlers(): void {
  // Connect to MQTT broker
  ipcMain.handle(
    'mqtt:connect',
    async (event, options: {
      url: string
      port?: number
      username?: string
      password?: string
      clientId?: string
      clean?: boolean
      keepalive?: number
    }) => {
      const { url, port, username, password, clientId, clean, keepalive } = options

      // If there's an existing connection, close it first
      if (currentConnection) {
        currentConnection.client.end()
        currentConnection = null
      }

      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) {
        return { success: false, error: 'Window not found' }
      }

      return new Promise((resolve) => {
        const connectOptions: mqtt.IClientOptions = {
          port,
          username,
          password,
          clientId: clientId || `mqtt_${Date.now()}`,
          clean: clean !== false,
          keepalive: keepalive || 60,
          reconnectPeriod: 0 // Disable auto-reconnect, let client handle it
        }

        const client = mqtt.connect(url, connectOptions)
        let resolved = false

        client.on('connect', () => {
          currentConnection = { client, window: win }
          if (!resolved) {
            resolved = true
            resolve({ success: true })
          }
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:connected')
          }
        })

        client.on('message', (topic: string, message: Buffer) => {
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:message', {
              topic,
              message: message.toString()
            })
          }
        })

        client.on('error', (err: Error) => {
          if (!resolved) {
            resolved = true
            resolve({ success: false, error: err.message })
          }
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:error', { error: err.message })
          }
        })

        client.on('close', () => {
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:disconnected')
          }
          currentConnection = null
        })

        // Set a timeout for connection
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            client.end()
            resolve({ success: false, error: 'Connection timeout' })
          }
        }, 10000)
      })
    }
  )

  // Disconnect from MQTT broker
  ipcMain.handle('mqtt:disconnect', async () => {
    if (!currentConnection) {
      return { success: true }
    }

    return new Promise((resolve) => {
      currentConnection!.client.end(false, () => {
        currentConnection = null
        resolve({ success: true })
      })
    })
  })

  // Subscribe to a topic
  ipcMain.handle(
    'mqtt:subscribe',
    async (_event, topic: string, qos: 0 | 1 | 2 = 0) => {
      if (!currentConnection) {
        return { success: false, error: 'Not connected' }
      }

      return new Promise((resolve) => {
        currentConnection!.client.subscribe(topic, { qos }, (err) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else {
            resolve({ success: true, topic, qos })
          }
        })
      })
    }
  )

  // Unsubscribe from a topic
  ipcMain.handle('mqtt:unsubscribe', async (_event, topic: string) => {
    if (!currentConnection) {
      return { success: false, error: 'Not connected' }
    }

    return new Promise((resolve) => {
      currentConnection!.client.unsubscribe(topic, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, topic })
        }
      })
    })
  })

  // Publish a message
  ipcMain.handle(
    'mqtt:publish',
    async (_event, topic: string, message: string, qos: 0 | 1 | 2 = 0, retain: boolean = false) => {
      if (!currentConnection) {
        return { success: false, error: 'Not connected' }
      }

      return new Promise((resolve) => {
        currentConnection!.client.publish(topic, message, { qos, retain }, (err) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else {
            resolve({ success: true, topic })
          }
        })
      })
    }
  )
}
