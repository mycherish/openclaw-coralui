# OpenClaw CoralUI 生产启动脚本
Write-Host "正在启动 OpenClaw CoralUI 生产环境..." -ForegroundColor Green
Write-Host ""
Write-Host "提示: 请先运行 'npm run build' 构建项目" -ForegroundColor Yellow
Write-Host ""

# 设置环境变量为生产模式
$env:NODE_ENV = "production"

# 启动 Electron
npx electron .
