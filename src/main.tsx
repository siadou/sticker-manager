import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppCurrent from './App.tsx'
import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          fontSize: 14,
        },
      }}
    >
      <App>
        <AppCurrent />
      </App>
    </ConfigProvider>
  </StrictMode>,
)
