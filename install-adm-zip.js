const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// 设置 Node.js 路径
const nodePath = 'C:\\Program Files\\nodejs'
process.env.PATH = `${nodePath};${process.env.PATH}`

console.log('正在安装 adm-zip...')

exec('npm install adm-zip', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('安装失败:', error)
    console.error(stderr)
    process.exit(1)
  }
  
  console.log('安装成功:', stdout)
  console.log('adm-zip 已安装')
  
  // 删除临时文件
  fs.unlinkSync(__filename)
})