/**
 * StatusPanel 组件 - macOS 风格
 *
 * 负责：显示各种状态信息（健康、节点、模型、渠道）
 */

import React from 'react'
import { Activity, Cpu, Bot, Link, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatusPanelProps {
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
    icon: React.ReactNode,
    status: boolean | null,
    output: string
  ) => (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              {icon}
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {status !== null && (
            <Badge variant={status ? 'success' : 'destructive'}>
              {status ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  正常
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  异常
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs text-white/70 font-mono bg-black/20 rounded-lg p-3 overflow-x-auto max-h-60">
          {simplifyOutput(output)}
        </pre>
      </CardContent>
    </Card>
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>状态监控</CardTitle>
            <CardDescription>查看 OpenClaw 各组件运行状态</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 健康状态 */}
          {healthStatus && renderStatusCard(
            '健康检查',
            <Activity className="w-4 h-4" />,
            healthStatus.healthy,
            healthStatus.output
          )}

          {/* 节点状态 */}
          {nodesStatus && renderStatusCard(
            '节点状态',
            <Cpu className="w-4 h-4" />,
            nodesStatus.success,
            nodesStatus.output
          )}

          {/* 模型状态 */}
          {modelsStatus && renderStatusCard(
            '模型状态',
            <Bot className="w-4 h-4" />,
            modelsStatus.success,
            modelsStatus.output
          )}

          {/* 渠道状态 */}
          {channelsStatus && renderStatusCard(
            '渠道状态',
            <Link className="w-4 h-4" />,
            channelsStatus.success,
            channelsStatus.output
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatusPanel
