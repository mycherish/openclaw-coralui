/**
 * SettingsPage Component
 *
 * 设置页面
 */

import React, { useState, useEffect } from 'react'
import {
  Monitor,
  Keyboard,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { InstallStatus } from '@/types/electron'

interface SettingsPageProps {
  installStatus: InstallStatus
}

type SettingsSection = 'general' | 'shortcuts' | 'about'

interface SettingsItem {
  id: SettingsSection
  label: string
  icon: React.ReactNode
  description: string
}

const settingsItems: SettingsItem[] = [
  { id: 'general', label: '常规', icon: <Monitor className="w-4 h-4" />, description: '基本设置' },
  { id: 'shortcuts', label: '快捷键', icon: <Keyboard className="w-4 h-4" />, description: '快捷键设置' },
  { id: 'about', label: '关于', icon: <Info className="w-4 h-4" />, description: '关于应用' },
]

/**
 * SettingsPage 组件
 */
const SettingsPage: React.FC<SettingsPageProps> = ({ installStatus }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [startMinimized, setStartMinimized] = useState(false)
  const [quickChatShortcut, setQuickChatShortcut] = useState('CommandOrControl+Shift+O')
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false)
  const { toast } = useToast()

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.electron?.getSettings()
        if (settings) {
          setAutoLaunch(settings.autoLaunch || false)
          setStartMinimized(settings.startMinimized || false)
          setQuickChatShortcut(settings.quickChatShortcut || 'CommandOrControl+Shift+O')
        }
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    }
    loadSettings()
  }, [])

  // 切换开机自启
  const handleAutoLaunchChange = async (checked: boolean) => {
    try {
      const result = await window.electron?.setAutoLaunch(checked)
      if (result?.success) {
        setAutoLaunch(checked)
        toast({
          title: checked ? '已开启开机自启' : '已关闭开机自启',
          description: checked ? '应用将在系统启动时自动运行' : '应用不会自动启动',
        })
      } else {
        toast({
          title: '设置失败',
          description: result?.error || '未知错误',
          variant: 'destructive',
        })
      }
    } catch (e: any) {
      toast({
        title: '设置失败',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  // 切换启动时最小化
  const handleStartMinimizedChange = async (checked: boolean) => {
    setStartMinimized(checked)
    await window.electron?.saveSettings({ startMinimized: checked })
  }

  // 开始录制快捷键
  const handleStartRecording = () => {
    setIsRecordingShortcut(true)
    toast({
      title: '请按下新的快捷键',
      description: '按下组合键后自动保存',
    })
  }

  // 监听快捷键录制
  useEffect(() => {
    if (!isRecordingShortcut) return

    const handleKeyDown = async (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 构建快捷键字符串
      const parts: string[] = []
      if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
      if (e.shiftKey) parts.push('Shift')
      if (e.altKey) parts.push('Alt')
      
      // 添加主键
      if (e.key && e.key.length === 1) {
        parts.push(e.key.toUpperCase())
      } else if (e.key === 'Space') {
        parts.push('Space')
      } else if (e.key.startsWith('Arrow')) {
        parts.push(e.key.replace('Arrow', ''))
      } else if (e.key === 'Escape') {
        setIsRecordingShortcut(false)
        toast({ title: '已取消录制' })
        return
      } else {
        parts.push(e.key)
      }

      if (parts.length > 1) {
        const newShortcut = parts.join('+')
        setQuickChatShortcut(newShortcut)
        setIsRecordingShortcut(false)
        
        // 保存快捷键
        const result = await window.electron?.setQuickChatShortcut(newShortcut)
        if (result?.success) {
          toast({
            title: '快捷键已更新',
            description: `Quick Chat 快捷键已设置为: ${newShortcut.replace('CommandOrControl', '⌘').replace('Shift', '⇧')}`,
          })
        } else {
          toast({
            title: '设置失败',
            description: result?.error || '未知错误',
            variant: 'destructive',
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecordingShortcut, toast])

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
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-500" 
                    checked={autoLaunch}
                    onChange={(e) => handleAutoLaunchChange(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white">启动时最小化</p>
                    <p className="text-sm text-white/50">启动后自动最小化到系统托盘</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-500" 
                    checked={startMinimized}
                    onChange={(e) => handleStartMinimizedChange(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        )
      
      case 'shortcuts':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-4">快捷键设置</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white">Quick Chat 快捷键</p>
                      <p className="text-sm text-white/50">按下快捷键快速打开对话窗口</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 font-mono text-white">
                      {quickChatShortcut
                        .replace('CommandOrControl', '⌘')
                        .replace('Shift', '⇧')
                        .replace('Alt', '⌥')
                        .replace(/\+/g, ' + ')}
                    </div>
                    <button
                      onClick={handleStartRecording}
                      className={cn(
                        'px-4 py-2 rounded-lg border transition-colors',
                        isRecordingShortcut
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      )}
                    >
                      {isRecordingShortcut ? '录制中...' : '修改'}
                    </button>
                  </div>
                  {isRecordingShortcut && (
                    <p className="text-sm text-blue-300 mt-2">
                      请按下新的快捷键组合（按 Esc 取消）
                    </p>
                  )}
                </div>
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
                <span className="text-white font-mono">{process.versions.node}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10 text-center">
              <a href="https://github.com/openclaw/openclaw" className="text-blue-400 hover:text-blue-300 text-sm">
                GitHub
              </a>
              <span className="text-white/20 mx-3">|</span>
              <a href="https://docs.openclaw.ai" className="text-blue-400 hover:text-blue-300 text-sm">
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
