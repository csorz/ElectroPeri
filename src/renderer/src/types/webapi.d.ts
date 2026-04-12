// Web API Type Definitions
// These types are not included in TypeScript's default lib

declare global {
  // Web Serial API
  interface SerialPortInfo {
    usbVendorId?: number
    usbProductId?: number
  }

  interface SerialPort {
    readable: ReadableStream<Uint8Array> | null
    writable: WritableStream<Uint8Array> | null
    getInfo(): SerialPortInfo
    open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: 'none' | 'even' | 'odd' }): Promise<void>
    close(): Promise<void>
  }

  interface Serial {
    getPorts(): Promise<SerialPort[]>
    requestPort(options?: { filters: SerialPortFilter[] }): Promise<SerialPort>
  }

  interface SerialPortFilter {
    usbVendorId?: number
    usbProductId?: number
  }

  // WebHID API
  interface HIDConnectionEvent {
    device: HIDDevice
  }

  interface HIDInputReportEvent {
    device: HIDDevice
    reportId: number
    data: DataView
  }

  interface HIDDevice {
    vendorId: number
    productId: number
    productName: string
    opened: boolean
    collections: HIDCollectionInfo[]
    oninputreport: ((event: HIDInputReportEvent) => void) | null
    open(): Promise<void>
    close(): Promise<void>
    sendReport(reportId: number, data: BufferSource): Promise<void>
    receiveReport(reportId: number): Promise<DataView>
  }

  interface HIDCollectionInfo {
    usagePage: number
    usage: number
    type: number
    children: HIDCollectionInfo[]
  }

  interface HID {
    getDevices(): Promise<HIDDevice[]>
    requestDevice(options: { filters: HIDDeviceFilter[] }): Promise<HIDDevice>
    onconnect: ((event: HIDConnectionEvent) => void) | null
    ondisconnect: ((event: HIDConnectionEvent) => void) | null
  }

  interface HIDDeviceFilter {
    vendorId?: number
    productId?: number
    usagePage?: number
    usage?: number
  }

  // WebUSB API
  interface USBDevice {
    vendorId: number
    productId: number
    productName: string
    manufacturerName: string
    serialNumber: string
    configuration: USBConfiguration | null
    opened: boolean
    open(): Promise<void>
    close(): Promise<void>
    selectConfiguration(configurationValue: number): Promise<void>
    claimInterface(interfaceNumber: number): Promise<void>
    releaseInterface(interfaceNumber: number): Promise<void>
    selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>
    controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>
    controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
    isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<USBIsochronousInTransferResult>
    isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: number[]): Promise<USBIsochronousOutTransferResult>
  }

  interface USBConfiguration {
    configurationValue: number
    configurationName: string
    interfaces: USBInterface[]
  }

  interface USBInterface {
    interfaceNumber: number
    alternate: USBAlternateInterface
    alternates: USBAlternateInterface[]
    claimed: boolean
  }

  interface USBAlternateInterface {
    alternateSetting: number
    interfaceClass: number
    interfaceSubclass: number
    interfaceProtocol: number
    interfaceName: string
    endpoints: USBEndpoint[]
  }

  interface USBEndpoint {
    endpointNumber: number
    direction: 'in' | 'out'
    type: 'bulk' | 'interrupt' | 'isochronous'
    packetSize: number
  }

  interface USBControlTransferParameters {
    requestType: 'standard' | 'class' | 'vendor' | 'reserved'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
  }

  interface USBInTransferResult {
    data: DataView | null
    status: 'ok' | 'stall' | 'babble'
  }

  interface USBOutTransferResult {
    bytesWritten: number
    status: 'ok' | 'stall'
  }

  interface USBIsochronousInTransferResult {
    data: DataView | null
    packets: USBIsochronousInTransferPacket[]
  }

  interface USBIsochronousInTransferPacket {
    bytes: number
    data: DataView | null
    status: 'ok' | 'stall' | 'babble'
  }

  interface USBIsochronousOutTransferResult {
    packets: USBIsochronousOutTransferPacket[]
  }

  interface USBIsochronousOutTransferPacket {
    bytesWritten: number
    status: 'ok' | 'stall'
  }

  interface USB {
    getDevices(): Promise<USBDevice[]>
    requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>
  }

  interface USBDeviceFilter {
    vendorId?: number
    productId?: number
    classCode?: number
    subclassCode?: number
    protocolCode?: number
    serialNumber?: string
  }

  // Web Bluetooth API
  interface BluetoothAdvertisingEvent {
    device: BluetoothDevice
    uuids: string[]
    appearance?: number
    txPower?: number
    rssi?: number
    manufacturerData: Map<number, DataView>
    serviceData: Map<string, DataView>
  }

  interface BluetoothDevice {
    id: string
    name: string
    gatt: BluetoothRemoteGATTServer | null
    watchingAdvertisements: boolean
    onadvertisementreceived: ((event: BluetoothAdvertisingEvent) => void) | null
    ongattserverdisconnected: ((event: Event) => void) | null
    watchAdvertisements(): Promise<void>
    unwatchAdvertisements(): void
  }

  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice
    connected: boolean
    connect(): Promise<BluetoothRemoteGATTServer>
    disconnect(): void
    getPrimaryService(uuid: string | number): Promise<BluetoothRemoteGATTService>
    getPrimaryServices(uuid?: string | number): Promise<BluetoothRemoteGATTService[]>
  }

  interface BluetoothRemoteGATTService {
    device: BluetoothDevice
    uuid: string
    isPrimary: boolean
    getCharacteristic(uuid: string | number): Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristics(uuid?: string | number): Promise<BluetoothRemoteGATTCharacteristic[]>
  }

  interface BluetoothRemoteGATTCharacteristic {
    service: BluetoothRemoteGATTService
    uuid: string
    properties: GATTCharacteristicProperties
    value: DataView | null
    oncharacteristicvaluechanged: ((event: Event) => void) | null
    addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
    removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
    readValue(): Promise<DataView>
    writeValue(value: BufferSource): Promise<void>
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  }

  interface GATTCharacteristicProperties {
    broadcast: boolean
    read: boolean
    writeWithoutResponse: boolean
    write: boolean
    notify: boolean
    indicate: boolean
    authenticatedSignedWrites: boolean
    reliableWrite: boolean
    writableAuxiliaries: boolean
  }

  interface Bluetooth {
    getAvailability(): Promise<boolean>
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
    onavailabilitychanged: ((event: Event) => void) | null
  }

  interface RequestDeviceOptions {
    acceptAllDevices?: boolean
    filters?: BluetoothLEScanFilter[]
    optionalServices?: (string | number)[]
  }

  interface BluetoothLEScanFilter {
    services?: (string | number)[]
    name?: string
    namePrefix?: string
    manufacturerData?: ManufacturerDataFilter[]
    serviceData?: ServiceDataFilter[]
  }

  interface ManufacturerDataFilter {
    id: number
    dataPrefix?: BufferSource
    mask?: BufferSource
  }

  interface ServiceDataFilter {
    id: string | number
    dataPrefix?: BufferSource
    mask?: BufferSource
  }

  // Extend Navigator interface
  interface Navigator {
    serial?: Serial
    hid?: HID
    usb?: USB
    bluetooth?: Bluetooth
  }
}

export {}
