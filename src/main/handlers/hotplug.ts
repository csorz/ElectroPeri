import { BrowserWindow } from 'electron'
import os from 'node:os'

type HotplugType = 'serial' | 'usb' | 'hid' | 'network'

type SnapshotState = {
  serial: string
  usb: string
  hid: string
  network: string
}

let timer: NodeJS.Timeout | null = null
const state: SnapshotState = { serial: '', usb: '', hid: '', network: '' }

function sendHotplug(type: HotplugType, message: string) {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win || win.isDestroyed()) return
  win.webContents.send('events:hotplug', {
    type,
    message,
    ts: Date.now()
  })
}

async function snapshotSerial() {
  const { SerialPort } = await import('serialport')
  const ports = await SerialPort.list()
  return JSON.stringify(ports.map((p) => p.path).sort())
}

async function snapshotUsb() {
  const { WebUSB } = await import('usb')
  const webusb = new WebUSB({ allowAllDevices: true })
  const devices = await webusb.getDevices()
  return JSON.stringify(devices.map((d) => `${d.vendorId}:${d.productId}:${d.deviceAddress}`).sort())
}

async function snapshotHid() {
  const mod: any = await import('node-hid')
  const HID = mod.default ?? mod
  const list = HID.devices().map((d: any) => `${d.vendorId}:${d.productId}:${d.path || ''}`)
  return JSON.stringify(list.sort())
}

function snapshotNetwork() {
  const ifs = os.networkInterfaces()
  const list: string[] = []
  for (const [name, arr] of Object.entries(ifs)) {
    if (!arr) continue
    for (const it of arr) list.push(`${name}:${it.address}:${it.family}`)
  }
  return JSON.stringify(list.sort())
}

async function checkOne(type: HotplugType, take: () => Promise<string> | string) {
  try {
    const next = await take()
    if (!state[type]) {
      state[type] = next
      return
    }
    if (state[type] !== next) {
      state[type] = next
      sendHotplug(type, `${type.toUpperCase()} 接口列表发生变化`)
    }
  } catch {
    // ignore watcher errors
  }
}

export function setupHotplugWatcher(): void {
  if (timer) return
  timer = setInterval(() => {
    checkOne('serial', snapshotSerial)
    checkOne('usb', snapshotUsb)
    checkOne('hid', snapshotHid)
    checkOne('network', snapshotNetwork)
  }, 5000)
}

