/**
 * LogsPanel 组件 - macOS 风格
 *
 * 负责：显示 OpenClaw 日志
 */

import React from 'react'
import { useOpenClaw } from '../hooks/useOpenClaw'

interface LogsPanelProps {
  logs: string
  loading: boolean
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, loading }) => {
  const { getLogs } = useOpenClaw()

  /**
   * 解析日志级别
   */
  const parseLogLevel = (line: string): 'info' | 'warn' | 'error' | 'debug' => {
    const lowerLine = line.toLowerCase()
    if (lowerLine.includes('[error]') || lowerLine.includes('[err]')) {
      return 'error'
    }
    if (lowerLine.includes('[warn]') || lowerLine.includes('[warning]')) {
      return 'warn'
    }
    if (lowerLine.includes('[info]')) {
      return 'info'
    }
    return 'debug'
  }

  /**
   * 格式化日志行
   */
  const formatLogLine = (line: string, index: number) => {
    const level = parseLogLevel(line)
    const levelClass = {
      'info': 'log-info',
      'warn': 'log-warn',
      'error': 'log-error',
      'debug': 'log-debug'
    }[level]

    // 提取时间戳
    const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2})/)
    const timestamp = timestampMatch ? timestampMatch[1] : ''
    const message = timestampMatch ? line.slice(11) : line

    return (
      <div key={index} className="log-entry">
        {timestamp && <span className="log-timestamp">{timestamp}</span>}
        <span className={levelClass}>{message}</span>
      </div>
    )
  }

  return (
    <div className="card">
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="icon-container">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="card-title">系统日志</div>
          <div className="card-subtitle">查看 OpenClaw 运行日志</div>
        </div>
        <button
          onClick={getLogs}
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>刷新</span>
            </>
          )}
        </button>
      </div>

      {/* 卡片内容 */}
      <div className="card-body p-0">
        {logs ? (
          <div className="terminal-output max-h-80 overflow-y-auto">
            {logs.split('\n').filter(line => line.trim()).map((line, index) =>
              formatLogLine(line, index)
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/50">暂无日志</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogsPanel
