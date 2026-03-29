/**
 * 环境验证脚本
 * 用于验证打包后的应用是否能找到 openclaw 命令
 */

const { exec, spawn } = require('child_process')
const os = require('os')
const path = require('path')

console.log('🔍 验证 OpenClaw 环境配置...\n')

/**
 * 获取用户环境
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
        resolve(process.env)
      }
    })

    loginShell.on('error', () => {
      resolve(process.env)
    })
  })
}

/**
 * 查找命令位置
 */
function whichCommand(command, env) {
  return new Promise((resolve) => {
    const paths = (env.PATH || '').split(path.delimiter)
    let found = null

    for (const p of paths) {
      const cmdPath = path.join(p, command)
      try {
        // 检查文件是否存在且可执行
        if (require('fs').existsSync(cmdPath)) {
          found = cmdPath
          break
        }
      } catch (err) {
        // 忽略错误
      }
    }

    resolve(found)
  })
}

/**
 * 主验证流程
 */
async function verify() {
  try {
    // 1. 显示系统信息
    console.log('📋 系统信息:')
    console.log(`  平台: ${os.platform()}`)
    
    // 检测真实硬件架构
    let arch = os.arch()
    const processorIdentifier = process.env.PROCESSOR_IDENTIFIER || ''
    const processorArch = process.env.PROCESSOR_ARCHITECTURE || ''
    
    console.log(`  Node.js 报告架构: ${arch}`)
    console.log(`  PROCESSOR_IDENTIFIER: ${processorIdentifier}`)
    console.log(`  PROCESSOR_ARCHITECTURE: ${processorArch}`)
    
    // 检查是否是 ARM64 硬件
    const isArmHardware = processorIdentifier.toLowerCase().includes('arm') ||
                         processorIdentifier.toLowerCase().includes('armv8') ||
                         processorIdentifier.toLowerCase().includes('aarch64')
    
    const isArmArch = processorArch.toLowerCase() === 'arm64' ||
                     processorArch.toLowerCase() === 'aarch64'
    
    if (isArmHardware || isArmArch) {
      console.log(`\n🔍 检测到 ARM64 硬件架构`)
      console.log(`  真实硬件: ARM64`)
      console.log(`  Node.js 运行模式: ${arch === 'x64' ? 'x64 兼容模式' : '原生 ARM64'}`)
      console.log(`  💡 提示: 如需构建 ARM64 版本，请设置 FORCE_ARCH=arm64`)
    }
    // 检测 M芯片 Mac Windows 虚拟机
    else {
      const hostname = os.hostname().toLowerCase()
      const isLikelyAppleSiliconVM = os.platform() === 'win32' && (
        hostname.includes('mac') || 
        hostname.includes('apple') ||
        process.env.APPLE_SILICON_VM === 'true' ||
        process.env.MAC_ARM_WINDOWS_VM === 'true'
      )
      
      if (isLikelyAppleSiliconVM && arch === 'x64') {
        console.log(`\n🔍 检测到 M芯片 Mac Windows 虚拟机环境`)
        console.log(`  实际硬件为 ARM64 (Apple Silicon)`)
      }
    }
    
    console.log(`\n  主机名: ${os.hostname()}`)
    console.log(`  Shell: ${process.env.SHELL || '/bin/zsh'}`)
    console.log()

    // 2. 获取用户环境
    console.log('🔧 获取用户环境...')
    const userEnv = await getUserEnv()
    console.log(`  ✓ 环境 PATH: ${userEnv.PATH}`)
    console.log()

    // 3. 查找 openclaw 命令
    console.log('🔍 查找 OpenClaw 命令...')
    const openclawPath = await whichCommand('openclaw', userEnv)

    if (openclawPath) {
      console.log(`  ✓ 找到 OpenClaw: ${openclawPath}`)
      console.log()

      // 4. 测试命令
      console.log('🧪 测试 OpenClaw 命令...')
      exec('openclaw --version', {
        env: { ...userEnv, PATH: userEnv.PATH },
        shell: userEnv.SHELL || '/bin/zsh',
        timeout: 5000
      }, (error, stdout, stderr) => {
        if (!error) {
          console.log(`  ✓ OpenClaw 版本: ${stdout.trim()}`)
          console.log('\n✅ 环境验证通过！应用应该能正常工作。\n')
        } else {
          console.log(`  ✗ 错误: ${stderr || error.message}`)
          console.log('\n⚠️  OpenClaw 已安装但执行失败，请检查安装。\n')
        }
        process.exit(0)
      })
    } else {
      console.log('  ✗ 未找到 OpenClaw 命令')
      console.log()
      console.log('❌ OpenClaw 未安装或不在 PATH 中！')
      console.log()
      console.log('📝 解决方法:')
      console.log('  1. 安装 OpenClaw:')
      console.log('     curl -fsSL https://openclaw.ai/install.sh | bash')
      console.log()
      console.log('  2. 重启终端或应用')
      console.log()
      console.log('  3. 验证安装:')
      console.log('     which openclaw')
      console.log()
      process.exit(1)
    }
  } catch (error) {
    console.error(`\n❌ 验证过程出错: ${error.message}\n`)
    process.exit(1)
  }
}

verify()
