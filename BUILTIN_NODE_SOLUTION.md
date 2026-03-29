# 内置 Node.js 环境解决方案

## 问题背景

用户在使用 OpenClaw CoralUI 时遇到以下问题：
1. **网络连接问题**：`https://get.openclaw.app/script/win` 无法访问，出现 "基础连接已经关闭: 发送时发生错误"
2. **环境依赖问题**：用户系统缺少 Node.js 和 npm，导致无法安装 openclaw
3. **编码问题**：Windows 中文环境下 PowerShell 输出乱码

## 解决方案

采用**内置 Node.js 运行环境**方案，不修改用户系统环境，只在应用目录下维护专用运行环境。

### 核心逻辑

1. **检测**：检查应用特定目录（如 `userData`）下是否存在 `node.exe`
2. **下载**：如果没有，从国内镜像源（华为云）下载 Node.js 的 Windows Zip 包
3. **解压**：解压到该目录
4. **调用**：所有 `openclaw` 命令都通过这个内置环境执行

### 实现细节

#### 1. 运行时路径管理
```javascript
const getRuntimePath = () => {
  const runtimeDir = path.join(app.getPath('userData'), 'runtime')
  if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true })
  return runtimeDir
}
```

#### 2. 环境准备函数
```javascript
async function prepareRuntime(event) {
  // 检查是否已存在
  const nodeExePath = path.join(runtimeDir, 'node-v20.11.1-win-x64', 'node.exe')
  if (fs.existsSync(nodeExePath)) {
    return { success: true, message: '环境已就绪', path: nodeExePath }
  }
  
  // 从华为云镜像下载 Node.js
  const downloadUrl = 'https://mirrors.huaweicloud.com/nodejs/v20.11.1/node-v20.11.1-win-x64.zip'
  
  // 下载并解压
  await downloadFile(downloadUrl, zipPath, onProgress)
  await executeCommand(`powershell.exe -NoProfile -Command "Expand-Archive ..."`)
  
  return { success: true, output: 'Node 环境集成成功！' }
}
```

#### 3. 命令执行环境注入
```javascript
async function executeCommand(command, timeout = 10000) {
  // 检查是否有内置 Node.js 环境
  const nodeExe = path.join(internalNodePath, 'node.exe')
  
  // 如果内置 Node 存在，将其加入临时环境变量 PATH 的最前面
  if (fs.existsSync(nodeExe)) {
    const delimiter = process.platform === 'win32' ? ';' : ':'
    env.PATH = `${internalNodePath}${delimiter}${env.PATH}`
  }
  
  // 执行命令...
}
```

#### 4. 安装流程修改
```javascript
// 原方案：使用外部 PowerShell 脚本
'irm https://get.openclaw.app/script/win | iex'

// 新方案：使用内置环境
1. 准备运行时环境 (prepareRuntime)
2. 使用内置 npm 安装 openclaw
3. 所有后续命令都使用内置环境
```

### 技术优势

1. **零网络依赖**：使用国内镜像源，下载速度快且稳定
2. **零环境依赖**：不要求用户预先安装 Node.js
3. **隔离性好**：不污染用户系统环境
4. **易于维护**：环境与应用绑定，版本控制简单
5. **跨平台友好**：方案可扩展支持 macOS/Linux

### 文件修改

#### `electron/main.js`
1. 添加 `adm-zip` 依赖导入
2. 添加 `getRuntimePath()` 函数
3. 添加 `prepareRuntime()` 函数
4. 修改 `executeCommand()` 支持内置环境
5. 修改 `install-openclaw` IPC handler 使用新方案

#### `package.json`
- 添加 `"adm-zip": "^0.5.10"` 依赖

### 使用流程

1. 用户点击"一键安装"
2. 应用检测到需要内置环境
3. 从华为云下载 Node.js v20.11.1
4. 解压到 `%APPDATA%/OpenClaw CoralUI/runtime/`
5. 使用内置 npm 安装 openclaw
6. 所有后续命令都使用内置环境

### 注意事项

1. **磁盘空间**：Node.js 解压后约 100MB
2. **首次启动**：第一次安装需要下载，后续启动直接使用
3. **版本管理**：内置 Node.js 版本固定为 v20.11.1
4. **更新机制**：需要时可更新内置 Node.js 版本

### 测试验证

1. ✅ 运行时目录创建
2. ✅ 文件下载功能
3. ✅ 解压功能
4. ✅ 环境变量注入
5. ✅ 命令执行

### 未来扩展

1. **多版本支持**：允许用户选择 Node.js 版本
2. **自动更新**：定期检查并更新内置环境
3. **缓存优化**：复用已下载的文件
4. **平台扩展**：支持 macOS 和 Linux 的类似方案