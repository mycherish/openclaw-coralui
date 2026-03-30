/**
 * LogsPage Component
 *
 * 日志页面
 */

import React from 'react'
import LogsPanel from '@/components/LogsPanel'

interface LogsPageProps {
  logs: string
  loading: boolean
}

/**
 * LogsPage 组件
 */
const LogsPage: React.FC<LogsPageProps> = ({ logs, loading }) => {
  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">系统日志</h1>
        <p className="text-white/50 mt-1">查看 OpenClaw 运行日志</p>
      </div>

      {/* 日志面板 */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm overflow-hidden">
        <LogsPanel logs={logs} loading={loading} />
      </div>
    </div>
  )
}

export default LogsPage
