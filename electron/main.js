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
 * 获取用户 shell 环境变量
 * 在 macOS/Linux 上，加载 ~/.zshrc 或 ~/.bashrc
 */
function getUserEnv() {
  return new Promise((resolve) => {
    const shell = process.env.SHELL || '/bin/zsh'
    const loginShell = spawn(shell, ['-ilc', 'env'], {
      env: { ...process.env }
    })

    let output = ''
    loginShell.stdout.on('data', (data) => {
      output += data.toString()
    })

    loginShell.on('close', (code) => {
      if (code === 0 && output) {
        // 解析环境变量
        const envLines = output.split('\n').filter(line => line.includes('='))
        const env = {}
        for (const line of envLines) {
          const [key, ...valueParts] = line.split('=')
          if (key && valueParts.length > 0) {
            env[key] = valueParts.join('=')
          }
        }
        resolve(env)
      } else {
        // 如果失败，使用当前环境
        resolve(process.env)
      }
    })

    loginShell.on('error', () => {
      resolve(process.env)
    })
  })
}

/**
 * 执行命令的通用函数
 * @param {string} command - 要执行的命令
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise} 返回执行结果
 */
async function executeCommand(command, timeout = 10000) {
  try {
    // 获取用户环境（包含 PATH）
    const env = await getUserEnv()

    // 根据平台选择合适的 shell
    const platform = process.platform
    let shell
    if (platform === 'win32') {
      // Windows 使用 PowerShell
      shell = 'powershell.exe'
    } else {
      // macOS/Linux 使用 zsh 或 bash
      shell = process.env.SHELL || (platform === 'darwin' ? '/bin/zsh' : '/bin/bash')
    }

    return new Promise((resolve) => {
      const childProcess = exec(command, {
        timeout,
        env: { ...env, PATH: env.PATH }, // 确保使用用户的 PATH
        shell: shell // 使用平台特定的 shell
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout || stderr || (error ? error.message : '')
        })
      })

      // 处理超时
      childProcess.on('error', (error) => {
        resolve({
          success: false,
          output: `命令执行失败: ${error.message}`
        })
      })

      // 处理超时
      childProcess.on('timeout', () => {
        childProcess.kill()
        resolve({
          success: false,
          output: '命令执行超时'
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      output: `执行命令时出错: ${error.message}`
    }
  }
}

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
ipcMain.handle('check-openclaw-installed', async () => {
  const result = await executeCommand('openclaw --version')
  if (result.success) {
    // 解析版本号
    const versionMatch = result.output.match(/(\d+\.\d+\.\d+)/)
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : 'unknown'
    }
  } else {
    return {
      installed: false,
      error: result.output
    }
  }
})

/**
 * 获取 Gateway 状态
 */
ipcMain.handle('get-gateway-status', async () => {
  const result = await executeCommand('openclaw gateway status', 10000)
  
  // 解析状态
  let gatewayStatus = 'unknown'
  const outputLower = result.output.toLowerCase()
  
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

  return {
    status: gatewayStatus,
    output: result.output
  }
})

/**
 * 获取完整系统状态（包括健康检查）
 */
ipcMain.handle('get-health-status', async () => {
  const result = await executeCommand('openclaw health', 10000)
  return {
    healthy: result.success,
    output: result.output
  }
})

/**
 * 安装 OpenClaw（一键脚本方式）
 */
ipcMain.handle('install-openclaw', async (event, method) => {
  // 根据平台选择合适的安装命令
  let command
  const platform = process.platform
  
  switch (method) {
    case 'script':
      if (platform === 'win32') {
        // Windows 使用 PowerShell 安装（创建临时脚本文件）
        // 这样可以避免多层引号嵌套问题
        command = `powershell -Command "$tempScript = [System.IO.Path]::GetTempFileName() + '.ps1'; Set-Content -Path $tempScript -Value 'irm https://openclaw.ai/install.ps1 | iex'; Start-Process PowerShell -Verb RunAs -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $tempScript; Start-Sleep -Seconds 1; Remove-Item -Path $tempScript -Force"`
      } else if (platform === 'darwin') {
        // macOS 使用 curl
        command = 'curl -fsSL https://openclaw.ai/install.sh | bash'
      } else {
        // Linux 使用 curl
        command = 'curl -fsSL https://openclaw.ai/install.sh | bash'
      }
      break
      
    case 'npm':
      command = 'npm i -g openclaw'
      break
      
    case 'pnpm':
      command = 'pnpm i -g openclaw'
      break
      
    default:
      return {
        success: false,
        output: '不支持的安装方法'
      }
  }

  return await executeCommand(command, 60000) // 安装可能需要更长时间
})

/**
 * 启动 Gateway
 */
ipcMain.handle('start-gateway', async () => {
  return await executeCommand('openclaw gateway start')
})

/**
 * 停止 Gateway
 */
ipcMain.handle('stop-gateway', async () => {
  return await executeCommand('openclaw gateway stop')
})

/**
 * 重启 Gateway
 */
ipcMain.handle('restart-gateway', async () => {
  return await executeCommand('openclaw gateway restart')
})

/**
 * 卸载 OpenClaw
 */
ipcMain.handle('uninstall-openclaw', async (event, level) => {
  // level: 'service' | 'state' | 'workspace' | 'all'
  const commands = {
    'service': 'openclaw uninstall --service --yes',
    'state': 'openclaw uninstall --state --yes',
    'workspace': 'openclaw uninstall --workspace --yes',
    'all': 'openclaw uninstall --all --yes'
  }

  const command = commands[level] || commands['all']
  return await executeCommand(command)
})

/**
 * 获取日志（最近 20 行）
 */
ipcMain.handle('get-logs', async () => {
  const result = await executeCommand('openclaw logs --lines 20')
  return {
    success: result.success,
    logs: result.output
  }
})

/**
 * 获取节点状态
 */
ipcMain.handle('get-nodes-status', async () => {
  return await executeCommand('openclaw nodes status', 10000)
})

/**
 * 获取模型状态
 */
ipcMain.handle('get-models-status', async () => {
  return await executeCommand('openclaw models status', 10000)
})

/**
 * 获取渠道状态
 */
ipcMain.handle('get-channels-status', async () => {
  return await executeCommand('openclaw channels status', 10000)
})
