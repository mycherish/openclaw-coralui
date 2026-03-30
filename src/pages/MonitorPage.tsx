/**
 * MonitorPage Component
 *
 * 监控页面 - 网关状态和服务监控
 */

import React from 'react'
import GatewayPanel from '@/components/GatewayPanel'
import StatusPanel from '@/components/StatusPanel'
import type { GatewayStatus, HealthStatus, NodesStatus, ModelsStatus, ChannelsStatus } from '@/types/electron'

interface MonitorPageProps {
  gatewayStatus: GatewayStatus | null
  healthStatus: HealthStatus | null
  nodesStatus: NodesStatus | null
  modelsStatus: ModelsStatus | null
  channelsStatus: ChannelsStatus | null
}

/**
 * MonitorPage 组件
 */
const MonitorPage: React.FC<MonitorPageProps> = ({
  gatewayStatus,
  healthStatus,
  nodesStatus,
  modelsStatus,
  channelsStatus
}) => {
  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">状态监控</h1>
        <p className="text-white/50 mt-1">查看 OpenClaw 服务状态和运行指标</p>
      </div>

      {/* 网关状态 */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4">网关状态</h2>
        <GatewayPanel gatewayStatus={gatewayStatus} />
      </div>

      {/* 服务状态 */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4">服务状态</h2>
        <StatusPanel
          healthStatus={healthStatus}
          nodesStatus={nodesStatus}
          modelsStatus={modelsStatus}
          channelsStatus={channelsStatus}
        />
      </div>
    </div>
  )
}

export default MonitorPage
