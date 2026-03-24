/**
 * useOpenClaw Hook
 *
 * 负责：OpenClaw 的状态管理和操作
 * - 检查是否安装
 * - 获取系统信息
 * - Gateway 控制（启动/停止/重启）
 * - 获取状态信息
 * - 安装/卸载
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * 系统信息接口
 */
interface SystemInfo {
  platform: 'darwin' | 'win32' | 'linux'
  arch: string
  hostname: string
  version: string
}

/**
 * OpenClaw 安装状态接口
 */
interface InstallStatus {
  installed: boolean
  version?: string
  error?: string
}

/**
 * Gateway 状态接口
 */
interface GatewayStatus {
  status: 'running' | 'stopped' | 'unknown'
  output: string
}

/**
 * 健康状态接口
 */
interface HealthStatus {
  healthy: boolean
  output: string
}

/**
 * 节点状态接口
 */
interface NodesStatus {
  success: boolean
  output: string
}

/**
 * 模型状态接口
 */
interface ModelsStatus {
  success: boolean
  output: string
}

/**
 * 渠道状态接口
 */
interface ChannelsStatus {
  success: boolean
  output: string
}

/**
 * 操作结果接口
 */
interface OperationResult {
  success: boolean
  output: string
}

export const useOpenClaw = () => {
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
      let gatewayStatus: 'running' | 'stopped' | 'unknown' = 'unknown'
      if (status.output.includes('running') || status.output.includes('active')) {
        gatewayStatus = 'running'
      } else if (status.output.includes('stopped') || status.output.includes('inactive')) {
        gatewayStatus = 'stopped'
      }

      setGatewayStatus({
        status: gatewayStatus,
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
      const logs = await window.electron.getLogs()
      if (logs.success) {
        setLogs(logs.logs)
      }
      return logs
    } catch (error) {
      console.error('获取日志失败:', error)
      return null
    }
  }, [])

  /**
   * 安装 OpenClaw
   */
  const installOpenClaw = useCallback(async (method: 'script' | 'npm' | 'pnpm'): Promise<OperationResult> => {
    try {
      setLoading(true)
      const result = await window.electron.installOpenClaw(method)

      // 安装后重新检查状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
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

      // 卸载后重新检查状态
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
        await checkInstallStatus()
        await getGatewayStatus()
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
  }, [checkInstallStatus, getGatewayStatus])

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

  // 初始化
  useEffect(() => {
    initialize()
  }, []) // 只在组件挂载时执行一次

  return {
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
}
