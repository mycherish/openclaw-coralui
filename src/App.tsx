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
import { QuickChatWindow } from './components/QuickChat'
import { Toaster } from '@/components/ui/toaster'

/**
 * Quick Chat 组件 - 独立窗口
 */
const QuickChatApp: React.FC = () => {
  const handleClose = () => {
    window.electron?.closeQuickChat()
  }

  return <QuickChatWindow onClose={handleClose} />
}

/**
 * App 组件
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isQuickChat, setIsQuickChat] = useState(false)
  
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

  // 检测 URL hash 判断是否为 Quick Chat 模式
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      setIsQuickChat(hash === '#/quickchat')
    }
    
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // 安装完成时自动跳转到概览页（仅在从未安装变为已安装时触发）
  useEffect(() => {
    // Quick Chat 模式不处理
    if (isQuickChat) return
    
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
  }, [installStatus.installed, isQuickChat])

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

  // Quick Chat 模式：渲染独立窗口
  if (isQuickChat) {
    return (
      <>
        <QuickChatApp />
        <Toaster />
      </>
    )
  }

  // 主界面模式
  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isInstalled={installStatus.installed}
        version={installStatus.version}
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
