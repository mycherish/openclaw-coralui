/**
 * Electron Preload 脚本
 *
 * 负责：在渲染进程中安全地暴露 electron API
 */

const { contextBridge, ipcRenderer } = require('electron')

/**
 * 暴露给渲染进程的 API
 */
contextBridge.exposeInMainWorld('electron', {
  /**
   * 获取系统信息
   */
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  /**
   * 获取当前平台
   */
  getPlatform: () => process.platform,

  /**
   * 检查 OpenClaw 是否安装
   */
  checkOpenClawInstalled: () => ipcRenderer.invoke('check-openclaw-installed'),

  /**
   * 获取 Gateway 状态
   */
  getGatewayStatus: () => ipcRenderer.invoke('get-gateway-status'),

  /**
   * 获取健康状态
   */
  getHealthStatus: () => ipcRenderer.invoke('get-health-status'),

  /**
   * 安装 OpenClaw
   */
  installOpenClaw: (method) => ipcRenderer.invoke('install-openclaw', method),

  /**
   * 监听安装实时输出
   */
  onInstallOutput: (callback) => {
    ipcRenderer.on('install-output', (event, data) => callback(data))
  },

  /**
   * 移除安装输出监听
   */
  removeInstallOutputListener: () => {
    ipcRenderer.removeAllListeners('install-output')
  },

  /**
   * 启动 Gateway
   */
  startGateway: () => ipcRenderer.invoke('start-gateway'),

  /**
   * 停止 Gateway
   */
  stopGateway: () => ipcRenderer.invoke('stop-gateway'),

  /**
   * 重启 Gateway
   */
  restartGateway: () => ipcRenderer.invoke('restart-gateway'),

  /**
   * 卸载 OpenClaw
   */
  uninstallOpenClaw: (level) => ipcRenderer.invoke('uninstall-openclaw', level),

  /**
   * 监听卸载实时输出
   */
  onUninstallOutput: (callback) => {
    ipcRenderer.on('uninstall-output', (event, data) => callback(data))
  },

  /**
   * 移除卸载输出监听
   */
  removeUninstallOutputListener: () => {
    ipcRenderer.removeAllListeners('uninstall-output')
  },

  /**
   * 获取日志
   */
  getLogs: () => ipcRenderer.invoke('get-logs'),

  /**
   * 获取节点状态
   */
  getNodesStatus: () => ipcRenderer.invoke('get-nodes-status'),

  /**
   * 获取模型状态
   */
  getModelsStatus: () => ipcRenderer.invoke('get-models-status'),

  /**
   * 获取渠道状态
   */
  getChannelsStatus: () => ipcRenderer.invoke('get-channels-status'),

  /**
   * 检查 npm 版本
   */
  checkNpmVersion: () => ipcRenderer.invoke('check-npm-version'),

  /**
   * 检查 pnpm 版本
   */
  checkPnpmVersion: () => ipcRenderer.invoke('check-pnpm-version'),

  // ============================================================================
  // Quick Chat API
  // ============================================================================

  /**
   * Quick Chat 发送消息
   */
  quickChatSend: (message) => ipcRenderer.invoke('quick-chat-send', message),

  /**
   * Quick Chat 加载历史消息（支持分页）
   * @param {Object} options - 加载选项
   * @param {string} options.beforeTimestamp - 加载此时间戳之前的消息
   * @param {number} options.limit - 每次加载的消息数量，默认 20
   */
  quickChatLoadHistory: (options = {}) => ipcRenderer.invoke('quick-chat-load-history', options),

  /**
   * Quick Chat 检查 Gateway 状态
   */
  quickChatCheckGateway: () => ipcRenderer.invoke('quick-chat-check-gateway'),

  /**
   * Quick Chat 启动 Gateway
   */
  quickChatStartGateway: () => ipcRenderer.invoke('quick-chat-start-gateway'),

  /**
   * 关闭 Quick Chat 窗口
   */
  closeQuickChat: () => ipcRenderer.invoke('close-quick-chat'),

  /**
   * 显示主窗口
   */
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),

  // ============================================================================
  // Settings API
  // ============================================================================

  /**
   * 获取设置
   */
  getSettings: () => ipcRenderer.invoke('get-settings'),

  /**
   * 保存设置
   */
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  /**
   * 设置开机自启
   */
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),

  /**
   * 设置 Quick Chat 快捷键
   */
  setQuickChatShortcut: (shortcut) => ipcRenderer.invoke('set-quick-chat-shortcut', shortcut)
})
