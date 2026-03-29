# OpenClaw CoralUI 开发启动脚本
Write-Host "正在启动 OpenClaw CoralUI 开发环境..." -ForegroundColor Green
Write-Host ""
Write-Host "提示: 将同时启动 Vite 开发服务器和 Electron" -ForegroundColor Yellow
Write-Host ""

# 启动开发模式
npm run electron:dev
