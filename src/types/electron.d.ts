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
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
