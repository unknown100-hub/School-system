import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const savedSettings = localStorage.getItem('settings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    const theme = settings?.appearance?.theme;
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else if (theme === 'auto') {
      const hour = new Date().getHours();
      if (hour < 18 && hour > 6) {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    }
  }
} catch (e) {
  console.error('Failed to load theme settings', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
