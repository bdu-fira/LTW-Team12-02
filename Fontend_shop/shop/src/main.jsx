import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={viVN}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
