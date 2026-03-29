const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec, spawn } = require('child_process')
const os = require('os')
const fs = require('fs')
const https = require('https')
const { extract } = require('adm-zip')

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
 * 获取内置 Node.js 的存放路径
 * 放在 AppData/Roaming/你的应用名/runtime 下
 */
const getRuntimePath = () => {
  const runtimeDir = path.join(app.getPath('userData'), 'runtime')
  if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true })
  return runtimeDir
}

/**
 * 辅助函数：下载文件
 */
function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (res) => {
      const totalSize = parseInt(res.headers['content-length'], 10)
      let downloadedSize = 0

      res.on('data', (chunk) => {
        downloadedSize += chunk.length
        if (onProgress) onProgress(Math.round((downloadedSize / totalSize) * 100))
      })

      res.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', reject)
  })
}

/**
 * 解码输出（处理 Windows GBK 编码）
 * @param {Buffer|string} data - 输出数据
 * @returns {string} 解码后的字符串
 */
function decodeOutput(data) {
  if (!data) return ''
  
  try {
    const iconv = require('iconv-lite')
    return iconv.decode(Buffer.from(data), 'gbk')
  } catch (e) {
    // 如果 iconv-lite 不可用，使用默认转换
    return Buffer.from(data).toString('utf8')
  }
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
    const platform = process.platform

    // 检查是否有内置 Node.js 环境
    const runtimeDir = getRuntimePath()
    const internalNodePath = path.join(runtimeDir, 'node-v20.11.1-win-x64')
    const nodeExe = path.join(internalNodePath, 'node.exe')

    // 如果内置 Node 存在，将其加入临时环境变量 PATH 的最前面
    if (fs.existsSync(nodeExe)) {
      // 关键：将内置 Node 路径注入到当前执行环境的 PATH 中
      const delimiter = process.platform === 'win32' ? ';' : ':'
      env.PATH = `${internalNodePath}${delimiter}${env.PATH}`
    }

    let finalCommand
    let options = {
      timeout,
      env: { 
        ...env, 
        PATH: env.PATH,
        // Windows 下强制使用 UTF-8 编码
        ...(platform === 'win32' ? {
          'PYTHONIOENCODING': 'utf-8',
          'NODE_OPTIONS': '--no-warnings'
        } : {}),
        encoding: platform === 'win32' ? 'buffer' : 'utf8'
      }
    }

    if (platform === 'win32') {
      // Windows 平台：手动构建 PowerShell 启动指令
      // 1. 不在 options 里写 shell: 'powershell.exe'
      // 2. 使用 -NoProfile (不加载用户配置) 和 -ExecutionPolicy Bypass (跳过权限检查)
      // 3. 对原命令中的双引号进行转义，PowerShell 使用 ` 作为转义符
      const escapedCommand = command.replace(/"/g, '`"')
      finalCommand = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "${escapedCommand}"`
    } else {
      // macOS/Linux 平台：使用系统 shell
      finalCommand = command
      options.shell = process.env.SHELL || (platform === 'darwin' ? '/bin/zsh' : '/bin/bash')
    }

    return new Promise((resolve) => {
      const childProcess = exec(finalCommand, options, (error, stdout, stderr) => {
        let output = ''
        
        // Windows 下处理编码
        if (platform === 'win32') {
          output = decodeOutput(stdout || stderr)
        } else {
          output = stdout || stderr || ''
        }
        
        resolve({
          success: !error,
          output: output || (error ? error.message : '')
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
  let arch = os.arch()
  const platform = os.platform()
  
  // 1. 优先使用用户指定的架构
  if (process.env.FORCE_ARCH) {
    console.log(`🔧 使用用户指定架构: ${process.env.FORCE_ARCH}`)
    arch = process.env.FORCE_ARCH
  }
  // 2. 检测真正的 ARM64 架构（即使在 x64 兼容模式下）
  else if (platform === 'win32') {
    // 检查 PROCESSOR_IDENTIFIER 环境变量
    const processorIdentifier = process.env.PROCESSOR_IDENTIFIER || ''
    const processorArch = process.env.PROCESSOR_ARCHITECTURE || ''
    
    // 如果 PROCESSOR_IDENTIFIER 包含 ARM 相关关键词，说明是 ARM64 硬件
    const isArmHardware = processorIdentifier.toLowerCase().includes('arm') ||
                         processorIdentifier.toLowerCase().includes('armv8') ||
                         processorIdentifier.toLowerCase().includes('aarch64')
    
    // 如果 PROCESSOR_ARCHITECTURE 是 ARM64，直接使用
    const isArmArch = processorArch.toLowerCase() === 'arm64' ||
                     processorArch.toLowerCase() === 'aarch64'
    
    if (isArmHardware || isArmArch) {
      console.log('🔍 检测到 ARM64 硬件架构')
      console.log(`  PROCESSOR_IDENTIFIER: ${processorIdentifier}`)
      console.log(`  PROCESSOR_ARCHITECTURE: ${processorArch}`)
      console.log(`  Node.js 报告: ${arch}`)
      
      // 如果是 ARM 硬件但 Node.js 报告 x64，说明在兼容模式下运行
      if (arch === 'x64' && (isArmHardware || isArmArch)) {
        arch = 'arm64 (x64 兼容模式)'
      } else if (isArmArch) {
        arch = 'arm64'
      }
    }
    // 3. 检测 M芯片 Mac Windows 虚拟机
    else {
      const hostname = os.hostname().toLowerCase()
      const isLikelyAppleSiliconVM = 
        hostname.includes('mac') || 
        hostname.includes('mackbook') || 
        hostname.includes('imac') ||
        hostname.includes('apple') ||
        process.env.APPLE_SILICON_VM === 'true' ||
        process.env.MAC_ARM_WINDOWS_VM === 'true'
      
      if (isLikelyAppleSiliconVM && arch === 'x64') {
        console.log('🔍 检测到 M芯片 Mac Windows 虚拟机环境')
        console.log('  系统报告 x64 架构，实际硬件为 ARM64')
        arch = 'arm64 (Apple Silicon)'
      }
    }
  }
  
  return {
    platform: platform,
    arch: arch,
    hostname: os.hostname(),
    version: os.release(),
  }
})

/**
 * 核心逻辑：一键静默准备 Node 环境
 */
async function prepareRuntime(event) {
  const runtimeDir = getRuntimePath()
  const nodeExePath = path.join(runtimeDir, 'node-v20.11.1-win-x64', 'node.exe')

  // 1. 检查是否已存在
  if (fs.existsSync(nodeExePath)) {
    return { success: true, message: '环境已就绪', path: nodeExePath }
  }

  if (event) {
    event.sender.send('install-output', '正在从国内镜像源下载免安装版 Node.js...\n')
  }

  // 2. 下载 (使用华为云镜像，速度极快且稳定)
  const downloadUrl = 'https://mirrors.huaweicloud.com/nodejs/v20.11.1/node-v20.11.1-win-x64.zip'
  const zipPath = path.join(runtimeDir, 'node.zip')

  try {
    let lastReportedProgress = 0
    await downloadFile(downloadUrl, zipPath, (progress) => {
      if (event) {
        // 只在每 10% 的进度点输出，避免刷屏
        const progressInt = Math.floor(progress / 10) * 10
        if (progressInt > lastReportedProgress && progressInt % 10 === 0) {
          lastReportedProgress = progressInt
          event.sender.send('install-output', `📥 下载进度: ${progressInt}%\n`)
        }
      }
    })

    if (event) {
      event.sender.send('install-output', '✅ 下载完成，正在解压...\n')
    }

    // 3. 解压 (调用 PowerShell 解压，无需额外依赖)
    const unzipCmd = `powershell.exe -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${runtimeDir}' -Force"`
    await executeCommand(unzipCmd)

    // 4. 清理
    fs.unlinkSync(zipPath)

    return { success: true, output: 'Node 环境集成成功！' }
  } catch (err) {
    return { success: false, output: `集成失败: ${err.message}` }
  }
}

/**
 * IPC handler: 准备运行时环境
 */
ipcMain.handle('prepare-runtime', async (event) => {
  return await prepareRuntime(event)
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
 * 安装 OpenClaw - 实时输出版本
 * Windows: 无网络依赖安装（自动准备 Node.js 环境，使用国内镜像）
 * macOS/Linux: 使用 curl 安装脚本
 * 其他方式：npm/pnpm（需要用户已安装相应环境）
 */
ipcMain.handle('install-openclaw', async (event, method) => {
  try {
    const platform = process.platform
    
    // 国内镜像源列表（按优先级）
    const mirrors = [
      { name: '淘宝镜像', url: 'https://registry.npmmirror.com' },
      { name: '腾讯云镜像', url: 'https://mirrors.cloud.tencent.com/npm/' },
      { name: '华为云镜像', url: 'https://repo.huaweicloud.com/repository/npm/' }
    ]
    
    // 检测网络环境并选择镜像源
    let selectedRegistry = null
    event.sender.send('install-output', '🔍 正在检测网络环境...\n')
    
    // 简单的网络检测：尝试连接镜像源
    const testMirror = (url) => {
      return new Promise((resolve) => {
        const https = require('https')
        const req = https.get(`${url}/openclaw`, { 
          timeout: 3000,
          rejectUnauthorized: false // 允许自签名证书
        }, (res) => {
          resolve(res.statusCode === 200 || res.statusCode === 404) // 404 也算成功（说明镜像源可访问）
        })
        req.on('error', () => resolve(false))
        req.on('timeout', () => {
          req.destroy()
          resolve(false)
        })
      })
    }
    
    // 测试镜像源速度
    for (const mirror of mirrors) {
      const isAccessible = await testMirror(mirror.url)
      if (isAccessible) {
        selectedRegistry = mirror
        event.sender.send('install-output', `✅ 使用${mirror.name}加速下载\n\n`)
        break
      }
    }
    
    if (!selectedRegistry) {
      event.sender.send('install-output', 'ℹ️ 使用官方源下载\n\n')
    }
    
    let command, args
    
    switch (method) {
      case 'script':
        // 使用内置环境安装方案（无网络依赖）
        if (platform === 'win32') {
          event.sender.send('install-output', '🚀 开始无网络依赖安装...\n\n')
          event.sender.send('install-output', '📦 此方式无需用户安装 Node.js，将自动准备运行环境\n')
          event.sender.send('install-output', '📦 使用国内镜像源，避免网络连接问题\n\n')
          
          // 1. 先准备运行时环境
          event.sender.send('install-output', '🔄 准备 Node.js 运行环境...\n')
          const runtimeResult = await prepareRuntime(event)
          if (!runtimeResult.success) {
            return { 
              success: false, 
              output: `准备运行时环境失败: ${runtimeResult.output}` 
            }
          }
          
          event.sender.send('install-output', '✅ Node.js 环境准备完成\n\n')
          event.sender.send('install-output', '📥 安装 OpenClaw CLI...\n')
          
          // 2. 使用内置环境安装 openclaw
          command = 'npm.cmd'
          args = ['install', '-g', 'openclaw']
          if (selectedRegistry) {
            args.push('--registry', selectedRegistry.url)
          }
        } else {
          // macOS/Linux 使用 curl
          event.sender.send('install-output', '📦 使用安装脚本...\n\n')
          command = process.env.SHELL || '/bin/bash'
          args = ['-c', 'curl -fsSL https://get.openclaw.app/script/mac | sh']
        }
        break
        
      case 'npm':
        // 使用系统 npm 安装（需要用户已安装 Node.js）
        event.sender.send('install-output', '📦 使用 npm 安装（需要已安装 Node.js）...\n\n')
        if (platform === 'win32') {
          command = 'npm.cmd'
        } else {
          command = 'npm'
        }
        args = ['install', '-g', 'openclaw']
        if (selectedRegistry) {
          args.push('--registry', selectedRegistry.url)
        }
        break
        
      case 'pnpm':
        // pnpm 安装（需要用户已安装 pnpm）
        event.sender.send('install-output', '📦 使用 pnpm 安装（需要已安装 pnpm）...\n\n')
        if (platform === 'win32') {
          command = 'pnpm.cmd'
        } else {
          command = 'pnpm'
        }
        args = ['install', '-g', 'openclaw']
        if (selectedRegistry) {
          args.push('--registry', selectedRegistry.url)
        }
        break
        
      default:
        return {
          success: false,
          output: '不支持的安装方法'
        }
    }

    return new Promise((resolve) => {
      // 对于 PowerShell 命令，不需要 shell 包装
      const useShell = platform === 'win32' && method !== 'script'
      
      const childProcess = spawn(command, args, {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: useShell, // 只有非 PowerShell 脚本才使用 shell
        env: { 
          ...process.env,
          // Windows 下强制使用 UTF-8 编码
          ...(platform === 'win32' ? {
            'PYTHONIOENCODING': 'utf-8',
            'NODE_OPTIONS': '--no-warnings'
          } : {})
        }
      })

      let output = ''

      childProcess.stdout.on('data', (data) => {
        let text = data.toString()
        // Windows 下处理编码问题
        if (platform === 'win32') {
          text = decodeOutput(data)
        }
        output += text
        event.sender.send('install-output', text)
      })

      childProcess.stderr.on('data', (data) => {
        let text = data.toString()
        // Windows 下处理编码问题
        if (platform === 'win32') {
          text = decodeOutput(data)
        }
        output += text
        event.sender.send('install-output', text)
      })

      childProcess.on('close', async (code) => {
        const isSuccess = code === 0
        let finalOutput = output || '安装完成'
        
        // 如果是 Windows 内置环境安装，立即验证安装
        if (isSuccess && method === 'script' && platform === 'win32') {
          event.sender.send('install-output', '\n🔍 验证安装...\n')
          
          // 使用内置环境验证安装
          const verifyResult = await executeCommand('openclaw --version', 5000)
          if (verifyResult.success) {
            const version = verifyResult.output.trim()
            finalOutput += `\n\n✅ OpenClaw 安装成功！\n📦 版本: ${version}\n🎉 现在可以使用所有功能了！`
            resolve({
              success: true,
              output: finalOutput,
              installed: true,
              version: version
            })
          } else {
            finalOutput += '\n\n✅ OpenClaw 安装完成\n⚠️ 但验证失败，请重启应用程序。'
            resolve({
              success: true,
              output: finalOutput,
              installed: false
            })
          }
        } else {
          resolve({
            success: isSuccess,
            output: finalOutput
          })
        }
      })

      childProcess.on('error', (error) => {
        let errorMsg = `安装失败: ${error.message}\n`
        if (method === 'npm' || method === 'pnpm') {
          errorMsg += '请确保已安装 Node.js 和 npm'
        }
        resolve({
          success: false,
          output: errorMsg
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      output: `执行安装时出错: ${error.message}`
    }
  }
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
 * 卸载 OpenClaw - 使用系统 Node.js 完整卸载
 */
ipcMain.handle('uninstall-openclaw', async (event, level) => {
  try {
    const platform = process.platform
    
    // 构建卸载命令序列
    const commands = []
    
    // 第一步：执行 openclaw 内部卸载
    const openclawCommands = {
      'service': 'openclaw uninstall --service --yes',
      'state': 'openclaw uninstall --state --yes',
      'workspace': 'openclaw uninstall --workspace --yes',
      'all': 'openclaw uninstall --all --yes'
    }
    commands.push({
      type: 'openclaw',
      cmd: openclawCommands[level] || openclawCommands['all']
    })
    
    // 第二步：检测并卸载 CLI
    if (level === 'all') {
      // 检测 npm 全局安装
      const npmCheck = await new Promise((resolve) => {
        exec(platform === 'win32' ? 'npm.cmd list -g openclaw --depth=0' : 'npm list -g openclaw --depth=0', (error, stdout) => {
          resolve(!error && stdout.includes('openclaw@'))
        })
      })
      
      if (npmCheck) {
        commands.push({
          type: 'npm',
          cmd: platform === 'win32' ? 'npm.cmd' : 'npm',
          args: ['uninstall', '-g', 'openclaw']
        })
      } else {
        // 检测 pnpm 全局安装
        const pnpmCheck = await new Promise((resolve) => {
          exec(platform === 'win32' ? 'pnpm.cmd list -g openclaw --depth=0' : 'pnpm list -g openclaw --depth=0', (error, stdout) => {
            resolve(!error && stdout.includes('openclaw@'))
          })
        })
        
        if (pnpmCheck) {
          commands.push({
            type: 'pnpm',
            cmd: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
            args: ['uninstall', '-g', 'openclaw']
          })
        }
      }
    }
    
    // 执行命令序列
    let fullOutput = ''
    
    for (const command of commands) {
      if (command.type === 'openclaw') {
        // 执行 openclaw 命令
        event.sender.send('uninstall-output', `\n> 执行: ${command.cmd}\n`)
        
        let shell, args
        if (platform === 'win32') {
          shell = 'powershell.exe'
          args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command.cmd]
        } else {
          shell = process.env.SHELL || '/bin/bash'
          args = ['-c', command.cmd]
        }

        const result = await new Promise((resolve) => {
          const childProcess = spawn(shell, args, {
            env: { 
              ...process.env, 
              PATH: process.env.PATH,
              // Windows 下强制使用 UTF-8 编码
              ...(platform === 'win32' ? {
                'PYTHONIOENCODING': 'utf-8',
                'NODE_OPTIONS': '--no-warnings'
              } : {})
            },
            cwd: process.cwd(),
            stdio: ['ignore', 'pipe', 'pipe']
          })

          let output = ''

          childProcess.stdout.on('data', (data) => {
            let text = data.toString()
            // Windows 下处理编码问题
            if (platform === 'win32') {
              try {
                const iconv = require('iconv-lite')
                text = iconv.decode(Buffer.from(data), 'gbk')
              } catch (e) {
                text = data.toString('utf8')
              }
            }
            output += text
            event.sender.send('uninstall-output', text)
          })

          childProcess.stderr.on('data', (data) => {
            let text = data.toString()
            // Windows 下处理编码问题
            if (platform === 'win32') {
              try {
                const iconv = require('iconv-lite')
                text = iconv.decode(Buffer.from(data), 'gbk')
              } catch (e) {
                text = data.toString('utf8')
              }
            }
            output += text
            event.sender.send('uninstall-output', text)
          })

          childProcess.on('close', (code) => {
            resolve({ code, output })
          })

          childProcess.on('error', (error) => {
            resolve({ code: 1, output: `执行失败: ${error.message}` })
          })
        })

        fullOutput += result.output + '\n'
        
        if (result.code !== 0) {
          return {
            success: false,
            output: fullOutput
          }
        }
      } else {
        // 执行 npm/pnpm 卸载命令
        event.sender.send('uninstall-output', `\n> 执行: ${command.type} uninstall -g openclaw\n`)
        
        const result = await new Promise((resolve) => {
          const childProcess = spawn(command.cmd, command.args, {
            cwd: process.cwd(),
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: platform === 'win32',
            env: {
              ...process.env,
              // Windows 下强制使用 UTF-8 编码
              ...(platform === 'win32' ? {
                'PYTHONIOENCODING': 'utf-8',
                'NODE_OPTIONS': '--no-warnings'
              } : {})
            }
          })

          let output = ''

          childProcess.stdout.on('data', (data) => {
            const text = platform === 'win32' ? decodeOutput(data) : data.toString()
            output += text
            event.sender.send('uninstall-output', text)
          })

          childProcess.stderr.on('data', (data) => {
            const text = platform === 'win32' ? decodeOutput(data) : data.toString()
            output += text
            event.sender.send('uninstall-output', text)
          })

          childProcess.on('close', (code) => {
            resolve({ code, output })
          })

          childProcess.on('error', (error) => {
            resolve({ code: 1, output: `执行失败: ${error.message}` })
          })
        })

        fullOutput += result.output + '\n'
      }
    }
    
    return {
      success: true,
      output: fullOutput + '\n✅ 卸载完成！'
    }
  } catch (error) {
    return {
      success: false,
      output: `执行卸载时出错: ${error.message}`
    }
  }
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

/**
 * 检查 npm 版本
 */
ipcMain.handle('check-npm-version', async () => {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return await executeCommand(`${npmCmd} --version`, 5000)
})

/**
 * 检查 pnpm 版本
 */
ipcMain.handle('check-pnpm-version', async () => {
  const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  return await executeCommand(`${pnpmCmd} --version`, 5000)
})

