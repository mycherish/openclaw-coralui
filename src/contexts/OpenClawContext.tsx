/**
 * OpenClaw Context
 *
 * 全局共享 OpenClaw 状态，避免多个 hook 实例导致状态不同步
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

/**
 * 系统信息接口
 */
export interface SystemInfo {
  platform: 'darwin' | 'win32' | 'linux'
  arch: string
  hostname: string
  version: string
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

/**
 * 操作结果接口
 */
export interface OperationResult {
  success: boolean
  output: string
  installed?: boolean
  version?: string
}

/**
 * Context 接口
 */
interface OpenClawContextType {
  // 状态
  systemInfo: SystemInfo | null
  installStatus: InstallStatus
  gatewayStatus: GatewayStatus
  healthStatus: HealthStatus | null
  nodesStatus: NodesStatus | null
  modelsStatus: ModelsStatus | null
  channelsStatus: ChannelsStatus | null
  logs: string
  loading: boolean

  // 操作
  getSystemInfo: () => Promise<SystemInfo | null>
  checkInstallStatus: () => Promise<InstallStatus | null>
  getGatewayStatus: () => Promise<{ status: string; output: string } | null>
  getHealthStatus: () => Promise<HealthStatus | null>
  getNodesStatus: () => Promise<NodesStatus | null>
  getModelsStatus: () => Promise<ModelsStatus | null>
  getChannelsStatus: () => Promise<ChannelsStatus | null>
  getLogs: () => Promise<{ success: boolean; logs?: string } | null>
  installOpenClaw: (method: 'script' | 'npm' | 'pnpm') => Promise<OperationResult>
  startGateway: () => Promise<OperationResult>
  stopGateway: () => Promise<OperationResult>
  restartGateway: () => Promise<OperationResult>
  uninstallOpenClaw: (level: 'service' | 'state' | 'workspace' | 'all') => Promise<OperationResult>
  refreshAll: () => Promise<void>
}

const OpenClawContext = createContext<OpenClawContextType | null>(null)

/**
 * OpenClaw Provider
 */
export const OpenClawProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 系统信息
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  // OpenClaw 安装状态
  const [installStatus, setInstallStatus] = useState<InstallStatus>({
    installed: false
  })

