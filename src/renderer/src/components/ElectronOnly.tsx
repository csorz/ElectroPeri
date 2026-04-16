import { ReactNode } from 'react'
import { isElectron } from '../utils/environment'

interface ElectronOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  /** 自定义功能名称 */
  featureName?: string
  /** 支持的设备说明 */
  supportedDevices?: string
}

/**
 * 仅在 Electron 环境中显示内容
 * 在浏览器环境中显示提示信息或自定义 fallback
 */
export function ElectronOnly({ children, fallback, featureName, supportedDevices }: ElectronOnlyProps) {
  if (isElectron()) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="electron-only-notice">
      <div className="notice-icon">⚠️</div>
      <h3>{featureName ? `${featureName} 需要 Electron 环境` : '此功能需要 Electron 环境'}</h3>
      <p>当前页面在浏览器中运行，该功能需要 Electron 桌面应用才能使用。</p>
      {supportedDevices && (
        <div className="supported-devices">
          <strong>支持的运行设备：</strong>
          <p>{supportedDevices}</p>
        </div>
      )}
      <p className="notice-hint">请在 Electron 桌面应用中打开此页面。</p>
    </div>
  )
}
