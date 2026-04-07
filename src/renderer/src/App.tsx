import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import SerialPage from './pages/SerialPage'
import UsbPage from './pages/UsbPage'
import BluetoothPage from './pages/BluetoothPage'
import './assets/main.css'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/serial" replace />} />
          <Route path="serial" element={<SerialPage />} />
          <Route path="usb" element={<UsbPage />} />
          <Route path="bluetooth" element={<BluetoothPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
