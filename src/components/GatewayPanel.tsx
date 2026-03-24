/**
 * GatewayPanel 组件 - macOS 风格
 *
 * 负责：显示 Gateway 状态和控制按钮
 */

import React, { useState } from 'react'
import { useOpenClaw } from '../hooks/useOpenClaw'

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
        return { icon: '✅', text: '运行中', color: 'running' }
      case 'stopped':
        return { icon: '❌', text: '已停止', color: 'stopped' }
      default:
        return { icon: '⚠️', text: '未知', color: 'unknown' }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="card">
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="icon-container">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        </div>
        <div>
          <div className="card-title">Gateway 网关</div>
          <div className="card-subtitle">控制 OpenClaw Gateway 服务</div>
        </div>
        <div className={`status-badge ${statusInfo.color} ml-auto`}>
          <div className={`status-dot ${statusInfo.color}`} />
          <span>{statusInfo.text}</span>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="card-body">
        {/* 控制按钮 */}
        <div className="btn-group mb-4">
          <button
            onClick={handleStart}
            disabled={loading || gatewayStatus.status === 'running'}
            className={`btn btn-success ${loading || gatewayStatus.status === 'running' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>启动</span>
          </button>

          <button
            onClick={handleStop}
            disabled={loading || gatewayStatus.status !== 'running'}
            className={`btn btn-danger ${loading || gatewayStatus.status !== 'running' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span>停止</span>
          </button>

          <button
            onClick={handleRestart}
            disabled={loading || gatewayStatus.status !== 'running'}
            className={`btn btn-primary ${loading || gatewayStatus.status !== 'running' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重启</span>
          </button>
        </div>

        {/* 操作输出 */}
        {operationOutput && (
          <div>
            <div className="text-sm font-semibold text-white/70 mb-2">操作输出</div>
            <div className="terminal-output">{operationOutput}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GatewayPanel
