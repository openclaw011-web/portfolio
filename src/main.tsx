import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nProvider } from './lib/i18n'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
)
