import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: [
          '@abandonware/noble',
          '@abandonware/bluetooth-hci-socket',
          'node-hid',
          'usb',
          'raw-keyboard',
          /bluetooth_hci_socket\.node$/,
          /binding\.node$/,
          /noble\.node$/,
          /HID\.node$/,
          /usb_bindings\.node$/,
          /raw_keyboard\.node$/
        ]
      }
    } as any
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
