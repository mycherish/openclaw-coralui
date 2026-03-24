const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec, spawn } = require('child_process')
const os = require('os')

/**
 * Electron 主进程
 * 负责：窗口管理、系统调用、OpenClaw CLI 调用
 */

// 保持对窗口对象的全局引用
let mainWindow = null

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'OpenClaw CoralUI',
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset', // macOS 风格标题栏
    icon: path.join(__dirname, '../build/icon.png'), // 应用图标
  })

  // 开发模式加载 Vite 开发服务器，生产模式加载构建后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 应用程序准备就绪
 */
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭时退出应用（macOS 除外）
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================================================
// IPC 通信处理
// ============================================================================

/**
 * 获取系统信息
 */
ipcMain.handle('get-system-info', () => {
  return {
    platform: os.platform(), // 'darwin' | 'win32' | 'linux'
    arch: os.arch(),
    hostname: os.hostname(),
    version: os.release(),
  }
})

/**
 * 检查 OpenClaw 是否安装
 */
ipcMain.handle('check-openclaw-installed', () => {
  return new Promise((resolve) => {
    exec('openclaw --version', (error, stdout, stderr) => {
      if (error) {
        resolve({
          installed: false,
          error: stderr || error.message
        })
      } else {
        // 解析版本号
        const versionMatch = stdout.match(/(\d+\.\d+\.\d+)/)
        resolve({
          installed: true,
          version: versionMatch ? versionMatch[1] : 'unknown'
        })
      }
    })
  })
})

/**
 * 获取 Gateway 状态
 */
ipcMain.handle('get-gateway-status', () => {
  return new Promise((resolve) => {
    exec('openclaw gateway status', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          status: 'unknown',
          output: stderr || error.message
        })
      } else {
        // 解析状态
        let gatewayStatus = 'unknown'

        // 支持多种输出格式
        const outputLower = stdout.toLowerCase()
        
        // 检查运行中的标志
        if (outputLower.includes('runtime: running') ||
            outputLower.includes('running (pid') ||
            outputLower.includes('listening:') ||
            outputLower.includes('rpc probe: ok')) {
          gatewayStatus = 'running'
        }
        // 检查已停止的标志
        else if (outputLower.includes('runtime: stopped') ||
                 outputLower.includes('not running') ||
                 outputLower.includes('inactive') ||
                 outputLower.includes('service not found')) {
          gatewayStatus = 'stopped'
        }

        resolve({
          status: gatewayStatus,
          output: stdout
        })
      }
    })
  })
})

/**
 * 获取完整系统状态（包括健康检查）
 */
ipcMain.handle('get-health-status', () => {
  return new Promise((resolve) => {
    exec('openclaw health', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          healthy: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          healthy: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 安装 OpenClaw（一键脚本方式）
 */
ipcMain.handle('install-openclaw', async (event, method) => {
  const methods = {
    'script': 'curl -fsSL https://openclaw.ai/install.sh | bash',
    'npm': 'npm i -g openclaw',
    'pnpm': 'pnpm i -g openclaw'
  }

  const command = methods[method]
  if (!command) {
    return {
      success: false,
      error: '不支持的安装方法'
    }
  }

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 启动 Gateway
 */
ipcMain.handle('start-gateway', () => {
  return new Promise((resolve) => {
    exec('openclaw gateway start', (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 停止 Gateway
 */
ipcMain.handle('stop-gateway', () => {
  return new Promise((resolve) => {
    exec('openclaw gateway stop', (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 重启 Gateway
 */
ipcMain.handle('restart-gateway', () => {
  return new Promise((resolve) => {
    exec('openclaw gateway restart', (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 卸载 OpenClaw
 */
ipcMain.handle('uninstall-openclaw', (event, level) => {
  // level: 'service' | 'state' | 'workspace' | 'all'
  const commands = {
    'service': 'openclaw uninstall --service --yes',
    'state': 'openclaw uninstall --state --yes',
    'workspace': 'openclaw uninstall --workspace --yes',
    'all': 'openclaw uninstall --all --yes'
  }

  const command = commands[level] || commands['all']

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 获取日志（最近 20 行）
 */
ipcMain.handle('get-logs', () => {
  return new Promise((resolve) => {
    exec('openclaw logs --lines 20', (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          logs: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          logs: stdout
        })
      }
    })
  })
})

/**
 * 获取节点状态
 */
ipcMain.handle('get-nodes-status', () => {
  return new Promise((resolve) => {
    exec('openclaw nodes status', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 获取模型状态
 */
ipcMain.handle('get-models-status', () => {
  return new Promise((resolve) => {
    exec('openclaw models status', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})

/**
 * 获取渠道状态
 */
ipcMain.handle('get-channels-status', () => {
  return new Promise((resolve) => {
    exec('openclaw channels status', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stderr || error.message
        })
      } else {
        resolve({
          success: true,
          output: stdout
        })
      }
    })
  })
})
