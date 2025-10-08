import { StrictMode } from 'react'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider defaultTheme='system' storageKey='securelog-theme'>
        <App />
      </ThemeProvider>
    </StrictMode>
)
