import { useState, useEffect } from "react";
import AppearanceSettings from "./AppearanceSetttings";
export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    notification: {
      access: "admin",
    },
    appearance: {

      theme: 'light',
      font: 'roboto',
      language: 'en',
    }
  })

  useEffect(() => {
    const theme = settings.appearance.theme


    if (theme === "dark") {
      document.body.classList.add('dark');
    } else if (theme === "light") {
      document.body.classList.remove('dark');
    } else if (theme === "auto") {
      const hour = new Date().getHours();
      if (hour < 18 && hour > 6) {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    }
  }, [settings.appearance.theme])

  useEffect(() => {
    const saved = localStorage.getItem('settings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings))
    alert('Settings saved!')
  }

  return (
    <div className='settings-page'>
      <h2>Settings</h2>
      <AppearanceSettings settings={settings} setSettings={setSettings} />
      <button onClick={handleSave}>Save</button>

    </div>
  )

}
