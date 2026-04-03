/**
 * Electron 类型定义
 * 为 window.electron 提供类型支持
 */

export interface ElectronAPI {
  /**
   * 获取系统信息
   */
  getSystemInfo(): Promise<{
    platform: 'darwin' | 'win32' | 'linux'
    arch: string
    hostname: string
    version: string
  }>

  /**
   * 获取当前平台
   */
  getPlatform(): 'darwin' | 'win32' | 'linux'

  /**
   * 检查 OpenClaw 是否安装
   */
  checkOpenClawInstalled(): Promise<{
    installed: boolean
    version?: string
    error?: string
  }>

  /**
   * 获取 Gateway 状态
   */
  getGatewayStatus(): Promise<{
    status: 'running' | 'stopped' | 'unknown'
    output: string
  }>

  /**
   * 获取健康状态
   */
  getHealthStatus(): Promise<{
    healthy: boolean
    output: string
  }>

  /**
   * 安装 OpenClaw
   */
  installOpenClaw(method: 'script' | 'npm' | 'pnpm'): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 监听安装实时输出
   */
  onInstallOutput(callback: (data: string) => void): void

  /**
   * 移除安装输出监听
   */
  removeInstallOutputListener(): void

  /**
   * 启动 Gateway
   */
  startGateway(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 停止 Gateway
   */
  stopGateway(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 重启 Gateway
   */
  restartGateway(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 卸载 OpenClaw
   */
  uninstallOpenClaw(level: 'service' | 'state' | 'workspace' | 'all'): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 监听卸载实时输出
   */
  onUninstallOutput(callback: (data: string) => void): void

  /**
   * 移除卸载输出监听
   */
  removeUninstallOutputListener(): void

  /**
   * 获取日志
   */
  getLogs(): Promise<{
    success: boolean
    logs: string
  }>

  /**
   * 获取节点状态
   */
  getNodesStatus(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 获取模型状态
   */
  getModelsStatus(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 获取渠道状态
   */
  getChannelsStatus(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 检查 npm 版本
   */
  checkNpmVersion(): Promise<{
    success: boolean
    output: string
  }>

  /**
   * 检查 pnpm 版本
   */
  checkPnpmVersion(): Promise<{
    success: boolean
    output: string
  }>

  // ============================================================================
  // Quick Chat API
  // ============================================================================

  /**
   * Quick Chat 加载历史消息
   */
  quickChatLoadHistory(): Promise<{
    success: boolean
    messages?: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp: string
    }>
    total?: number
    error?: string
  }>

  /**
   * Quick Chat 发送消息
   */
  quickChatSend(message: string): Promise<{
    success: boolean
    response?: string
    error?: string
  }>

  /**
   * 关闭 Quick Chat 窗口
   */
  closeQuickChat(): Promise<void>

  /**
   * 显示主窗口
   */
  showMainWindow(): Promise<void>

  // ============================================================================
  // Settings API
  // ============================================================================

  /**
   * 获取设置
   */
  getSettings(): Promise<{
    autoLaunch: boolean
    startMinimized: boolean
    quickChatShortcut: string
  }>

  /**
   * 保存设置
   */
  saveSettings(settings: Partial<{
    autoLaunch: boolean
    startMinimized: boolean
    quickChatShortcut: string
  }>): Promise<{
    success: boolean
    error?: string
  }>

  /**
   * 设置开机自启
   */
  setAutoLaunch(enabled: boolean): Promise<{
    success: boolean
    error?: string
  }>

  /**
   * 设置 Quick Chat 快捷键
   */
  setQuickChatShortcut(shortcut: string): Promise<{
    success: boolean
    error?: string
  }>
}

/**
 * 系统信息接口
 */
export interface SystemInfo {
  platform: 'darwin' | 'win32' | 'linux'
  arch: string
  hostname: string
  version: string
  cpuCores?: number
  totalMemory?: string
  freeDisk?: string
}

/**
 * OpenClaw 安装状态接口
 */
export interface InstallStatus {
  installed: boolean
  version?: string
  error?: string
}

/**
 * Gateway 状态接口
 */
export interface GatewayStatus {
  status: 'running' | 'stopped' | 'unknown'
  output: string
}

/**
 * 健康状态接口
 */
export interface HealthStatus {
  healthy: boolean
  output: string
}

/**
 * 节点状态接口
 */
export interface NodesStatus {
  success: boolean
  output: string
}

/**
 * 模型状态接口
 */
export interface ModelsStatus {
  success: boolean
  output: string
}

/**
 * 渠道状态接口
 */
export interface ChannelsStatus {
  success: boolean
  output: string
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
