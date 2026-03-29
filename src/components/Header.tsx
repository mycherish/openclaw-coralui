/**
 * Header 组件 - macOS 风格
 *
 * 负责：显示应用标题、系统信息摘要、Gateway 状态、刷新按钮
 */

import React from 'react'
import { RefreshCw } from 'lucide-react'
import Logo from './Logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  systemInfo: {
    platform: 'darwin' | 'win32' | 'linux'
    arch: string
    hostname: string
    version: string
  } | null
  installStatus: {
    installed: boolean
    version?: string
    error?: string
  }
  gatewayStatus: {
    status: 'running' | 'stopped' | 'unknown'
    output: string
  }
  onRefresh: () => void
  loading: boolean
}

const Header: React.FC<HeaderProps> = ({
  systemInfo,
  installStatus,
  gatewayStatus,
  onRefresh,
  loading
}) => {
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

  /**
   * 获取状态信息
   */
  const getStatusInfo = () => {
    switch (gatewayStatus.status) {
      case 'running':
        return { text: '运行中', variant: 'success' as const }
      case 'stopped':
        return { text: '已停止', variant: 'secondary' as const }
      default:
        return { text: '未知', variant: 'outline' as const }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <header className="h-16 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between">
      {/* 左侧：Logo、标题和系统信息 */}
      <div className="flex items-center gap-4">
        {/* Logo 和标题 */}
        <div className="flex items-center gap-3">
          <Logo size="large" />
          <div>
            <h1 className="text-lg font-semibold text-white">OpenClaw CoralUI</h1>
            <p className="text-xs text-white/40">OpenClaw 图形界面管理工具</p>
          </div>
        </div>

        {/* 垂直分隔线 */}
        <div className="h-8 w-px bg-white/10" />

        {/* 系统信息标签 */}
        {systemInfo && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {formatPlatform(systemInfo.platform)} {systemInfo.arch}
            </Badge>
            {installStatus.installed && installStatus.version && (
              <Badge variant="success">
                OpenClaw {installStatus.version}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 右侧：Gateway 状态和刷新按钮 */}
      <div className="flex items-center gap-3">
        {/* Gateway 状态指示器 */}
        {installStatus.installed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className={`w-2 h-2 rounded-full ${
              statusInfo.variant === 'success' ? 'bg-green-500 animate-pulse' :
              statusInfo.variant === 'secondary' ? 'bg-gray-400' :
              'bg-gray-500'
            }`} />
            <span className="text-sm text-white/80">Gateway {statusInfo.text}</span>
          </div>
        )}

        {/* 刷新按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '刷新中' : '刷新'}
        </Button>
      </div>
    </header>
  )
}

export default Header
