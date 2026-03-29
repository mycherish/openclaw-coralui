/**
 * 检测真实系统架构，特别处理 M芯片 Mac 上的 Windows 虚拟机环境
 */

const os = require('os')
const fs = require('fs')
const { execSync, exec } = require('child_process')

/**
 * 检测是否运行在 M芯片 Mac 的 Windows 虚拟机上
 */
function isAppleSiliconWindowsVM() {
  try {
    const hostname = os.hostname().toLowerCase()
    const platform = os.platform()
    const reportedArch = os.arch()
    
    // 1. 检查主机名特征
    const macKeywords = ['mac', 'mackbook', 'imac', 'macpro', 'macmini', 'apple']
    const vmKeywords = ['parallels', 'vmware', 'virtualbox', 'utm', 'qemu', 'vm-', '-vm']
    
    const hasMacKeyword = macKeywords.some(keyword => hostname.includes(keyword))
    const hasVMKeyword = vmKeywords.some(keyword => hostname.includes(keyword))
    
    // 2. 检查环境变量
    const envVars = [
      'VIRTUALIZATION',
      'VIRTUAL_MACHINE',
      'VMWARE', 
      'PARALLELS',
      'QEMU',
      'HYPERV'
    ]
    
    const hasVMEnvVar = envVars.some(varName => {
      const value = process.env[varName]
      return value && (value.toLowerCase().includes('apple') || 
                      value.toLowerCase().includes('silicon') ||
                      value.toLowerCase().includes('m1') ||
                      value.toLowerCase().includes('m2') ||
                      value.toLowerCase().includes('m3'))
    })
    
    // 3. 检查系统信息文件（如果存在）
    let systemInfo = ''
    try {
      if (platform === 'win32') {
        // Windows 上检查系统信息
        const systemInfoCmd = 'systeminfo'
        systemInfo = execSync(systemInfoCmd, { encoding: 'utf8', stdio: 'pipe' }).toLowerCase()
      }
    } catch (error) {
      // 忽略错误
    }
    
    // 4. 组合判断逻辑
    const indicators = []
    
    // 指标1: Windows 平台但主机名包含 Mac 关键词
    if (platform === 'win32' && hasMacKeyword) {
      indicators.push('windows_with_mac_hostname')
    }
    
    // 指标2: 包含虚拟机关键词
    if (hasVMKeyword) {
      indicators.push('vm_keyword_in_hostname')
    }
    
    // 指标3: 虚拟机环境变量
    if (hasVMEnvVar) {
      indicators.push('vm_environment_variable')
    }
    
    // 指标4: 系统信息中包含虚拟机关键词
    if (systemInfo.includes('parallels') || systemInfo.includes('vmware') || 
        systemInfo.includes('virtual machine') || systemInfo.includes('hyper-v')) {
      indicators.push('vm_in_systeminfo')
    }
    
    // 指标5: 用户手动指定
    if (process.env.APPLE_SILICON_WINDOWS_VM === 'true') {
      indicators.push('user_specified')
    }
    
    // 如果有2个或更多指标，认为是 M芯片 Mac 上的 Windows 虚拟机
    const isLikelyAppleSiliconVM = indicators.length >= 2
    
    if (isLikelyAppleSiliconVM) {
      console.log(`🔍 检测到 M芯片 Mac Windows 虚拟机指标: ${indicators.join(', ')}`)
    }
    
    return isLikelyAppleSiliconVM
  } catch (error) {
    console.warn('检测 M芯片 Mac Windows 虚拟机时出错:', error.message)
    return false
  }
}

/**
 * 获取真实架构
 */
function getRealArchitecture() {
  const reportedArch = os.arch()
  const isAppleSiliconVM = isAppleSiliconWindowsVM()
  
  if (isAppleSiliconVM) {
    console.log('\n🔍 检测到运行在 M芯片 Mac 的 Windows 虚拟机上')
    console.log(`  系统报告架构: ${reportedArch}`)
    console.log(`  真实硬件架构: ARM64 (Apple Silicon)`)
    
    // 优先使用环境变量指定的架构
    if (process.env.FORCE_ARCH) {
      console.log(`  使用环境变量指定架构: ${process.env.FORCE_ARCH}`)
      return process.env.FORCE_ARCH
    }
    
    // 如果是构建命令，返回 arm64
    const isBuildCommand = process.argv.some(arg => 
      arg.includes('build') || arg.includes('electron:build') || arg.includes('--build')
    )
    
    if (isBuildCommand) {
      console.log('  构建模式: 使用 ARM64 架构')
      return 'arm64'
    }
    
    // 对于运行时显示
    return 'arm64 (Apple Silicon)'
  }
  
  // 正常情况
  return reportedArch
}

/**
 * 提供架构检测建议
 */
function getArchitectureRecommendation() {
  const platform = os.platform()
  const reportedArch = os.arch()
  const isAppleSiliconVM = isAppleSiliconWindowsVM()
  const realArch = getRealArchitecture()
  
  console.log('\n📊 架构检测报告')
  console.log('='.repeat(40))
  console.log(`  平台: ${platform}`)
  console.log(`  系统报告架构: ${reportedArch}`)
  console.log(`  检测到的真实架构: ${realArch}`)
  console.log(`  主机名: ${os.hostname()}`)
  console.log(`  是否 M芯片 Mac Windows 虚拟机: ${isAppleSiliconVM ? '是' : '否'}`)
  
  if (isAppleSiliconVM) {
    console.log('\n💡 环境检测与建议')
    console.log('-'.repeat(30))
    console.log('检测到你在 M芯片 Mac 上运行 Windows 虚拟机')
    console.log('在这种环境下，系统会报告 x64 架构，但实际硬件是 ARM64')
    
    console.log('\n🛠️ 解决方案:')
    console.log('1. 开发环境 (推荐):')
    console.log('   - 保持当前设置，使用默认的 x64 架构')
    console.log('   - 应用会正常运行，但架构显示为 x64')
    
    console.log('\n2. 构建指定 ARM64 版本:')
    console.log('   - 设置环境变量: FORCE_ARCH=arm64')
    console.log('   - 执行构建: npm run electron:build')
    console.log('   - 会生成 ARM64 版本的安装包')
    
    console.log('\n3. 手动指定架构:')
    console.log('   - 修改 electron/main.js 中的架构检测逻辑')
    console.log('   - 或者在 package.json 中指定构建架构')
  }
  
  return {
    platform,
    reportedArch,
    realArch,
    isAppleSiliconVM
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  getArchitectureRecommendation()
}

module.exports = {
  isAppleSiliconWindowsVM,
  getRealArchitecture,
  getArchitectureRecommendation
}