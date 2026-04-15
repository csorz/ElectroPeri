/**
 * 启动日志 Handler
 * 提供读取启动日志的 IPC 接口
 */

import { ipcMain } from 'electron'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

export function setupStartupLogHandlers(): void {
  // 获取日志目录路径
  ipcMain.handle('startup-log:path', () => {
    return join(app.getPath('userData'), 'logs')
  })

  // 获取日志文件列表
  ipcMain.handle('startup-log:list', () => {
    try {
      const logDir = join(app.getPath('userData'), 'logs')
      if (!existsSync(logDir)) {
        return []
      }

      const files = readdirSync(logDir)
        .filter(f => f.startsWith('startup-') && f.endsWith('.log'))
        .sort()
        .reverse() // 最新的在前

      return files
    } catch (err) {
      console.error('Failed to list log files:', err)
      return []
    }
  })

  // 读取指定日志文件
  ipcMain.handle('startup-log:read', (_event, filename: string) => {
    try {
      const logDir = join(app.getPath('userData'), 'logs')
      const filePath = join(logDir, filename)

      if (!existsSync(filePath)) {
        return null
      }

      const content = readFileSync(filePath, 'utf-8')
      return content
    } catch (err) {
      console.error('Failed to read log file:', err)
      return null
    }
  })

  // 获取最新日志
  ipcMain.handle('startup-log:latest', () => {
    try {
      const logDir = join(app.getPath('userData'), 'logs')
      if (!existsSync(logDir)) {
        return null
      }

      const files = readdirSync(logDir)
        .filter(f => f.startsWith('startup-') && f.endsWith('.log'))
        .sort()
        .reverse()

      if (files.length === 0) {
        return null
      }

      const filePath = join(logDir, files[0])
      const content = readFileSync(filePath, 'utf-8')
      return { filename: files[0], content }
    } catch (err) {
      console.error('Failed to read latest log:', err)
      return null
    }
  })
}
