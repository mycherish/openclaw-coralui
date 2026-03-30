/**
 * App Main Component
 *
 * Responsible: Application layout and page routing
 * 重构为 macOS 风格的三栏布局
 */

import React, { useState, useEffect, useRef } from 'react'
import { useOpenClaw, OpenClawProvider } from './contexts/OpenClawContext'
import AppLayout from './components/AppLayout'
import OverviewPage from './pages/OverviewPage'
import InstallPage from './pages/InstallPage'
import MonitorPage from './pages/MonitorPage'
import LogsPage from './pages/LogsPage'
import SettingsPage from './pages/SettingsPage'
import { Toaster } from '@/components/ui/toaster'

/**
 * App 组件
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  
  // 记录上一次的安装状态，用于检测安装完成的时刻
  const prevInstalledRef = useRef<boolean | null>(null)

  const {
    systemInfo,
    installStatus,
    gatewayStatus,
    healthStatus,
    nodesStatus,
    modelsStatus,
    channelsStatus,
    logs,
    loading
  } = useOpenClaw()

  // 安装完成时自动跳转到概览页（仅在从未安装变为已安装时触发）
  useEffect(() => {
    // 首次渲染时记录状态，不触发跳转
    if (prevInstalledRef.current === null) {
      prevInstalledRef.current = installStatus.installed
      return
    }
    
    // 检测从未安装变为已安装
    if (!prevInstalledRef.current && installStatus.installed) {
      setActiveTab('overview')
    }
    
    prevInstalledRef.current = installStatus.installed
  }, [installStatus.installed])

  /**
   * 渲染当前页面
   */
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            systemInfo={systemInfo}
            installStatus={installStatus}
            gatewayStatus={gatewayStatus}
            healthStatus={healthStatus}
            onNavigate={setActiveTab}
          />
        )

      case 'install':
        return (
          <InstallPage
            systemInfo={systemInfo}
            installStatus={installStatus}
          />
        )

      case 'monitor':
        return (
          <MonitorPage
            gatewayStatus={gatewayStatus}
            healthStatus={healthStatus}
            nodesStatus={nodesStatus}
            modelsStatus={modelsStatus}
            channelsStatus={channelsStatus}
          />
        )

      case 'logs':
        return (
          <LogsPage
            logs={logs}
            loading={loading}
          />
        )

      case 'settings':
        return (
          <SettingsPage installStatus={installStatus} />
        )

      default:
        return (
          <OverviewPage
            systemInfo={systemInfo}
            installStatus={installStatus}
            gatewayStatus={gatewayStatus}
            healthStatus={healthStatus}
            onNavigate={setActiveTab}
          />
        )
    }
  }

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isInstalled={installStatus.installed}
      >
        {renderPage()}
      </AppLayout>

      {/* Toast 容器 */}
      <Toaster />
    </>
  )
}

/**
 * App Root - 带 Provider 包装
 */
const AppRoot: React.FC = () => {
  return (
    <OpenClawProvider>
      <App />
    </OpenClawProvider>
  )
}

export default AppRoot
