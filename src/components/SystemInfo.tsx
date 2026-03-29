/**
 * SystemInfo 组件
 * 
 * 负责：显示系统信息和 OpenClaw 安装状态
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu, Monitor, Globe, Info } from 'lucide-react'

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
    const parts = version.split('.')
    return parts.slice(0, 2).join('.')
  }

  /**
   * 获取平台图标
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'darwin':
        return '🍎'
      case 'win32':
        return '🪟'
      case 'linux':
        return '🐧'
      default:
        return '💻'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          系统信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OpenClaw 状态 */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">OpenClaw 状态</p>
            <div className="flex items-center gap-2">
              <Badge variant={installStatus.installed ? 'success' : 'destructive'}>
                {installStatus.installed ? '已安装' : '未安装'}
              </Badge>
              {installStatus.installed && installStatus.version && (
                <Badge variant="outline">v{installStatus.version}</Badge>
              )}
            </div>
          </div>
          <div className="text-3xl">
            {installStatus.installed ? '✅' : '❌'}
          </div>
        </div>

        {/* 系统信息列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              操作系统
            </span>
            <div className="flex items-center gap-2">
              <span>{getPlatformIcon(systemInfo.platform)}</span>
              <span className="text-sm font-medium">{formatPlatform(systemInfo.platform)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              系统架构
            </span>
            <span className="text-sm font-medium">{systemInfo.arch}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              主机名
            </span>
            <span className="text-sm font-medium font-mono">{systemInfo.hostname}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              系统版本
            </span>
            <span className="text-sm font-medium">{formatVersion(systemInfo.version)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemInfo
