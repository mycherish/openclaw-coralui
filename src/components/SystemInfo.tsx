/**
 * SystemInfo 组件 - macOS 风格
 *
 * 负责：显示系统信息和 OpenClaw 安装状态
 */

import React from 'react'

interface SystemInfoProps {
  systemInfo: {
    platform: 'darwin' | 'win32' | 'linux'
    arch: string
    hostname: string
    version: string
  }
  installStatus: {
    installed: boolean
    version?: string
    error?: string
  }
}

const SystemInfo: React.FC<SystemInfoProps> = ({ systemInfo, installStatus }) => {
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
   * 格式化系统版本
   */
  const formatVersion = (version: string): string => {
    // 简化版本显示
    const parts = version.split('.')
    return parts.slice(0, 2).join('.')
  }

  return (
    <div className="card">
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="icon-container">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <div className="card-title">系统信息</div>
          <div className="card-subtitle">当前系统环境和 OpenClaw 状态</div>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="card-body">
        {/* OpenClaw 状态卡片 */}
        <div className={`status-card mb-4 ${installStatus.installed ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="status-card-title">OpenClaw 状态</div>
              <div className="status-card-value" style={{
                color: installStatus.installed ? '#32d74b' : '#ff453a'
              }}>
                {installStatus.installed ? '已安装' : '未安装'}
              </div>
            </div>
            <div className="text-4xl">
              {installStatus.installed ? '✅' : '❌'}
            </div>
          </div>
          {installStatus.installed && installStatus.version && (
            <div className="status-card-sub mt-3">
              版本: <span className="text-white/70">{installStatus.version}</span>
            </div>
          )}
        </div>

        {/* 系统信息网格 */}
        <div className="info-list">
          <div className="info-item">
            <span className="info-label">操作系统</span>
            <span className="info-value">{formatPlatform(systemInfo.platform)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">系统架构</span>
            <span className="info-value">{systemInfo.arch}</span>
          </div>
          <div className="info-item">
            <span className="info-label">主机名</span>
            <span className="info-value">{systemInfo.hostname}</span>
          </div>
          <div className="info-item">
            <span className="info-label">系统版本</span>
            <span className="info-value">{formatVersion(systemInfo.version)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemInfo
