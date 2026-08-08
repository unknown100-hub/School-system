import { useState, useEffect } from "react";
export default function AppearanceSettings({ settings, setSettings }) {

    const handleThemeChange = (event) => {
        setSettings({
            ...settings,
            appearance: {
                ...settings.appearance,
                theme: event.target.value
            }
        })
    }
    const handleLanguageChange = (event) => {
        setSettings({
            ...settings,
            appearance: {
                ...settings.appearance,
                language: event.target.value
            }
        })
    }
    const handleFontChange = (event) => {
        setSettings({
            ...settings,
            appearance: {
                ...settings.appearance,
                font: event.target.value
            }
        })
    }
    return (
        <section className="appearance-settings">
            <h2>Appearance</h2>
            <div className="setting-item">
                <label> <span>Theme</span>
                    <select value={settings.appearance.theme} onChange={handleThemeChange}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto" >Auto</option>

                    </select>
                </label>
            </div>

            <div className="setting-item">
                <label><span>Language</span>
                    <select value={settings.appearance.language} onChange={handleLanguageChange}>
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                    </select>
                </label>
            </div>

            <div className="setting-item">
                <label><span>Font</span>
                    <select value={settings.appearance.font} onChange={handleFontChange}>
                        <option value="roboto">Roboto</option>
                        <option value="nunito">Nunito</option>
                    </select>
                </label>
            </div>
        </section>
    )
}