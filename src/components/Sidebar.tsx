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

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
}

interface SidebarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  isInstalled: boolean
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
  isInstalled
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
    <aside className="w-16 h-full bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
        <span className="text-white font-bold text-lg">O</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col items-center gap-2 pt-4 border-t border-white/5">
        {bottomNavItems.map(item => renderNavItem(item))}
      </nav>
    </aside>
  )
}

export default Sidebar
