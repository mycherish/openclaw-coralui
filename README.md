<div align="center">

# OpenClaw CoralUI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-blue)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-cyan)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](https://github.com/mycherish/openclaw-coralui)

**A modern GUI management tool for OpenClaw**

OpenClaw 珊瑚界面 - 一个现代化的 OpenClaw 图形化管理工具

</div>

---

## 📖 Introduction

OpenClaw CoralUI is a modern GUI management tool for OpenClaw, built with Electron, React, and TypeScript. It provides an intuitive graphical interface for managing OpenClaw services, monitoring system status, and performing administrative tasks.

OpenClaw 珊瑚界面是一个现代化的 OpenClaw 图形化管理工具，基于 Electron、React 和 TypeScript 构建。它为管理 OpenClaw 服务、监控系统状态和执行管理任务提供了直观的图形界面。

---

## ✨ Features

- 🎨 **Modern UI**: macOS-style design with smooth animations
  现代界面 - macOS 风格设计，流畅动画

- 📊 **Dashboard**: Real-time system status monitoring
  仪表板 - 实时系统状态监控

- 🔧 **Service Management**: Start, stop, and restart OpenClaw Gateway
  服务管理 - 启动、停止和重启 OpenClaw Gateway

- 📦 **Installation Management**: Four-level installation options (Core, Basic, Standard, Full)
  安装管理 - 四级安装选项（核心、基础、标准、完整）

- 🗑️ **Uninstall Options**: Four-level uninstall modes (Service, State, Workspace, All)
  卸载选项 - 四级卸载模式（服务、状态、工作区、完全）

- 📝 **Logs Viewer**: Real-time log monitoring
  日志查看 - 实时日志监控

- 🖥️ **Cross-Platform**: Native support for macOS, Windows, and Linux
  跨平台 - 原生支持 macOS、Windows 和 Linux

---

## 📸 Screenshots

> Coming soon... / 即将推出...

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

```bash
# Clone repository / 克隆仓库
git clone https://github.com/mycherish/openclaw-coralui.git
cd openclaw-coralui

# Install dependencies / 安装依赖
npm install
```

### Development

```bash
# Start development server / 启动开发服务器
npm run electron:dev

# Or start frontend only / 或仅启动前端
npm run dev
```

### Building

```bash
# Build for production / 生产构建
npm run build

# Build application packages / 构建应用包
npm run electron:build

# Build for specific platform / 构建特定平台
npm run electron:build -- --mac
npm run electron:build -- --win
npm run electron:build -- --linux
```

### Verify Environment

Run the environment verification script to check if OpenClaw is properly installed:

```bash
npm run verify-env
```

---

## 📦 Download

Download the latest release from [GitHub Releases](https://github.com/mycherish/openclaw-coralui/releases)

从 [GitHub Releases](https://github.com/mycherish/openclaw-coralui/releases) 下载最新版本

---

## ⚠️ Important Notes for macOS Users

**Permissions Required**:
On first launch, macOS may prompt for permissions. Please grant the following:
- **Apple Events**: Required to execute shell commands
- **File Access**: Required to access system files

**macOS 权限要求**：
首次启动时，macOS 可能会提示授予权限。请允许以下权限：
- **Apple Events**: 执行 shell 命令所必需
- **File Access**: 访问系统文件所必需

**OpenClaw Detection Issue**:
If the app cannot detect OpenClaw, try these steps:

**OpenClaw 检测问题**：
如果应用无法检测到 OpenClaw，请尝试以下步骤：

1. **Install OpenClaw**:
   ```bash
   curl -fsSL https://openclaw.ai/install.sh | bash
   ```

2. **Verify Installation**:
   ```bash
   openclaw --version
   ```

3. **Restart the App** (Important!)

4. **If Still Not Working** - Launch from terminal:
   ```bash
   /Applications/OpenClaw\ CoralUI.app/Contents/MacOS/OpenClaw\ CoralUI
   ```

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

详细故障排除请参阅 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🛠️ Development Commands

| Command | Description | 描述 |
|---------|-------------|--------|
| `npm run dev` | Start Vite dev server | 启动 Vite 开发服务器 |
| `npm run build` | Build for production | 生产构建 |
| `npm run electron:dev` | Start Electron dev mode | 启动 Electron 开发模式 |
| `npm run electron:build` | Build application packages | 构建应用包 |
| `npm run generate-icons` | Generate app icons | 生成应用图标 |
| `npm run verify-env` | Verify OpenClaw environment | 验证 OpenClaw 环境 |

---

## 📁 Project Structure

```
openclaw-coralui/
├── electron/              # Electron main process
├── src/                  # React source code
│   ├── components/       # UI components
│   ├── hooks/          # Custom React hooks
│   └── main.tsx        # Entry point
├── public/               # Static assets
├── build/               # Build output and icons
├── scripts/             # Build and utility scripts
└── package.json          # Project configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。

1. Fork the repository / 分叉仓库
2. Create your feature branch / 创建功能分支
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes / 提交更改
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch / 推送到分支
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request / 打开 Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

## 🙏 Acknowledgments

- [OpenClaw](https://openclaw.ai/) - The AI agent framework / AI 代理框架
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework / 跨平台桌面应用框架
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces / 用于构建用户界面的 JavaScript 库
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale / 任意规模的 JavaScript

---

## 📞 Contact

- **Author / 作者**: [mycherish](https://github.com/mycherish)
- **Repository / 仓库**: [https://github.com/mycherish/openclaw-coralui](https://github.com/mycherish/openclaw-coralui)
- **Issues / 问题反馈**: [GitHub Issues](https://github.com/mycherish/openclaw-coralui/issues)

---

<div align="center">

**⭐ Star this project on GitHub!**

**在 GitHub 上给这个项目点星！**

Made with ❤️ by mycherish

</div>
