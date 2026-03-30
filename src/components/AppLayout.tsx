/**
 * AppLayout Component
 *
 * macOS 风格的三栏布局框架
 * Sidebar | SecondaryBar | MainContent
 */

import React from 'react'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tabId: string) => void
  isInstalled: boolean
  secondaryBar?: React.ReactNode
}

/**
 * AppLayout 组件
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  isInstalled,
  secondaryBar
}) => {
  return (
    <div className="flex h-screen w-full bg-[#0d0d0d] overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isInstalled={isInstalled}
      />

      {/* 次级侧边栏（可选） */}
      {secondaryBar && (
        <aside className="w-56 h-full bg-[#141414] border-r border-white/5 flex flex-col overflow-hidden">
          {secondaryBar}
        </aside>
      )}

      {/* 主内容区域 */}
      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppLayout
