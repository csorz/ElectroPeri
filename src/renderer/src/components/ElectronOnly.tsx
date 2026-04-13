import { ReactNode } from 'react'
import { isElectron } from '../utils/environment'

interface ElectronOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 仅在 Electron 环境中显示内容
 * 在浏览器环境中显示提示信息或自定义 fallback
 */
export function ElectronOnly({ children, fallback }: ElectronOnlyProps) {
  if (isElectron()) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="electron-only-notice">
      <div className="notice-icon">⚠️</div>
      <h3>此功能需要 Electron 环境</h3>
      <p>当前页面在浏览器中运行，部分功能需要 Electron 桌面应用才能使用。</p>
      <p className="notice-hint">请使用 Electron 应用打开此页面，或访问其他支持浏览器的功能。</p>
    </div>
  )
}
