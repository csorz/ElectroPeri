/**
 * 启动日志模块
 * 用于记录应用启动过程中的日志和错误
 */

import { app } from 'electron'
import { join } from 'path'
import { appendFileSync, existsSync, mkdirSync } from 'fs'

let logFilePath: string | null = null
let isInitialized = false

// 获取日志文件路径
function getLogFilePath(): string {
  if (logFilePath) return logFilePath

  const logDir = join(app.getPath('userData'), 'logs')
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }

  const date = new Date().toISOString().split('T')[0]
  logFilePath = join(logDir, `startup-${date}.log`)
  return logFilePath
}

// 格式化时间戳
function getTimestamp(): string {
  return new Date().toISOString()
}

// 写入日志
function writeLog(level: string, message: string, ...args: unknown[]): void {
  try {
    const timestamp = getTimestamp()
    const argsStr = args.length > 0 ? ' ' + args.map(a =>
      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ') : ''
    const logLine = `[${timestamp}] [${level}] ${message}${argsStr}\n`

    const filePath = getLogFilePath()
    appendFileSync(filePath, logLine, 'utf-8')

    // 同时输出到控制台
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'
    console[consoleMethod](`[${level}] ${message}`, ...args)
  } catch (err) {
    console.error('Failed to write log:', err)
  }
}

// 初始化启动日志
export function initStartupLog(): void {
  if (isInitialized) return
  isInitialized = true

  // 清理旧日志（保留最近7天）
  try {
    const logDir = join(app.getPath('userData'), 'logs')
    if (existsSync(logDir)) {
      const files = require('fs').readdirSync(logDir)
      const now = Date.now()
      const sevenDays = 7 * 24 * 60 * 60 * 1000

      for (const file of files) {
        if (file.startsWith('startup-') && file.endsWith('.log')) {
          const filePath = join(logDir, file)
          const stat = require('fs').statSync(filePath)
          if (now - stat.mtimeMs > sevenDays) {
            require('fs').unlinkSync(filePath)
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to cleanup old logs:', err)
  }

  // 记录启动信息
  writeLog('INFO', '='.repeat(60))
  writeLog('INFO', 'Application Starting')
  writeLog('INFO', '='.repeat(60))
  writeLog('INFO', `App Name: ${app.getName()}`)
  writeLog('INFO', `App Version: ${app.getVersion()}`)
  writeLog('INFO', `Electron Version: ${process.versions.electron}`)
  writeLog('INFO', `Node Version: ${process.versions.node}`)
  writeLog('INFO', `Chrome Version: ${process.versions.chrome}`)
  writeLog('INFO', `Platform: ${process.platform}`)
  writeLog('INFO', `Architecture: ${process.arch}`)
  writeLog('INFO', `Process Type: ${process.type}`)
  writeLog('INFO', `User Data Path: ${app.getPath('userData')}`)
  writeLog('INFO', `App Path: ${app.getAppPath()}`)
  writeLog('INFO', `Exec Path: ${process.execPath}`)
  writeLog('INFO', `Is Packaged: ${app.isPackaged}`)
  writeLog('INFO', `Node Env: ${process.env.NODE_ENV || 'not set'}`)
  writeLog('INFO', `Electron Renderer URL: ${process.env['ELECTRON_RENDERER_URL'] || 'not set'}`)
  writeLog('INFO', `Args: ${process.argv.join(' ')}`)
  writeLog('INFO', '-'.repeat(60))
}

// 日志方法
export const startupLog = {
  info: (message: string, ...args: unknown[]) => writeLog('INFO', message, ...args),
  warn: (message: string, ...args: unknown[]) => writeLog('WARN', message, ...args),
  error: (message: string, ...args: unknown[]) => writeLog('ERROR', message, ...args),
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      writeLog('DEBUG', message, ...args)
    }
  }
}

// 捕获未处理的异常
export function setupErrorHandlers(): void {
  // 捕获未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    startupLog.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })

  // 捕获未捕获的异常
  process.on('uncaughtException', (error) => {
    startupLog.error('Uncaught Exception:', error)

    // 显示错误对话框
    const { dialog } = require('electron')
    dialog.showErrorBox(
      '启动错误',
      `应用启动时发生错误：\n\n${error.message}\n\n详细信息请查看日志文件：\n${getLogFilePath()}`
    )
  })

  // 监听应用退出
  app.on('will-quit', () => {
    startupLog.info('Application is about to quit')
  })

  app.on('quit', (_event, exitCode) => {
    startupLog.info(`Application quit with exit code: ${exitCode}`)
  })

  startupLog.info('Error handlers setup complete')
}

// 获取日志文件路径（供外部使用）
export function getLogPath(): string {
  return getLogFilePath()
}
