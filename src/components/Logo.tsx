/**
 * Logo 组件
 *
 * 自定义 Logo，替代 Emoji
 */

import React from 'react'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  }

  const pixelSize = sizeMap[size]

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景渐变 */}
      <defs>
        <linearGradient id="bg-gradient-sm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0a84ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0066cc', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="crab-gradient-sm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#32d74b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#28a745', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="shell-gradient-sm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff9f0a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ff6b00', stopOpacity: 1 }} />
        </linearGradient>
        
        <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* 主身体 */}
      <ellipse cx="256" cy="320" rx="140" ry="80" fill="url(#bg-gradient-sm)" filter="url(#glow-sm)"/>
      
      {/* 头部 */}
      <circle cx="256" cy="220" r="60" fill="url(#bg-gradient-sm)" filter="url(#glow-sm)"/>
      
      {/* 眼睛 */}
      <circle cx="236" cy="210" r="18" fill="white"/>
      <circle cx="276" cy="210" r="18" fill="white"/>
      <circle cx="238" cy="208" r="8" fill="#1a1a1a"/>
      <circle cx="278" cy="208" r="8" fill="#1a1a1a"/>
      <circle cx="240" cy="206" r="3" fill="white" opacity="0.8"/>
      <circle cx="280" cy="206" r="3" fill="white" opacity="0.8"/>
      
      {/* 触须 */}
      <path d="M 200 180 Q 150 120 130 100" stroke="url(#shell-gradient-sm)" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#glow-sm)"/>
      <path d="M 312 180 Q 362 120 382 100" stroke="url(#shell-gradient-sm)" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#glow-sm)"/>
      
      {/* 左大钳子 */}
      <path d="M 120 340 Q 80 320 60 340 Q 50 360 70 370 Q 100 360 130 370 Q 150 360 150 340 Z" 
            fill="url(#crab-gradient-sm)" filter="url(#glow-sm)"/>
      <path d="M 70 355 Q 90 350 110 360" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
      
      {/* 右大钳子 */}
      <path d="M 392 340 Q 432 320 452 340 Q 462 360 442 370 Q 412 360 382 370 Q 362 360 362 340 Z" 
            fill="url(#crab-gradient-sm)" filter="url(#glow-sm)"/>
      <path d="M 442 355 Q 422 350 402 360" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
      
      {/* 腿部 */}
      <path d="M 180 360 Q 160 400 140 420" stroke="url(#bg-gradient-sm)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M 200 365 Q 185 410 170 435" stroke="url(#bg-gradient-sm)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M 332 360 Q 352 400 372 420" stroke="url(#bg-gradient-sm)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M 312 365 Q 327 410 342 435" stroke="url(#bg-gradient-sm)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      
      {/* 装饰性光点 */}
      <circle cx="140" cy="420" r="6" fill="url(#crab-gradient-sm)"/>
      <circle cx="170" cy="435" r="6" fill="url(#crab-gradient-sm)"/>
      <circle cx="372" cy="420" r="6" fill="url(#crab-gradient-sm)"/>
      <circle cx="342" cy="435" r="6" fill="url(#crab-gradient-sm)"/>
    </svg>
  )
}

export default Logo