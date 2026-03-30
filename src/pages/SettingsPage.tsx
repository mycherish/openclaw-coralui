/**
 * SettingsPage Component
 *
 * 设置页面
 */

import React, { useState } from 'react'
import {
  Monitor,
  Bell,
  Shield,
  Database,
  Palette,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { InstallStatus } from '@/types/electron'

interface SettingsPageProps {
  installStatus: InstallStatus
}

type SettingsSection = 'general' | 'notifications' | 'security' | 'storage' | 'appearance' | 'about'

interface SettingsItem {
  id: SettingsSection
  label: string
  icon: React.ReactNode
  description: string
}

const settingsItems: SettingsItem[] = [
  { id: 'general', label: '常规', icon: <Monitor className="w-4 h-4" />, description: '基本设置' },
  { id: 'notifications', label: '通知', icon: <Bell className="w-4 h-4" />, description: '通知设置' },
  { id: 'security', label: '安全', icon: <Shield className="w-4 h-4" />, description: '安全选项' },
  { id: 'storage', label: '存储', icon: <Database className="w-4 h-4" />, description: '存储管理' },
  { id: 'appearance', label: '外观', icon: <Palette className="w-4 h-4" />, description: '主题设置' },
  { id: 'about', label: '关于', icon: <Info className="w-4 h-4" />, description: '关于应用' },
]

/**
 * SettingsPage 组件
 */
const SettingsPage: React.FC<SettingsPageProps> = ({ installStatus }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const { toast } = useToast()

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">启动选项</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">开机自动启动</p>
                    <p className="text-sm text-white/50">系统启动时自动运行 OpenClaw</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">启动时最小化</p>
                    <p className="text-sm text-white/50">启动后自动最小化到系统托盘</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">自动更新</h3>
              <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-white">自动检查更新</p>
                  <p className="text-sm text-white/50">定期检查新版本并提示更新</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
              </label>
            </div>
          </div>
        )
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">通知类型</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">服务状态变更</p>
                    <p className="text-sm text-white/50">服务启动、停止或异常时通知</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">错误告警</p>
                    <p className="text-sm text-white/50">发生错误时发送通知</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">更新提示</p>
                    <p className="text-sm text-white/50">有新版本可用时通知</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
                </label>
              </div>
            </div>
          </div>
        )
      
      case 'security':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-300 text-sm">
                安全设置需要重启应用才能生效
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">访问控制</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">仅本地访问</p>
                    <p className="text-sm text-white/50">只允许本机访问管理界面</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">启用 API 密钥</p>
                    <p className="text-sm text-white/50">API 请求需要密钥验证</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                </label>
              </div>
            </div>
          </div>
        )
      
      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">数据目录</h3>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white text-sm mb-2">当前安装路径</p>
                <p className="text-white/50 text-xs font-mono break-all">
                  ~/.openclaw
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">日志设置</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white">日志保留天数</p>
                    <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm">
                      <option value="7">7 天</option>
                      <option value="14">14 天</option>
                      <option value="30" selected>30 天</option>
                      <option value="90">90 天</option>
                    </select>
                  </div>
                  <p className="text-white/50 text-xs">超过保留期的日志将被自动清理</p>
                </div>
                <button
                  onClick={() => {
                    toast({
                      title: '日志已清理',
                      description: '历史日志已成功清理',
                    })
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  清理日志
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">主题</h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-colors text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white border-2 border-blue-500" />
                  <p className="text-white text-sm">浅色</p>
                </button>
                <button className="p-4 rounded-lg bg-white/15 border-2 border-blue-500 transition-colors text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#0d0d0d] border-2 border-blue-500" />
                  <p className="text-white text-sm">深色</p>
                </button>
                <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-colors text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-b from-white to-[#0d0d0d] border border-white/30" />
                  <p className="text-white text-sm">跟随系统</p>
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-3xl">O</span>
              </div>
              <h2 className="text-xl font-bold text-white">OpenClaw CoralUI</h2>
              <p className="text-white/50 mt-1">版本 1.0.0</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/60">OpenClaw 版本</span>
                <span className="text-white font-mono">{installStatus.version || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/60">Electron</span>
                <span className="text-white font-mono">28.0.0</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/60">React</span>
                <span className="text-white font-mono">18.2.0</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/60">Node.js</span>
                <span className="text-white font-mono">18.17.0</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10 text-center">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                检查更新
              </a>
              <span className="text-white/20 mx-3">|</span>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                GitHub
              </a>
              <span className="text-white/20 mx-3">|</span>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                使用文档
              </a>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">设置</h1>
        <p className="text-white/50 mt-1">管理应用设置和偏好</p>
      </div>

      <div className="flex gap-6">
        {/* 左侧导航 */}
        <nav className="w-56 space-y-1">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors',
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              )}
            >
              {item.icon}
              <div>
                <p className="text-sm">{item.label}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* 右侧内容 */}
        <div className="flex-1 p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
