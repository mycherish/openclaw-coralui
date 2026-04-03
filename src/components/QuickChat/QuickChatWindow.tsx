/**
 * QuickChatWindow - 快速对话窗口组件
 *
 * 类似 Spotlight/Alfred 的浮动窗口
 * 支持输入问题、显示回复、Markdown 渲染
 * 支持懒加载历史消息（上滑加载更多）
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, AlertCircle, X, ExternalLink, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import './QuickChatWindow.css'

// Electron API 类型定义
declare global {
  interface Window {
    electron?: {
      quickChatLoadHistory: (options?: {
        beforeTimestamp?: string
        limit?: number
      }) => Promise<{
        success: boolean
        messages?: Array<{ role: string; content: string; timestamp: string }>
        hasMore?: boolean
        error?: string
      }>
      quickChatSend: (message: string) => Promise<{
        success: boolean
        response?: string
        error?: string
      }>
      showMainWindow: () => void
    }
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickChatWindowProps {
  onClose?: () => void
}

/**
 * Markdown 渲染组件
 */
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // 代码块
        code({ inline, className, children, ...props }: any) {
          return !inline ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          )
        },
        // 链接 - 在新窗口打开
        a({ href, children }: any) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        },
        // 表格
        table({ children }: any) {
          return <div className="table-wrapper"><table>{children}</table></div>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

const QuickChatWindow: React.FC<QuickChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const hasMoreHistoryRef = useRef(true)

  // 加载历史消息（懒加载，用户上滑时触发）
  const loadHistory = useCallback(async (beforeTimestamp?: string) => {
    if (!window.electron?.quickChatLoadHistory) return
    
    // 如果是加载更多，检查是否已经在加载
    if (beforeTimestamp && loadingMoreRef.current) return
    
    // 如果不是加载更多，检查是否还有历史
    if (!beforeTimestamp && !hasMoreHistoryRef.current) return

    try {
      if (beforeTimestamp) {
        setLoadingMore(true)
        loadingMoreRef.current = true
      }
      
      const result = await window.electron.quickChatLoadHistory({
        beforeTimestamp,
        limit: 20
      })
      
      if (result.success && result.messages && result.messages.length > 0) {
        const historyMessages: Message[] = result.messages.map((msg, index) => ({
          id: `history-${Date.now()}-${index}`,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }))
        
        if (beforeTimestamp) {
          // 加载更多：插入到前面
          setMessages(prev => [...historyMessages, ...prev])
        } else {
          // 首次加载
          setMessages(historyMessages)
        }
        
        // 更新是否还有更多历史
        const hasMore = result.hasMore ?? false
        setHasMoreHistory(hasMore)
        hasMoreHistoryRef.current = hasMore
      } else if (!beforeTimestamp) {
        // 首次加载但没有消息
        setHasMoreHistory(false)
        hasMoreHistoryRef.current = false
      }
    } catch (e) {
      console.error('加载历史消息失败:', e)
    } finally {
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }, []) // 无依赖，使用 ref 跟踪状态

  // 检测滚动到顶部，触发加载更多
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || loadingMore || !hasMoreHistory) return
    
    // 检测是否滚动到顶部（scrollTop 接近 0）
    if (container.scrollTop < 50) {
      // 获取最早消息的时间戳
      const oldestMessage = messages[0]
      if (oldestMessage) {
        loadHistory(oldestMessage.timestamp.toISOString())
      }
    }
  }, [loadingMore, hasMoreHistory, messages, loadHistory])

  // 初始化 - 首次加载最近的历史消息
  useEffect(() => {
    // 加载最近的 20 条历史消息
    loadHistory()
    
    // 聚焦输入框
    inputRef.current?.focus()

    // 监听 Esc 键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, loadHistory])

  // 自动滚动到底部
  useEffect(() => {
    // 只在发送新消息时滚动，加载历史时不滚动
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loadingMore])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)
    
    try {
      if (!window.electron?.quickChatSend) {
        throw new Error('API 不可用')
      }
      
      const result = await window.electron.quickChatSend(userMessage.content)
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response || '无响应内容',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setError(result.error || '发送失败')
      }
    } catch (e: any) {
      setError(e.message || '发送失败')
    } finally {
      setLoading(false)
      // 发送完成后聚焦回输入框
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  // 处理输入框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果正在输入法组合输入(如中文拼音),不处理回车
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  // 打开主窗口
  const handleOpenMainWindow = () => {
    window.electron?.showMainWindow()
    onClose?.()
  }

  return (
    <div className="quickchat-container">
      {/* 标题栏 */}
      <div className="quickchat-header">
        <div className="quickchat-title">
          <span className="quickchat-logo">🐙</span>
          <span>Quick Chat</span>
        </div>
        <div className="quickchat-actions">
          <button
            className="quickchat-action-btn"
            onClick={handleOpenMainWindow}
            title="打开主窗口"
          >
            <ExternalLink size={14} />
          </button>
          <button
            className="quickchat-action-btn"
            onClick={onClose}
            title="关闭 (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="quickchat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {/* 加载更多历史指示器 */}
        {loadingMore && (
          <div className="quickchat-loading-more">
            <Loader2 size={14} className="spin" />
            <span>加载历史消息...</span>
          </div>
        )}
        
        {/* 上滑加载提示 */}
        {!loadingMore && hasMoreHistory && messages.length > 0 && (
          <div className="quickchat-load-more-hint" onClick={() => {
            const oldestMessage = messages[0]
            if (oldestMessage) {
              loadHistory(oldestMessage.timestamp.toISOString())
            }
          }}>
            <ChevronUp size={14} />
            <span>上滑加载更多</span>
          </div>
        )}

        {messages.length === 0 && (
          <div className="quickchat-empty">
            <div className="quickchat-empty-icon">💬</div>
            <div className="quickchat-empty-text">
              输入问题,按 Enter 发送
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`quickchat-message ${msg.role}`}>
            <div className="quickchat-message-role">
              {msg.role === 'user' ? '👤' : '🐙'}
            </div>
            <div className="quickchat-message-content">
              {msg.role === 'assistant' ? (
                <MarkdownContent content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="quickchat-message assistant">
            <div className="quickchat-message-role">🐙</div>
            <div className="quickchat-message-content loading">
              <Loader2 size={16} className="spin" />
              <span>思考中...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="quickchat-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="quickchat-input-area">
        <input
          ref={inputRef}
          type="text"
          className="quickchat-input"
          placeholder="输入问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="quickchat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* 快捷键提示 */}
      <div className="quickchat-hint">
        <span>Esc 关闭</span>
        <span>⌘⇧O 切换</span>
      </div>
    </div>
  )
}

export default QuickChatWindow
