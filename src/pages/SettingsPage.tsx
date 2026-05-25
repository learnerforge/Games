import { useTheme } from '../context/ThemeContext'
import { useGame } from '../context/GameContext'
import { usePlayerName } from '../hooks/useLocalStorage'
import type { Theme } from '../types'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { resetAllScores } = useGame()
  const [name, updateName] = usePlayerName()

  const themes: { key: Theme; label: string; desc: string }[] = [
    { key: 'dark', label: '🌙 Dark', desc: 'Easy on the eyes' },
    { key: 'blue', label: '🌊 Blue', desc: 'Light and calm' },
    { key: 'dust', label: '🏜 Dust', desc: 'Warm earth tones' },
  ]

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-theme-text mb-6">Settings</h1>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wide mb-3">
          Player Name
        </h2>
        <input
          type="text"
          value={name}
          onChange={e => updateName(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-2.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm focus:outline-none focus:border-theme-primary transition-colors"
          placeholder="Enter your name"
        />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wide mb-3">
          Theme
        </h2>
        <div className="space-y-2">
          {themes.map(t => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left touch-button ${
                theme === t.key
                  ? 'border-theme-primary bg-theme-primary/10 text-theme-primary'
                  : 'border-theme-border bg-theme-bg-card text-theme-text hover:border-theme-primary/50'
              }`}
            >
              <span className="text-lg">{t.key === 'dark' ? '🌙' : t.key === 'blue' ? '🌊' : '🏜'}</span>
              <div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-theme-text-secondary">{t.desc}</div>
              </div>
              {theme === t.key && (
                <span className="ml-auto text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wide mb-3">
          Data
        </h2>
        <button
          onClick={() => {
            if (window.confirm('Reset all scores?')) resetAllScores()
          }}
          className="touch-button px-4 py-2.5 rounded-lg bg-theme-danger/10 text-theme-danger border border-theme-danger/30 text-sm hover:bg-theme-danger/20 transition-colors"
        >
          Reset All Scores
        </button>
      </section>
    </div>
  )
}
