/**
 * App Main Component
 *
 * Responsible: Application layout and routing
 */

import React, { useState } from 'react'
import { useOpenClaw } from './hooks/useOpenClaw'
import Header from './components/Header'
import SystemInfo from './components/SystemInfo'
import InstallPanel from './components/InstallPanel'
import GatewayPanel from './components/GatewayPanel'
import StatusPanel from './components/StatusPanel'
import LogsPanel from './components/LogsPanel'

/**
 * App 组件
 */
const App: React.FC = () => {
  const {
    systemInfo,
    installStatus,
    gatewayStatus,
    healthStatus,
    nodesStatus,
    modelsStatus,
    channelsStatus,
    logs,
    loading,
    refreshAll
  } = useOpenClaw()

  // 当前标签页
  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status')

  /**
   * 格式化系统平台名称
   */
  const formatPlatform = (platform: string): string => {
    const platforms: Record<string, string> = {
      'darwin': 'macOS',
      'win32': 'Windows',
      'linux': 'Linux'
    }
    return platforms[platform] || platform
  }

  return (
    <div className="app-container">
      {/* 头部 */}
      <Header
        systemInfo={systemInfo}
        installStatus={installStatus}
        gatewayStatus={gatewayStatus}
        onRefresh={refreshAll}
        loading={loading}
      />

      {/* 主内容区域 */}
      <div className="main-content">
        <div className="grid-layout">
          {/* 侧边栏 */}
          <div className="sidebar">
            {/* 系统信息 */}
            {systemInfo && (
              <SystemInfo
                systemInfo={systemInfo}
                installStatus={installStatus}
              />
            )}

            {/* 安装/卸载面板 */}
            <InstallPanel
              installStatus={installStatus}
              systemInfo={systemInfo}
            />
          </div>

          {/* 主内容区 */}
          <div className="main-area">
            {/* Gateway 面板 */}
            {installStatus.installed && (
              <GatewayPanel
                gatewayStatus={gatewayStatus}
              />
            )}

            {/* 状态面板 */}
            {installStatus.installed && (
              <StatusPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                healthStatus={healthStatus}
                nodesStatus={nodesStatus}
                modelsStatus={modelsStatus}
                channelsStatus={channelsStatus}
              />
            )}

            {/* 日志面板 */}
            {installStatus.installed && (
              <LogsPanel
                logs={logs}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* 日志面板 */}
        {installStatus.installed && (
          <div className="mt-6">
            <LogsPanel
              logs={logs}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
