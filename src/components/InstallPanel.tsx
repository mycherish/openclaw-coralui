/**
 * InstallPanel 组件
 *
 * 负责：显示安装/卸载面板
 */

import React, { useState, useEffect } from 'react'
import { useOpenClaw } from '../hooks/useOpenClaw'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { 
  Download, 
  Trash2, 
  Zap, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Info
} from 'lucide-react'

interface InstallPanelProps {
  installStatus: {
    installed: boolean
    version?: string
    error?: string
  }
  systemInfo: {
    platform: 'darwin' | 'win32' | 'linux'
    arch: string
    hostname: string
    version: string
  } | null
  onRefresh?: () => void
}

const InstallPanel: React.FC<InstallPanelProps> = ({ installStatus, systemInfo, onRefresh }) => {
  const { installOpenClaw, uninstallOpenClaw, loading } = useOpenClaw()

  // 安装方法选择
  const [selectedInstallMethod, setSelectedInstallMethod] = useState<'script' | 'npm' | 'pnpm'>('script')

  // 卸载级别选择
  const [selectedUninstallLevel, setSelectedUninstallLevel] = useState<'service' | 'state' | 'workspace' | 'all'>('service')

  // 安装结果
  const [installOutput, setInstallOutput] = useState<string>('')

  // 卸载结果
  const [uninstallOutput, setUninstallOutput] = useState<string>('')

  // 确认卸载
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false)

  // 检测是否已安装 npm
  const [hasNpm, setHasNpm] = useState<boolean>(false)
  const [npmVersion, setNpmVersion] = useState<string>('')

  // 监听实时安装输出
  useEffect(() => {
    window.electron.onInstallOutput((data) => {
      setInstallOutput(prev => prev + data)
    })

    return () => {
      window.electron.removeInstallOutputListener()
    }
  }, [])

  // 检测 npm 是否已安装
  useEffect(() => {
    const checkNpm = async () => {
      try {
        const result = await window.electron.checkNpmVersion()
        if (result.success && result.output) {
          setHasNpm(true)
          setNpmVersion(result.output.trim())
        }
      } catch (error) {
        setHasNpm(false)
      }
    }
    checkNpm()
  }, [systemInfo])

  // 监听实时卸载输出
  useEffect(() => {
    window.electron.onUninstallOutput((data) => {
      setUninstallOutput(prev => prev + data)
    })

    return () => {
      window.electron.removeUninstallOutputListener()
    }
  }, [])

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
   * 获取当前平台的一键脚本命令
   */
  const getScriptCommand = (): string => {
    if (systemInfo?.platform === 'win32') {
      return 'npm install -g openclaw'
    } else {
      return 'curl -fsSL https://get.openclaw.app/script/mac | sh'
    }
  }

  /**
   * 安装 OpenClaw
   */
  const handleInstall = async () => {
    setInstallOutput('')
    const result = await installOpenClaw(selectedInstallMethod)

    if (result.success) {
      if (result.installed && result.version) {
        setInstallOutput(prev => prev + `\n\n🎉 安装成功！版本: ${result.version}`)
      } else {
        setInstallOutput(prev => prev + '\n\n✅ 安装完成！')
      }
    } else if (result.output) {
      setInstallOutput(prev => prev + '\n' + result.output)
    }
  }

  /**
   * 卸载 OpenClaw
   */
  const handleUninstall = async () => {
    if (!showUninstallConfirm) {
      setShowUninstallConfirm(true)
      return
    }

    setShowUninstallConfirm(false)
    setUninstallOutput('')

    try {
      const result = await uninstallOpenClaw(selectedUninstallLevel)

      if (result.success) {
        setUninstallOutput(prev => prev + '\n\n✅ 卸载完成！正在刷新状态...')
      } else if (result.output) {
        setUninstallOutput(prev => prev + '\n' + result.output)
      }
    } catch (error) {
      setUninstallOutput(`卸载失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 取消卸载
   */
  const cancelUninstall = () => {
    setShowUninstallConfirm(false)
    setUninstallOutput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {installStatus.installed ? (
            <>
              <Trash2 className="w-5 h-5" />
              卸载 OpenClaw
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              安装 OpenClaw
            </>
          )}
        </CardTitle>
        <CardDescription>
          {installStatus.installed ? '从系统中移除 OpenClaw' : '在当前系统上安装 OpenClaw'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!installStatus.installed ? (
          /* 安装面板 */
          <div className="space-y-6">
            {/* 系统提示 */}
            {systemInfo && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">
                    检测到 {formatPlatform(systemInfo.platform)} 系统
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {hasNpm
                      ? `检测到已安装 npm v${npmVersion}，可选择 npm 方式快速安装`
                      : systemInfo.platform === 'win32'
                      ? '一键安装无需预先安装 Node.js，自动准备运行环境，适合新手'
                      : '一键安装会自动安装 Node.js 和 npm，适合新手'
                    }
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 安装方式选择 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">选择安装方式</h3>
              <RadioGroup value={selectedInstallMethod} onValueChange={(value: any) => setSelectedInstallMethod(value)}>
                <div className="space-y-3">
                  {/* 一键安装 */}
                  <label 
                    htmlFor="script"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedInstallMethod === 'script' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="script" id="script" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">
                          {systemInfo?.platform === 'win32' ? '内置环境安装' : '一键安装'}
                        </span>
                        {!hasNpm && selectedInstallMethod === 'script' && (
                          <Badge variant="secondary">推荐</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {systemInfo?.platform === 'win32'
                          ? '无网络依赖安装，自动准备运行环境，适合新手'
                          : '使用 curl 安装脚本（自动安装 Node.js 和 npm）'
                        }
                      </p>
                      <code className="text-xs px-2 py-1 rounded bg-muted font-mono">
                        {getScriptCommand()}
                      </code>
                    </div>
                  </label>

                  {/* npm 安装 */}
                  <label 
                    htmlFor="npm"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedInstallMethod === 'npm' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="npm" id="npm" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">npm 安装</span>
                        {selectedInstallMethod === 'npm' && hasNpm && (
                          <Badge variant="success">推荐</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {hasNpm
                          ? `系统已安装 npm v${npmVersion}，使用此方式快速安装`
                          : '需要系统已安装 Node.js 和 npm。如果未安装，请先安装 Node.js'
                        }
                      </p>
                      <code className="text-xs px-2 py-1 rounded bg-muted font-mono">
                        npm install -g openclaw
                      </code>
                    </div>
                  </label>

                  {/* pnpm 安装 */}
                  <label 
                    htmlFor="pnpm"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedInstallMethod === 'pnpm' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="pnpm" id="pnpm" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold">pnpm 全局安装</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        通过 pnpm 包管理器安装，速度更快，占用空间更小
                      </p>
                      <code className="text-xs px-2 py-1 rounded bg-muted font-mono">
                        pnpm i -g openclaw
                      </code>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* 安装按钮 */}
            <Button 
              onClick={handleInstall} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  安装中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  开始安装
                </>
              )}
            </Button>

            {/* 安装输出 */}
            {installOutput && (
              <div>
                <h3 className="text-sm font-semibold mb-2">安装输出</h3>
                <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-60 border">
                  {installOutput}
                </pre>
              </div>
            )}
          </div>
        ) : (
          /* 卸载面板 */
          <div className="space-y-6">
            {/* 卸载警告 */}
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">警告</div>
                <div className="text-sm">
                  卸载将删除 OpenClaw 相关的文件和数据。请根据需要选择卸载级别。
                </div>
              </AlertDescription>
            </Alert>

            {/* 卸载级别选择 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">选择卸载级别</h3>
              <RadioGroup 
                value={selectedUninstallLevel} 
                onValueChange={(value: any) => setSelectedUninstallLevel(value)}
                className="grid grid-cols-2 gap-3"
              >
                {/* 仅卸载服务 */}
                <label 
                  htmlFor="service"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedUninstallLevel === 'service' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="service" id="service" className="sr-only" />
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div className="font-semibold">仅卸载服务</div>
                  <div className="text-xs text-muted-foreground">保留配置和数据</div>
                  <Badge variant="success">轻</Badge>
                </label>

                {/* 删除状态数据 */}
                <label 
                  htmlFor="state"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedUninstallLevel === 'state' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="state" id="state" className="sr-only" />
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <div className="font-semibold">删除状态数据</div>
                  <div className="text-xs text-muted-foreground">删除状态和配置</div>
                  <Badge variant="warning">中</Badge>
                </label>

                {/* 删除工作区 */}
                <label 
                  htmlFor="workspace"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedUninstallLevel === 'workspace' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="workspace" id="workspace" className="sr-only" />
                  <Trash2 className="w-6 h-6 text-red-500" />
                  <div className="font-semibold">删除工作区</div>
                  <div className="text-xs text-muted-foreground">包括你的数据</div>
                  <Badge variant="destructive">重</Badge>
                </label>

                {/* 完全卸载 */}
                <label 
                  htmlFor="all"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedUninstallLevel === 'all' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="all" id="all" className="sr-only" />
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="font-semibold">完全卸载</div>
                  <div className="text-xs text-muted-foreground">彻底删除所有</div>
                  <Badge variant="destructive">彻底</Badge>
                </label>
              </RadioGroup>
            </div>

            {/* 卸载按钮 */}
            {showUninstallConfirm ? (
              <div className="flex gap-3">
                <Button 
                  onClick={cancelUninstall}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleUninstall}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2" />
                      卸载中...
                    </>
                  ) : (
                    '确认卸载'
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleUninstall}
                disabled={loading}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    卸载中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    卸载 OpenClaw
                  </>
                )}
              </Button>
            )}

            {/* 卸载输出 */}
            {uninstallOutput && (
              <div>
                <h3 className="text-sm font-semibold mb-2">卸载输出</h3>
                <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-60 border">
                  {uninstallOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InstallPanel
