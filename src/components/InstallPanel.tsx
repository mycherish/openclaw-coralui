/**
 * InstallPanel 组件
 *
 * 负责：显示安装/卸载面板
 */

import React, { useState, useEffect } from 'react'
import { useOpenClaw } from '../hooks/useOpenClaw'

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
      if (systemInfo?.platform) {
        try {
          const npmCmd = systemInfo.platform === 'win32' ? 'npm.cmd' : 'npm'
          const result = await window.electron.executeCommand(`${npmCmd} --version`)
          if (result.success && result.output) {
            setHasNpm(true)
            setNpmVersion(result.output.trim())
          }
        } catch (error) {
          setHasNpm(false)
        }
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
      return 'npm install -g openclaw' +
        '\n\n⚡ 使用内置环境，无需预先安装 Node.js'
    } else {
      return 'curl -fsSL https://get.openclaw.app/script/mac | sh' +
        '\n\n⚡ macOS 推荐使用 npm 方式'
    }
  }

  /**
   * 安装 OpenClaw
   */
  const handleInstall = async () => {
    setInstallOutput('') // 清空之前的输出
    const result = await installOpenClaw(selectedInstallMethod)

    // 如果安装成功，显示成功消息
    if (result.success) {
      // 如果后端返回了安装信息，直接显示
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
    setUninstallOutput('') // 清空之前的输出

    try {
      const result = await uninstallOpenClaw(selectedUninstallLevel)

      // 如果卸载成功，显示成功消息
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
    <div className="card">
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="icon-container">
          {installStatus.installed ? (
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </div>
        <div>
          <div className="card-title">
            {installStatus.installed ? '卸载 OpenClaw' : '安装 OpenClaw'}
          </div>
          <div className="card-subtitle">
            {installStatus.installed ? '从系统中移除 OpenClaw' : '在当前系统上安装 OpenClaw'}
          </div>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="card-body">
        {!installStatus.installed ? (
          /* 未安装状态 - 显示安装面板 */
          <div className="space-y-6">
            {/* 系统提示 */}
            {systemInfo && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="font-semibold text-blue-400 mb-1">
                      检测到 {formatPlatform(systemInfo.platform)} 系统
                    </div>
                    <div className="text-sm text-white/60">
                      {hasNpm
                        ? `检测到已安装 npm v${npmVersion}，可选择 npm 方式快速安装`
                        : systemInfo.platform === 'win32'
                        ? '一键安装无需预先安装 Node.js，自动准备运行环境，适合新手'
                        : '一键安装会自动安装 Node.js 和 npm，适合新手'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 安装方式选择 */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white/70 mb-3">选择安装方式</div>
              <div className="space-y-3">
                {/* 一键安装（Windows: PowerShell脚本 / macOS: curl） */}
                <div
                  className={`install-method-card ${selectedInstallMethod === 'script' ? 'selected' : ''}`}
                  onClick={() => setSelectedInstallMethod('script')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="install-method-title">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{systemInfo?.platform === 'win32' ? '内置环境安装' : '一键安装'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!hasNpm && selectedInstallMethod === 'script' && (
                        <span className="text-blue-400">⭐ 推荐</span>
                      )}
                    </div>
                  </div>
                  <div className="install-method-desc">
                    {systemInfo?.platform === 'win32'
                      ? '无网络依赖安装，自动准备运行环境，适合新手'
                      : '使用 curl 安装脚本（自动安装 Node.js 和 npm）'
                    }
                  </div>
                  <code className="install-method-tag">
                    {getScriptCommand()}
                  </code>
                </div>

                {/* npm 安装 */}
                <div
                  className={`install-method-card ${selectedInstallMethod === 'npm' ? 'selected' : ''}`}
                  onClick={() => setSelectedInstallMethod('npm')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="install-method-title">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>npm 安装</span>
                    </div>
                    {selectedInstallMethod === 'npm' && hasNpm && (
                      <span className="text-green-400">⭐ 推荐</span>
                    )}
                  </div>
                  <div className="install-method-desc">
                    {hasNpm
                      ? `系统已安装 npm v${npmVersion}，使用此方式快速安装`
                      : '需要系统已安装 Node.js 和 npm。如果未安装，请先安装 Node.js'
                    }
                  </div>
                  <code className="install-method-tag">
                    npm install -g openclaw
                  </code>
                </div>

                {/* pnpm 安装 */}
                <div
                  className={`install-method-card ${selectedInstallMethod === 'pnpm' ? 'selected' : ''}`}
                  onClick={() => setSelectedInstallMethod('pnpm')}
                >
                  <div className="install-method-title">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>pnpm 全局安装</span>
                  </div>
                  <div className="install-method-desc">
                    通过 pnpm 包管理器安装，速度更快，占用空间更小
                  </div>
                  <code className="install-method-tag">
                    pnpm i -g openclaw
                  </code>
                </div>
              </div>
            </div>

            {/* 安装按钮 */}
            <button
              onClick={handleInstall}
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>安装中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>开始安装</span>
                </>
              )}
            </button>

            {/* 安装输出 */}
            {installOutput && (
              <div>
                <div className="text-sm font-semibold text-white/70 mb-2">安装输出</div>
                <div className="terminal-output">{installOutput}</div>
              </div>
            )}
          </div>
        ) : (
          /* 已安装状态 - 显示卸载面板 */
          <div className="space-y-6">
            {/* 卸载警告 */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="font-semibold text-red-400 mb-1">警告</div>
                  <div className="text-sm text-white/60">
                    卸载将删除 OpenClaw 相关的文件和数据。请根据需要选择卸载级别。
                  </div>
                </div>
              </div>
            </div>

            {/* 卸载级别选择 */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white/70 mb-3">选择卸载级别</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`install-method-card ${selectedUninstallLevel === 'service' ? 'selected' : ''}`}
                  onClick={() => setSelectedUninstallLevel('service')}
                >
                  <div className="install-method-title">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>仅卸载服务</span>
                  </div>
                  <div className="install-method-desc">保留配置和数据</div>
                  <span className="install-method-tag">轻</span>
                </button>

                <button
                  className={`install-method-card ${selectedUninstallLevel === 'state' ? 'selected' : ''}`}
                  onClick={() => setSelectedUninstallLevel('state')}
                >
                  <div className="install-method-title">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>删除状态数据</span>
                  </div>
                  <div className="install-method-desc">删除状态和配置</div>
                  <span className="install-method-tag">中</span>
                </button>

                <button
                  className={`install-method-card ${selectedUninstallLevel === 'workspace' ? 'selected' : ''}`}
                  onClick={() => setSelectedUninstallLevel('workspace')}
                >
                  <div className="install-method-title">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>删除工作区</span>
                  </div>
                  <div className="install-method-desc">包括你的数据</div>
                  <span className="install-method-tag">重</span>
                </button>

                <button
                  className={`install-method-card ${selectedUninstallLevel === 'all' ? 'selected' : ''}`}
                  onClick={() => setSelectedUninstallLevel('all')}
                >
                  <div className="install-method-title">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>完全卸载</span>
                  </div>
                  <div className="install-method-desc">彻底删除所有</div>
                  <span className="install-method-tag">彻底</span>
                </button>
              </div>
            </div>

            {/* 卸载按钮 */}
            {showUninstallConfirm ? (
              /* 确认卸载 */
              <div className="btn-group">
                <button
                  onClick={cancelUninstall}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleUninstall}
                  disabled={loading}
                  className={`btn btn-danger ${loading ? 'cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>卸载中...</span>
                    </>
                  ) : (
                    '确认卸载'
                  )}
                </button>
              </div>
            ) : (
              /* 显示卸载按钮 */
              <button
                onClick={handleUninstall}
                disabled={loading}
                className={`btn btn-danger w-full ${loading ? 'cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>卸载中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>卸载 OpenClaw</span>
                  </>
                )}
              </button>
            )}

            {/* 卸载输出 */}
            {uninstallOutput && (
              <div>
                <div className="text-sm font-semibold text-white/70 mb-2">卸载输出</div>
                <div className="terminal-output">{uninstallOutput}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InstallPanel
