/**
 * CSS 样式入口
 * 引入 TailwindCSS
 */
import './index.css'

/**
 * React 主入口
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
