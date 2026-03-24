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
    console.log(`  架构: ${os.arch()}`)
    console.log(`  主机名: ${os.hostname()}`)
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
