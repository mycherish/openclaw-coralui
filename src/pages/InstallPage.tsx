/**
 * InstallPage Component
 *
 * 安装/卸载页面
 */

import React from 'react'
import InstallPanel from '@/components/InstallPanel'
import SystemInfo from '@/components/SystemInfo'
import type { SystemInfo as SystemInfoType, InstallStatus } from '@/types/electron'

interface InstallPageProps {
  systemInfo: SystemInfoType | null
  installStatus: InstallStatus
}

/**
 * InstallPage 组件
 */
const InstallPage: React.FC<InstallPageProps> = ({
  systemInfo,
  installStatus
}) => {
  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">安装管理</h1>
        <p className="text-white/50 mt-1">安装、升级或卸载 OpenClaw</p>
      </div>

      {/* 内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统要求 */}
        <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-4">系统信息</h2>
          {systemInfo && (
            <SystemInfo
              systemInfo={systemInfo}
              installStatus={installStatus}
            />
          )}
        </div>

        {/* 安装面板 */}
        <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-4">
            {installStatus.installed ? '管理安装' : '安装 OpenClaw'}
          </h2>
          <InstallPanel
            installStatus={installStatus}
            systemInfo={systemInfo}
          />
        </div>
      </div>
    </div>
  )
}

export default InstallPage
