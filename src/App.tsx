/**
 * App Main Component
 *
 * Responsible: Application layout and routing
 */

import React from 'react'
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
      </div>
    </div>
  )
}

export default App
