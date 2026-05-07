import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

// P1 - 工业核心接口
import SerialPage from './pages/industrial/SerialPage'
import UsbPage from './pages/industrial/UsbPage'
import BluetoothPage from './pages/industrial/BluetoothPage'
import BleScanPage from './pages/industrial/BleScanPage'
import MacScanPage from './pages/industrial/MacScanPage'
import RawKeyboardPage from './pages/industrial/RawKeyboardPage'
import HidPage from './pages/industrial/HidPage'
import NetworkPage from './pages/industrial/NetworkPage'

// P2 - 系统与终端能力
import SystemPage from './pages/system/SystemPage'
import StoragePage from './pages/system/StoragePage'
import DisplayPage from './pages/system/DisplayPage'
import PowerPage from './pages/system/PowerPage'
import ProcessPage from './pages/system/ProcessPage'
import PrinterPage from './pages/system/PrinterPage'
import MediaPage from './pages/system/MediaPage'
import ScreenshotPage from './pages/system/ScreenshotPage'
import MixerPage from './pages/system/MixerPage'

// P4 - 嵌入式扩展接口
import GpioPage from './pages/embedded/GpioPage'
import I2cPage from './pages/embedded/I2cPage'
import SpiPage from './pages/embedded/SpiPage'
import OnewirePage from './pages/embedded/OnewirePage'

import './assets/main.css'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="serial" element={<SerialPage />} />
          <Route path="usb" element={<UsbPage />} />
          <Route path="bluetooth" element={<BluetoothPage />} />
          <Route path="ble-scan" element={<BleScanPage />} />
          <Route path="mac-scan" element={<MacScanPage />} />
          <Route path="raw-keyboard" element={<RawKeyboardPage />} />
          <Route path="hid" element={<HidPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="gpio" element={<GpioPage />} />
          <Route path="i2c" element={<I2cPage />} />
          <Route path="spi" element={<SpiPage />} />
          <Route path="onewire" element={<OnewirePage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="display" element={<DisplayPage />} />
          <Route path="power" element={<PowerPage />} />
          <Route path="process" element={<ProcessPage />} />
          <Route path="printer" element={<PrinterPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="screenshot" element={<ScreenshotPage />} />
          <Route path="mixer" element={<MixerPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
