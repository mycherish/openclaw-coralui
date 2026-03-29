/**
 * LogsPanel 组件 - macOS 风格
 *
 * 负责：显示 OpenClaw 日志
 */

import React from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { useOpenClaw } from '../hooks/useOpenClaw'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    const levelColors = {
      'info': 'text-blue-400',
      'warn': 'text-orange-400',
      'error': 'text-red-400',
      'debug': 'text-white/50'
    }

    // 提取时间戳
    const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2})/)
    const timestamp = timestampMatch ? timestampMatch[1] : ''
    const message = timestampMatch ? line.slice(11) : line

    return (
      <div key={index} className="flex gap-2 font-mono text-xs">
        {timestamp && <span className="text-white/40 flex-shrink-0">{timestamp}</span>}
        <span className={levelColors[level]}>{message}</span>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>系统日志</CardTitle>
              <CardDescription>查看 OpenClaw 运行日志</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={getLogs}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '刷新中' : '刷新'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {logs ? (
          <div className="bg-black/20 rounded-lg p-4 max-h-80 overflow-y-auto">
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
      </CardContent>
    </Card>
  )
}

export default LogsPanel
