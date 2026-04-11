import { ipcMain } from 'electron'
import { exec } from 'node:child_process'
import vm from 'node:vm'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

// JavaScript 执行器（使用 vm 模块）
function runJavaScript(code: string, timeout = 5000): RunResult {
  const start = Date.now()
  const logs: string[] = []

  try {
    const context = {
      console: {
        log: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' ')),
        error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
        warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(a => String(a)).join(' '))
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
      atob: (str: string) => Buffer.from(str, 'base64').toString('binary')
    }

    vm.createContext(context)
    const script = new vm.Script(code)
    const result = script.runInContext(context, { timeout })

    let output = logs.join('\n')
    if (result !== undefined) {
      output += (output ? '\n' : '') + '=> ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))
    }

    return {
      success: true,
      output: output || '(no output)',
      error: '',
      time: Date.now() - start
    }
  } catch (e) {
    return {
      success: false,
      output: logs.join('\n'),
      error: e instanceof Error ? e.message : String(e),
      time: Date.now() - start
    }
  }
}

// Python 执行器
function runPython(code: string, timeout = 10000): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tmpFile = path.join(os.tmpdir(), `python_${Date.now()}.py`)

    fs.writeFileSync(tmpFile, code, 'utf-8')

    exec(`python3 "${tmpFile}"`, { timeout }, (error, stdout, stderr) => {
      fs.unlinkSync(tmpFile)

      resolve({
        success: !error,
        output: stdout || '(no output)',
        error: stderr || (error ? error.message : ''),
        time: Date.now() - start
      })
    })
  })
}

// Go 执行器
function runGo(code: string, timeout = 15000): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tmpDir = path.join(os.tmpdir(), `go_${Date.now()}`)
    fs.mkdirSync(tmpDir, { recursive: true })

    const goFile = path.join(tmpDir, 'main.go')
    fs.writeFileSync(goFile, code, 'utf-8')

    exec(`go run "${goFile}"`, { timeout, cwd: tmpDir }, (error, stdout, stderr) => {
      fs.rmSync(tmpDir, { recursive: true, force: true })

      resolve({
        success: !error,
        output: stdout || '(no output)',
        error: stderr || (error ? error.message : ''),
        time: Date.now() - start
      })
    })
  })
}

// Java 执行器
function runJava(code: string, timeout = 15000): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tmpDir = path.join(os.tmpdir(), `java_${Date.now()}`)
    fs.mkdirSync(tmpDir, { recursive: true })

    const javaFile = path.join(tmpDir, 'Main.java')
    fs.writeFileSync(javaFile, code, 'utf-8')

    exec(`javac "${javaFile}" && java -cp "${tmpDir}" Main`, { timeout, cwd: tmpDir }, (error, stdout, stderr) => {
      fs.rmSync(tmpDir, { recursive: true, force: true })

      resolve({
        success: !error,
        output: stdout || '(no output)',
        error: stderr || (error ? error.message : ''),
        time: Date.now() - start
      })
    })
  })
}

// Rust 执行器
function runRust(code: string, timeout = 30000): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tmpDir = path.join(os.tmpdir(), `rust_${Date.now()}`)
    fs.mkdirSync(tmpDir, { recursive: true })

    const rsFile = path.join(tmpDir, 'main.rs')
    fs.writeFileSync(rsFile, code, 'utf-8')

    exec(`rustc "${rsFile}" -o "${tmpDir}/main" && "${tmpDir}/main"`, { timeout, cwd: tmpDir }, (error, stdout, stderr) => {
      fs.rmSync(tmpDir, { recursive: true, force: true })

      resolve({
        success: !error,
        output: stdout || '(no output)',
        error: stderr || (error ? error.message : ''),
        time: Date.now() - start
      })
    })
  })
}

export function setupCodeRunnerHandlers(): void {
  ipcMain.handle('code:runJs', async (_event, code: string, timeout?: number) => {
    return runJavaScript(code, timeout)
  })

  ipcMain.handle('code:runPython', async (_event, code: string, timeout?: number) => {
    return runPython(code, timeout)
  })

  ipcMain.handle('code:runGo', async (_event, code: string, timeout?: number) => {
    return runGo(code, timeout)
  })

  ipcMain.handle('code:runJava', async (_event, code: string, timeout?: number) => {
    return runJava(code, timeout)
  })

  ipcMain.handle('code:runRust', async (_event, code: string, timeout?: number) => {
    return runRust(code, timeout)
  })
}
