import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SerialPage from './pages/SerialPage'
import UsbPage from './pages/UsbPage'
import BluetoothPage from './pages/BluetoothPage'
import NetworkPage from './pages/NetworkPage'
import HidPage from './pages/HidPage'
import GpioPage from './pages/GpioPage'
import I2cPage from './pages/I2cPage'
import SpiPage from './pages/SpiPage'
import OnewirePage from './pages/OnewirePage'
import SystemPage from './pages/SystemPage'
import StoragePage from './pages/StoragePage'
import DisplayPage from './pages/DisplayPage'
import PowerPage from './pages/PowerPage'
import ProcessPage from './pages/ProcessPage'
import PrinterPage from './pages/PrinterPage'
import MediaPage from './pages/MediaPage'
import WebSerialPage from './pages/WebSerialPage'
import ToolboxHubPage from './pages/toolbox/ToolboxHubPage'
import ToolboxEncodingPage from './pages/toolbox/ToolboxEncodingPage'
import ToolboxJsonPage from './pages/toolbox/ToolboxJsonPage'
import ToolboxUrlPage from './pages/toolbox/ToolboxUrlPage'
import ToolboxTimePage from './pages/toolbox/ToolboxTimePage'
import ToolboxHttpPage from './pages/toolbox/ToolboxHttpPage'
import ToolboxTextPage from './pages/toolbox/ToolboxTextPage'
import './assets/main.css'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="serial" element={<SerialPage />} />
          <Route path="usb" element={<UsbPage />} />
          <Route path="bluetooth" element={<BluetoothPage />} />
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
          <Route path="web-serial" element={<WebSerialPage />} />
          <Route path="frontend-toolbox" element={<ToolboxHubPage />} />
          <Route path="frontend-toolbox/encoding" element={<ToolboxEncodingPage />} />
          <Route path="frontend-toolbox/json" element={<ToolboxJsonPage />} />
          <Route path="frontend-toolbox/url" element={<ToolboxUrlPage />} />
          <Route path="frontend-toolbox/time" element={<ToolboxTimePage />} />
          <Route path="frontend-toolbox/http" element={<ToolboxHttpPage />} />
          <Route path="frontend-toolbox/text" element={<ToolboxTextPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
