import { ReactNode } from 'react'
import './NativeModuleError.css'

interface NativeModuleErrorProps {
  module: string
  error?: string
  children?: ReactNode
}

/**
 * 显示原生模块加载错误和修复说明
 */
export function NativeModuleError({ module, error, children }: NativeModuleErrorProps) {
  const isBuildError = error?.includes('未正确编译') ||
                       error?.includes('未安装') ||
                       error?.includes('缺少编译工具') ||
                       error?.includes('bindings file') ||
                       error?.includes('Module version mismatch')

  const isWindows = navigator.platform.toLowerCase().includes('win')

  return (
    <div className="native-module-error">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h3>{module} 模块加载失败</h3>
      </div>

      {error && (
        <div className="error-detail">
          <code>{error}</code>
        </div>
      )}

      {isBuildError && (
        <div className="error-solution">
          <h4>解决方案</h4>

          {error?.includes('未安装') && (
            <>
              <p>缺少原生绑定模块，请执行：</p>
              <div className="command-box">
                <code>pnpm add @serialport/bindings-cpp</code>
              </div>
            </>
          )}

          {error?.includes('缺少编译工具') && (
            <>
              <p>Windows 系统需要安装 Visual Studio Build Tools：</p>
              <div className="command-box">
                <code># 下载地址</code>
                <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noopener noreferrer">
                  https://visualstudio.microsoft.com/visual-cpp-build-tools/
                </a>
              </div>
              <p className="solution-note">安装时选择 "Desktop development with C++" 工作负载</p>
            </>
          )}

          {!error?.includes('未安装') && !error?.includes('缺少编译工具') && (
            <>
              <p>原生模块需要为 Electron 重新编译。请执行以下命令：</p>
              <div className="command-box">
                <code>pnpm electron-builder install-app-deps</code>
              </div>
            </>
          )}

          {isWindows && !error?.includes('缺少编译工具') && (
            <>
              <p className="solution-note">
                如果提示找不到 Visual Studio，请先安装：
              </p>
              <ul>
                <li><strong>Visual Studio Build Tools</strong> - 选择 "C++ 生成工具" 工作负载</li>
              </ul>
              <div className="command-box">
                <code># 或使用 winget 安装</code>
                <code>winget install Microsoft.VisualStudio.2022.BuildTools</code>
              </div>
            </>
          )}

          <p className="solution-note" style={{ marginTop: 12 }}>
            也可以使用 <strong>Web Serial API</strong>（浏览器内置）作为替代方案，在左侧菜单选择 "Web 串口"。
          </p>
        </div>
      )}

      {children}
    </div>
  )
}
