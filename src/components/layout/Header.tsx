import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function Header() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: 'dark', label: '🌙' },
    { key: 'blue', label: '🌊' },
    { key: 'dust', label: '🏜' },
  ] as const

  return (
    <header className="bg-theme-bg-secondary border-b border-theme-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎮</span>
          <span className="text-lg font-bold text-theme-text">PlayRoads Arena</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link to="/" className="text-theme-text-secondary hover:text-theme-primary transition-colors no-underline">
            Home
          </Link>
          <Link to="/leaderboard" className="text-theme-text-secondary hover:text-theme-primary transition-colors no-underline">
            Scores
          </Link>
          <Link to="/settings" className="text-theme-text-secondary hover:text-theme-primary transition-colors no-underline">
            Settings
          </Link>
          <div className="flex items-center gap-1 ml-2 border-l border-theme-border pl-2">
            {themes.map(t => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`touch-button rounded-lg px-2 py-1 text-sm transition-colors ${
                  theme === t.key
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text-secondary hover:text-theme-text'
                }`}
                aria-label={`${t.key} theme`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
