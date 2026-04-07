import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>设备采集</h2>
        </div>
        <nav className="nav">
          <NavLink
            to="/serial"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="icon">🔌</span>
            <span>串口采集</span>
          </NavLink>
          <NavLink
            to="/usb"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="icon">📱</span>
            <span>USB采集</span>
          </NavLink>
          <NavLink
            to="/bluetooth"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="icon">📶</span>
            <span>蓝牙采集</span>
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
