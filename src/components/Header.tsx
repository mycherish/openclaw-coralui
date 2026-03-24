/**
 * Header 组件 - macOS 风格
 *
 * 负责：显示应用标题、系统信息摘要、Gateway 状态、刷新按钮
 */

import React from 'react'
import Logo from './Logo'

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
   * 获取状态文本和颜色类
   */
  const getStatusInfo = () => {
    switch (gatewayStatus.status) {
      case 'running':
        return { text: '运行中', color: 'running' }
      case 'stopped':
        return { text: '已停止', color: 'stopped' }
      default:
        return { text: '未知', color: 'unknown' }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <header className="header">
      <div className="header-content">
          {/* 左侧：Logo、标题和系统信息 */}
          <div className="header-left">
            {/* Logo 和标题 */}
            <div className="logo">
              <Logo size="large" />
              <div>
                <h1 className="logo-text">OpenClaw CoralUI</h1>
                <p className="text-xs text-white/40 mt-0.5">OpenClaw 图形界面管理工具</p>
              </div>
            </div>

          {/* 垂直分隔线 */}
          <div className="h-8 w-px bg-white/10" />

          {/* 系统信息标签 */}
          {systemInfo && (
            <div className="flex items-center gap-2">
              <span className="tag tag-blue">
                {formatPlatform(systemInfo.platform)} {systemInfo.arch}
              </span>
              {installStatus.installed && installStatus.version && (
                <span className="tag tag-green">
                  OpenClaw {installStatus.version}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 右侧：Gateway 状态和刷新按钮 */}
        <div className="header-right">
          {/* Gateway 状态指示器 */}
          {installStatus.installed && (
            <div className={`status-badge ${statusInfo.color}`}>
              <div className={`status-dot ${statusInfo.color}`} />
              <span>Gateway {statusInfo.text}</span>
            </div>
          )}

          {/* 刷新按钮 */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`btn btn-secondary ${loading ? 'cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>刷新中</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>刷新</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
