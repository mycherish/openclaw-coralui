/**
 * StatusPanel 组件 - macOS 风格
 *
 * 负责：显示各种状态信息（健康、节点、模型、渠道）
 */

import React from 'react'

interface StatusPanelProps {
  activeTab: 'status' | 'logs'
  onTabChange: (tab: 'status' | 'logs') => void
  healthStatus: {
    healthy: boolean
    output: string
  } | null
  nodesStatus: {
    success: boolean
    output: string
  } | null
  modelsStatus: {
    success: boolean
    output: string
  } | null
  channelsStatus: {
    success: boolean
    output: string
  } | null
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  activeTab,
  onTabChange,
  healthStatus,
  nodesStatus,
  modelsStatus,
  channelsStatus
}) => {
  /**
   * 简化输出显示（只显示关键信息）
   */
  const simplifyOutput = (output: string): string => {
    // 移除多余的空行
    const lines = output.split('\n').filter(line => line.trim())
    // 只显示前 15 行
    return lines.slice(0, 15).join('\n')
  }

  /**
   * 渲染状态卡片
   */
  const renderStatusCard = (
    title: string,
    icon: string,
    status: boolean | null,
    output: string,
    colorClass: string
  ) => (
    <div className="card">
      <div className="card-header">
        <div className="icon-container">
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="card-title">{title}</div>
          {status !== null && (
            <div className={`status-badge ${status ? 'running' : 'stopped'} ml-auto`}>
              <div className={`status-dot ${status ? 'running' : 'stopped'}`} />
              <span>{status ? '正常' : '异常'}</span>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="terminal-output text-xs">{simplifyOutput(output)}</div>
      </div>
    </div>
  )

  return (
    <div className="card">
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="icon-container">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <div className="card-title">状态监控</div>
          <div className="card-subtitle">查看 OpenClaw 各组件运行状态</div>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="card-body">
        <div className="space-y-4">
          {/* 健康状态 */}
          {healthStatus && renderStatusCard(
            '健康检查',
            '❤️',
            healthStatus.healthy,
            healthStatus.output,
            healthStatus.healthy ? 'green' : 'red'
          )}

          {/* 节点状态 */}
          {nodesStatus && renderStatusCard(
            '节点状态',
            '🧩',
            nodesStatus.success,
            nodesStatus.output,
            nodesStatus.success ? 'green' : 'orange'
          )}

          {/* 模型状态 */}
          {modelsStatus && renderStatusCard(
            '模型状态',
            '🤖',
            modelsStatus.success,
            modelsStatus.output,
            modelsStatus.success ? 'green' : 'orange'
          )}

          {/* 渠道状态 */}
          {channelsStatus && renderStatusCard(
            '渠道状态',
            '🔗',
            channelsStatus.success,
            channelsStatus.output,
            channelsStatus.success ? 'green' : 'orange'
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusPanel
