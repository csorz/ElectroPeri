/**
 * 检测是否在 Electron 环境中运行
 */
export const isElectron = (): boolean => {
  // 检查 window.api 是否存在（由 preload 脚本注入）
  return typeof window !== 'undefined' && typeof window.api !== 'undefined'
}

/**
 * 获取运行环境描述
 */
export const getEnvironment = (): 'electron' | 'browser' => {
  return isElectron() ? 'electron' : 'browser'
}
