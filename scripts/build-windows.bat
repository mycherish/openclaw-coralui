@echo off
REM OpenClaw CoralUI Windows 自动构建脚本
REM 使用方法: 在 Windows 上双击运行此脚本

setlocal enabledelayedexpansion

echo ========================================
echo OpenClaw CoralUI Windows 构建脚本
echo ========================================
echo.

REM 检查 Git 是否安装
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] 检测到必要工具:
git --version
node --version
npm --version
echo.

REM 设置变量
set REPO_URL=git@github.com:mycherish/openclaw-coralui.git
set PROJECT_NAME=openclaw-coralui

REM 检查是否已经克隆
if exist "%PROJECT_NAME%" (
    echo [信息] 项目目录已存在，进入现有目录...
    cd "%PROJECT_NAME%"
    
    echo.
    echo [信息] 拉取最新代码...
    git pull origin main
) else (
    echo [信息] 克隆项目...
    git clone %REPO_URL%
    
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 克隆失败，请检查网络连接或 SSH 密钥配置
        pause
        exit /b 1
    )
    
    cd "%PROJECT_NAME%"
)

echo.
echo [✓] 进入项目目录: %CD%
echo.

REM 安装依赖
echo [信息] 安装项目依赖...
echo 提示: 如果速度较慢，会自动切换到淘宝镜像
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [警告] npm install 失败，尝试使用淘宝镜像...
    call npm install --registry=https://registry.npmmirror.com
    
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo [✓] 依赖安装完成
echo.

REM 构建前端
echo [信息] 构建前端代码...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

echo.
echo [✓] 前端构建完成
echo.

REM 打包 Windows 应用
echo [信息] 打包 Windows 应用...
echo 这可能需要几分钟时间，请耐心等待...
echo.

call npm run electron:build -- --win

if %ERRORLEVEL% NEQ 0 (
    echo [错误] 打包失败
    pause
    exit /b 1
)

echo.
echo [✓] 打包完成！
echo.

REM 显示打包结果
echo ========================================
echo 打包结果:
echo ========================================
echo.
echo 打包文件位置: %CD%\dist
echo.
dir dist\*.exe /b
echo.

echo ========================================
echo 构建成功！
echo ========================================
echo.
echo 下一步:
echo 1. 打开 dist 目录查看安装程序
echo 2. 双击 .exe 文件安装应用
echo 3. 测试应用功能
echo.

REM 询问是否打开 dist 目录
set /p OPEN_DIR="是否打开 dist 目录? (Y/N): "
if /i "%OPEN_DIR%"=="Y" (
    explorer dist
)

echo.
pause
