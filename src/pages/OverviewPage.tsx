/**
 * OverviewPage Component
 *
 * 概览页面 - 展示常用功能和关键数据
 */

import React from 'react'
import {
  Server,
  Wifi,
  Activity,
  HardDrive,
  Cpu,
  Monitor,
  Globe,
  ArrowUpRight,
  CircleDot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemInfo, InstallStatus, GatewayStatus, HealthStatus } from '@/types/electron'

interface OverviewPageProps {
  systemInfo: SystemInfo | null
  installStatus: InstallStatus
  gatewayStatus: GatewayStatus | null
  healthStatus: HealthStatus | null
  onNavigate: (tab: string) => void
}

/**
 * 状态卡片组件
 */
const StatusCard: React.FC<{
  title: string
  value: string | React.ReactNode
  icon: React.ReactNode
  status?: 'success' | 'warning' | 'error' | 'neutral'
  onClick?: () => void
}> = ({ title, value, icon, status = 'neutral', onClick }) => {
  const statusColors = {
    success: 'from-green-500/20 to-green-600/10 border-green-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    error: 'from-red-500/20 to-red-600/10 border-red-500/30',
    neutral: 'from-white/5 to-white/[0.02] border-white/10'
  }

  const iconColors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    neutral: 'text-white/60'
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-xl border backdrop-blur-sm',
        'bg-gradient-to-br transition-all duration-300',
        statusColors[status],
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-lg bg-white/5', iconColors[status])}>
          {icon}
        </div>
        {onClick && (
          <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/50" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-white/50">{title}</p>
        <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      </div>
    </div>
  )
}

/**
 * OverviewPage 组件
 */
const OverviewPage: React.FC<OverviewPageProps> = ({
  systemInfo,
  installStatus,
  gatewayStatus,
  healthStatus,
  onNavigate
}) => {
  const isInstalled = installStatus.installed

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">概览</h1>
        <p className="text-white/50 mt-1">OpenClaw 系统状态一览</p>
      </div>

      {/* 状态卡片区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="服务状态"
          value={isInstalled ? '已安装' : '未安装'}
          icon={<Server className="w-5 h-5" />}
          status={isInstalled ? 'success' : 'warning'}
          onClick={() => onNavigate('install')}
        />
        <StatusCard
          title="网关状态"
          value={
            gatewayStatus?.status === 'running' ? '运行中' :
            gatewayStatus?.status === 'stopped' ? '已停止' : '未知'
          }
          icon={<Wifi className="w-5 h-5" />}
          status={
            gatewayStatus?.status === 'running' ? 'success' :
            gatewayStatus?.status === 'stopped' ? 'warning' : 'neutral'
          }
          onClick={() => onNavigate('monitor')}
        />
        <StatusCard
          title="健康状态"
          value={
            healthStatus?.healthy ? '健康' :
            healthStatus ? '异常' : '未知'
          }
          icon={<Activity className="w-5 h-5" />}
          status={
            healthStatus?.healthy ? 'success' :
            healthStatus ? 'error' : 'neutral'
          }
          onClick={() => onNavigate('monitor')}
        />
        <StatusCard
          title="版本"
          value={installStatus.version || 'N/A'}
          icon={<HardDrive className="w-5 h-5" />}
          status="neutral"
        />
      </div>

      {/* 系统信息区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统资源 */}
        <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            系统信息
          </h2>
          {systemInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  平台
                </span>
                <span className="text-white font-mono">{systemInfo.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  架构
                </span>
                <span className="text-white font-mono">{systemInfo.arch}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  主机名
                </span>
                <span className="text-white font-mono">{systemInfo.hostname}</span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">系统版本</span>
                  <span className="text-white">{systemInfo.version}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-white/30">
              加载中...
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-purple-400" />
            快速操作
          </h2>
          <div className="space-y-3">
            {isInstalled ? (
              <>
                <button
                  onClick={() => onNavigate('monitor')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors text-left flex items-center justify-between group"
                >
                  <span>查看服务状态</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => onNavigate('logs')}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors text-left flex items-center justify-between group"
                >
                  <span>查看系统日志</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors text-left flex items-center justify-between group"
                >
                  <span>系统设置</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('install')}
                className="w-full px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-colors text-left flex items-center justify-between group"
              >
                <span>立即安装 OpenClaw</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
