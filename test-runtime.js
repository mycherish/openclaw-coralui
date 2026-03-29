// 测试运行时环境功能
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

// 模拟 app.getPath
if (!app) {
  global.app = {
    getPath: (name) => {
      if (name === 'userData') {
        return path.join(process.env.APPDATA || process.env.HOME, 'openclaw-coralui-test')
      }
      return path.join(process.env.APPDATA || process.env.HOME, 'openclaw-coralui-test')
    }
  }
}

// 导入我们修改的函数
const { getRuntimePath } = require('./electron/main.js')

console.log('测试运行时环境路径...')
const runtimeDir = getRuntimePath()
console.log('运行时目录:', runtimeDir)

// 检查目录是否创建成功
if (fs.existsSync(runtimeDir)) {
  console.log('✅ 运行时目录创建成功')
} else {
  console.log('❌ 运行时目录创建失败')
}

// 清理测试目录
try {
  if (fs.existsSync(runtimeDir)) {
    fs.rmSync(runtimeDir, { recursive: true, force: true })
    console.log('✅ 测试目录已清理')
  }
} catch (err) {
  console.log('清理失败:', err.message)
}