/**
 * Sidebar Component
 *
 * macOS 风格的左侧导航栏
 * 包含主导航图标和底部设置入口
 */

import React from 'react'
import {
  LayoutDashboard,
  Download,
  Activity,
  FileText,
  Settings,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from './Logo'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
}

interface SidebarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  isInstalled: boolean
  version?: string
}

const navItems: NavItem[] = [
  { id: 'overview', label: '概览', icon: LayoutDashboard },
  { id: 'install', label: '安装', icon: Download },
  { id: 'monitor', label: '监控', icon: Activity },
  { id: 'logs', label: '日志', icon: FileText },
]

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: '设置', icon: Settings },
]

/**
 * Sidebar 组件
 */
const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isInstalled,
  version
}) => {
  const renderNavItem = (item: NavItem) => {
    const isActive = activeTab === item.id
    const Icon = item.icon

    // 未安装时，部分功能禁用
    const isDisabled = !isInstalled && ['monitor', 'logs'].includes(item.id)

    return (
      <button
        key={item.id}
        onClick={() => !isDisabled && onTabChange(item.id)}
        disabled={isDisabled}
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'group relative',
          isDisabled && 'opacity-40 cursor-not-allowed',
          !isDisabled && !isActive && 'hover:bg-white/10',
          !isDisabled && isActive && [
            'bg-white/15',
            'shadow-lg shadow-black/20',
            'scale-105'
          ]
        )}
        title={item.label}
      >
        <Icon
          className={cn(
            'w-5 h-5 transition-all duration-200',
            isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
          )}
        />

        {/* Tooltip */}
        <span className={cn(
          'absolute left-full ml-3 px-2 py-1 rounded-md',
          'bg-[#2a2a2a] text-white text-xs whitespace-nowrap',
          'opacity-0 pointer-events-none transition-opacity duration-150',
          'group-hover:opacity-100 z-50'
        )}>
          {item.label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <span className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
        )}
      </button>
    )
  }

  return (
    <aside className="w-16 h-full bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center">
      {/* 顶部留白，为原生红绿灯腾出空间 */}
      <div className="w-full pt-8" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo 区域 */}
      <div className="mb-6">
        <Logo size="medium" />
      </div>

      {/* App 名称和版本 */}
      <div className="mb-4 text-center">
        <div className="text-[10px] font-semibold text-white/80">OpenClaw</div>
        {version && (
          <div className="text-[9px] text-white/40">v{version}</div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col items-center gap-2 py-4 border-t border-white/5">
        {bottomNavItems.map(item => renderNavItem(item))}
      </nav>
    </aside>
  )
}

export default Sidebar
