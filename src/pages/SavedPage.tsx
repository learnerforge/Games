import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../data/templates'
import { getSavedGames, removeSavedGame } from '../utils/storage'
import { encodeConfig } from '../utils/configCodec'
import { useGame } from '../context/GameContext'

export default function SavedPage() {
  const { refreshKey } = useGame()
  const [games, setGames] = useState(() => getSavedGames())
  // Force refresh when navigating back
  void refreshKey

  const handleDelete = (id: string) => {
    removeSavedGame(id)
    setGames(getSavedGames())
  }

  const handleRefresh = () => {
    setGames(getSavedGames())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Saved Games</h1>
        <button
          onClick={handleRefresh}
          className="touch-button text-sm px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors"
        >
          Refresh
        </button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-theme-text-secondary mb-2">No saved games yet</p>
          <Link to="/" className="text-theme-primary underline text-sm">Browse templates to customize</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => {
            const template = TEMPLATES.find(t => t.slug === game.templateSlug)
            const url = `/#/play/${game.templateSlug}?c=${encodeConfig(game.config)}`
            return (
              <div key={game.id} className="bg-theme-bg-card border border-theme-border rounded-xl p-4">
                <div className="text-2xl mb-2">{template?.icon || '🎮'}</div>
                <h3 className="text-base font-semibold text-theme-text mb-1">{game.name}</h3>
                <p className="text-xs text-theme-text-secondary mb-1">{template?.title || game.templateSlug}</p>
                <p className="text-xs text-theme-text-secondary mb-3">{new Date(game.date).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <Link
                    to={url}
                    className="touch-button flex-1 text-center px-3 py-1.5 rounded-lg bg-theme-primary text-white text-xs font-medium hover:bg-theme-primary-hover transition-colors no-underline"
                  >
                    Play
                  </Link>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="touch-button px-3 py-1.5 rounded-lg bg-theme-danger/10 text-theme-danger border border-theme-danger/30 text-xs hover:bg-theme-danger/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
