import { BrowserWindow, ipcMain } from 'electron'
import mqtt, { MqttClient } from 'mqtt'

interface MqttConnection {
  client: MqttClient
  window: BrowserWindow
}

const connections = new Map<string, MqttConnection>()

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

      // Generate connection ID for tracking
      const connectionId = clientId || `mqtt_${Date.now()}`

      // If there's an existing connection with this ID, close it first
      const existing = connections.get(connectionId)
      if (existing) {
        existing.client.end()
        connections.delete(connectionId)
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
          clientId: connectionId,
          clean: clean !== false,
          keepalive: keepalive || 60,
          reconnectPeriod: 0 // Disable auto-reconnect, let client handle it
        }

        const client = mqtt.connect(url, connectOptions)

        client.on('connect', () => {
          connections.set(connectionId, { client, window: win })
          win.webContents.send('mqtt:connected', { connectionId })
        })

        client.on('message', (topic: string, message: Buffer) => {
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:message', {
              connectionId,
              topic,
              message: message.toString()
            })
          }
        })

        client.on('error', (err: Error) => {
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:error', {
              connectionId,
              error: err.message
            })
          }
        })

        client.on('close', () => {
          if (!win.isDestroyed()) {
            win.webContents.send('mqtt:disconnected', { connectionId })
          }
          connections.delete(connectionId)
        })

        // Set a timeout for connection
        const timeout = setTimeout(() => {
          if (!connections.has(connectionId)) {
            client.end()
            resolve({ success: false, error: 'Connection timeout' })
          }
        }, 10000)

        client.on('connect', () => {
          clearTimeout(timeout)
          resolve({ success: true, connectionId })
        })

        client.on('error', (err: Error) => {
          clearTimeout(timeout)
          if (!connections.has(connectionId)) {
            resolve({ success: false, error: err.message })
          }
        })
      })
    }
  )

  // Disconnect from MQTT broker
  ipcMain.handle('mqtt:disconnect', async (_event, connectionId: string) => {
    const connection = connections.get(connectionId)
    if (!connection) {
      return { success: false, error: 'Connection not found' }
    }

    return new Promise((resolve) => {
      connection.client.end(false, () => {
        connections.delete(connectionId)
        resolve({ success: true })
      })
    })
  })

  // Subscribe to a topic
  ipcMain.handle(
    'mqtt:subscribe',
    async (_event, connectionId: string, topic: string, qos: 0 | 1 | 2 = 0) => {
      const connection = connections.get(connectionId)
      if (!connection) {
        return { success: false, error: 'Connection not found' }
      }

      return new Promise((resolve) => {
        connection.client.subscribe(topic, { qos }, (err) => {
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
  ipcMain.handle('mqtt:unsubscribe', async (_event, connectionId: string, topic: string) => {
    const connection = connections.get(connectionId)
    if (!connection) {
      return { success: false, error: 'Connection not found' }
    }

    return new Promise((resolve) => {
      connection.client.unsubscribe(topic, (err) => {
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
    async (
      _event,
      connectionId: string,
      topic: string,
      message: string,
      qos: 0 | 1 | 2 = 0,
      retain: boolean = false
    ) => {
      const connection = connections.get(connectionId)
      if (!connection) {
        return { success: false, error: 'Connection not found' }
      }

      return new Promise((resolve) => {
        connection.client.publish(topic, message, { qos, retain }, (err) => {
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
