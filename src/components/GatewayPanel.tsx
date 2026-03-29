/**
 * GatewayPanel 组件 - macOS 风格
 *
 * 负责：显示 Gateway 状态和控制按钮
 */

import React, { useState } from 'react'
import { Play, Square, RotateCw, Wifi } from 'lucide-react'
import { useOpenClaw } from '../hooks/useOpenClaw'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GatewayPanelProps {
  gatewayStatus: {
    status: 'running' | 'stopped' | 'unknown'
    output: string
  }
}

const GatewayPanel: React.FC<GatewayPanelProps> = ({ gatewayStatus }) => {
  const { startGateway, stopGateway, restartGateway, loading } = useOpenClaw()

  // 操作结果
  const [operationOutput, setOperationOutput] = useState<string>('')

  /**
   * 启动 Gateway
   */
  const handleStart = async () => {
    setOperationOutput('正在启动 Gateway...')
    const result = await startGateway()
    setOperationOutput(result.output)
  }

  /**
   * 停止 Gateway
   */
  const handleStop = async () => {
    setOperationOutput('正在停止 Gateway...')
    const result = await stopGateway()
    setOperationOutput(result.output)
  }

  /**
   * 重启 Gateway
   */
  const handleRestart = async () => {
    setOperationOutput('正在重启 Gateway...')
    const result = await restartGateway()
    setOperationOutput(result.output)
  }

  /**
   * 获取状态信息
   */
  const getStatusInfo = () => {
    switch (gatewayStatus.status) {
      case 'running':
        return { variant: 'success' as const, text: '运行中' }
      case 'stopped':
        return { variant: 'secondary' as const, text: '已停止' }
      default:
        return { variant: 'outline' as const, text: '未知' }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Gateway 网关</CardTitle>
              <CardDescription>控制 OpenClaw Gateway 服务</CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>
            {statusInfo.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 控制按钮 */}
        <div className="flex gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            disabled={loading || gatewayStatus.status === 'running'}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <Play className="w-4 h-4 mr-2" />
            启动
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={loading || gatewayStatus.status !== 'running'}
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            停止
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={loading || gatewayStatus.status !== 'running'}
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            重启
          </Button>
        </div>

        {/* 操作输出 */}
        {operationOutput && (
          <div>
            <div className="text-sm font-semibold text-white/70 mb-2">操作输出</div>
            <pre className="text-xs text-white/70 font-mono bg-black/20 rounded-lg p-3 overflow-x-auto max-h-40">
              {operationOutput}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GatewayPanel
