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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { Settings, Activity, Wifi, FileText } from 'lucide-react'

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
    <>
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
                onRefresh={refreshAll}
              />
            </div>

            {/* 主内容区 - 使用 Tabs */}
            <div className="main-area">
              {installStatus.installed ? (
                <Tabs defaultValue="gateway" className="w-full">
                  <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="gateway"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      Gateway
                    </TabsTrigger>
                    <TabsTrigger
                      value="status"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      状态监控
                    </TabsTrigger>
                    <TabsTrigger
                      value="logs"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      系统日志
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gateway" className="mt-0">
                    <GatewayPanel gatewayStatus={gatewayStatus} />
                  </TabsContent>

                  <TabsContent value="status" className="mt-0">
                    <StatusPanel
                      healthStatus={healthStatus}
                      nodesStatus={nodesStatus}
                      modelsStatus={modelsStatus}
                      channelsStatus={channelsStatus}
                    />
                  </TabsContent>

                  <TabsContent value="logs" className="mt-0">
                    <LogsPanel logs={logs} loading={loading} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-white/70 mb-2">OpenClaw 未安装</h3>
                    <p className="text-sm text-white/50">请先在左侧面板安装 OpenClaw</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast 容器 */}
      <Toaster />
    </>
  )
}

export default App