  // Gateway 状态
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    status: 'unknown',
    output: ''
  })

  // 健康状态
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)

  // 节点状态
  const [nodesStatus, setNodesStatus] = useState<NodesStatus | null>(null)

  // 模型状态
  const [modelsStatus, setModelsStatus] = useState<ModelsStatus | null>(null)

  // 渠道状态
  const [channelsStatus, setChannelsStatus] = useState<ChannelsStatus | null>(null)

  // 日志
  const [logs, setLogs] = useState<string>('')

  // 加载状态
  const [loading, setLoading] = useState(false)

  /**
   * 获取系统信息
   */
  const getSystemInfo = useCallback(async () => {
    try {
      const info = await window.electron.getSystemInfo()
      setSystemInfo(info)
      return info
    } catch (error) {
      console.error('获取系统信息失败:', error)
      return null
    }
  }, [])

  /**
   * 检查 OpenClaw 是否安装
   */
  const checkInstallStatus = useCallback(async () => {
    try {
      const status = await window.electron.checkOpenClawInstalled()
      setInstallStatus(status)
      return status
    } catch (error) {
      console.error('检查安装状态失败:', error)
      setInstallStatus({ installed: false, error: '检查失败' })
      return null
    }
  }, [])

  /**
   * 获取 Gateway 状态
   */
  const getGatewayStatus = useCallback(async () => {
    try {
      setLoading(true)
      const status = await window.electron.getGatewayStatus()

      // 解析状态
      let gatewayStatusValue: 'running' | 'stopped' | 'unknown' = 'unknown'
      if (status.output.includes('running') || status.output.includes('active')) {
        gatewayStatusValue = 'running'
      } else if (status.output.includes('stopped') || status.output.includes('inactive')) {
        gatewayStatusValue = 'stopped'
      }

      setGatewayStatus({
        status: gatewayStatusValue,
        output: status.output
      })

      return status
    } catch (error) {
      console.error('获取 Gateway 状态失败:', error)
      setGatewayStatus({ status: 'unknown', output: '获取失败' })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 获取健康状态
   */
  const getHealthStatus = useCallback(async () => {
    try {
      const status = await window.electron.getHealthStatus()
      setHealthStatus(status)
      return status
    } catch (error) {
      console.error('获取健康状态失败:', error)
      return null
    }
  }, [])

  /**
   * 获取节点状态
   */
  const getNodesStatus = useCallback(async () => {
    try {
      const status = await window.electron.getNodesStatus()
      setNodesStatus(status)
      return status
    } catch (error) {
      console.error('获取节点状态失败:', error)
      return null
    }
  }, [])

  /**
   * 获取模型状态
   */
  const getModelsStatus = useCallback(async () => {
    try {
      const status = await window.electron.getModelsStatus()
      setModelsStatus(status)
      return status
    } catch (error) {
      console.error('获取模型状态失败:', error)
      return null
    }
  }, [])

  /**
   * 获取渠道状态
   */
  const getChannelsStatus = useCallback(async () => {
    try {
      const status = await window.electron.getChannelsStatus()
      setChannelsStatus(status)
      return status
    } catch (error) {
      console.error('获取渠道状态失败:', error)
      return null
    }
  }, [])

  /**
   * 获取日志
   */
  const getLogs = useCallback(async () => {
    try {
      const logsResult = await window.electron.getLogs()
      if (logsResult.success) {
        setLogs(logsResult.logs)
      }
      return logsResult
    } catch (error) {
      console.error('获取日志失败:', error)
      return null
    }
  }, [])

  /**
   * 初始化：获取所有状态
   */
  const initialize = useCallback(async () => {
    await getSystemInfo()
    const installInfo = await checkInstallStatus()
    if (installInfo && installInfo.installed) {
      await getGatewayStatus()
      await getHealthStatus()
      await getNodesStatus()
      await getModelsStatus()
      await getChannelsStatus()
      await getLogs()
    }
  }, [getSystemInfo, checkInstallStatus, getGatewayStatus, getHealthStatus, getNodesStatus, getModelsStatus, getChannelsStatus, getLogs])

  /**
   * 刷新所有状态
   */
  const refreshAll = useCallback(async () => {
    await checkInstallStatus()
    if (installStatus.installed) {
      await Promise.all([
        getGatewayStatus(),
        getHealthStatus(),
        getNodesStatus(),
        getModelsStatus(),
        getChannelsStatus(),
        getLogs()
      ])
    }
  }, [checkInstallStatus, installStatus.installed, getGatewayStatus, getHealthStatus, getNodesStatus, getModelsStatus, getChannelsStatus, getLogs])

  /**
   * 安装 OpenClaw
   */
  const installOpenClaw = useCallback(async (method: 'script' | 'npm' | 'pnpm'): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.installOpenClaw(method)

      // 安装后重新初始化所有状态
      if (result.success) {
        // 如果后端已经验证了安装，直接刷新状态
        await new Promise(resolve => setTimeout(resolve, 500))
        await checkInstallStatus()
      }

      return result
    } catch (error) {
      console.error('安装失败:', error)
      return {
        success: false,
        output: error instanceof Error ? error.message : '安装失败'
      }
    } finally {
      setLoading(false)
    }
  }, [checkInstallStatus])

  /**
   * 启动 Gateway
   */
  const startGateway = useCallback(async (): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.startGateway()

      // 启动后重新获取状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
        await getGatewayStatus()
      }

      return result
    } catch (error) {
      console.error('启动 Gateway 失败:', error)
      return {
        success: false,
        output: error instanceof Error ? error.message : '启动失败'
      }
    } finally {
      setLoading(false)
    }
  }, [getGatewayStatus])

  /**
   * 停止 Gateway
   */
  const stopGateway = useCallback(async (): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.stopGateway()

      // 停止后重新获取状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
        await getGatewayStatus()
      }

      return result
    } catch (error) {
      console.error('停止 Gateway 失败:', error)
      return {
        success: false,
        output: error instanceof Error ? error.message : '停止失败'
      }
    } finally {
      setLoading(false)
    }
  }, [getGatewayStatus])

  /**
   * 重启 Gateway
   */
  const restartGateway = useCallback(async (): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.restartGateway()

      // 重启后重新获取状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
        await getGatewayStatus()
      }

      return result
    } catch (error) {
      console.error('重启 Gateway 失败:', error)
      return {
        success: false,
        output: error instanceof Error ? error.message : '重启失败'
      }
    } finally {
      setLoading(false)
    }
  }, [getGatewayStatus])

  /**
   * 卸载 OpenClaw
   */
  const uninstallOpenClaw = useCallback(async (level: 'service' | 'state' | 'workspace' | 'all'): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.uninstallOpenClaw(level)

      // 卸载后重新初始化所有状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
        await initialize() // 重新初始化所有状态
      }

      return result
    } catch (error) {
      console.error('卸载失败:', error)
      return {
        success: false,
        output: error instanceof Error ? error.message : '卸载失败'
      }
    } finally {
      setLoading(false)
    }
  }, [initialize])

  // 初始化 - 只在 Provider 挂载时执行一次
  useEffect(() => {
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: OpenClawContextType = {
    // 状态
    systemInfo,
    installStatus,
    gatewayStatus,
    healthStatus,
    nodesStatus,
    modelsStatus,
    channelsStatus,
    logs,
    loading,

    // 操作
    getSystemInfo,
    checkInstallStatus,
    getGatewayStatus,
    getHealthStatus,
    getNodesStatus,
    getModelsStatus,
    getChannelsStatus,
    getLogs,
    installOpenClaw,
    startGateway,
    stopGateway,
    restartGateway,
    uninstallOpenClaw,
    refreshAll
  }

  return (
    <OpenClawContext.Provider value={value}>
      {children}
    </OpenClawContext.Provider>
  )
}

/**
 * useOpenClaw Hook
 * 
 * 从 Context 获取共享状态
 */
export const useOpenClaw = () => {
  const context = useContext(OpenClawContext)
  if (!context) {
    throw new Error('useOpenClaw must be used within an OpenClawProvider')
  }
  return context
}

export default OpenClawContext
