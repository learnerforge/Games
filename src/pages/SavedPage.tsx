import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../data/templates'
import { getSavedGames, removeSavedGame } from '../utils/storage'
import { encodeConfig } from '../utils/configCodec'

export default function SavedPage() {
  const [games, setGames] = useState(() => getSavedGames())

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this saved game?')) return
    removeSavedGame(id)
    setGames(getSavedGames())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Saved Games</h1>
        <button onClick={() => setGames(getSavedGames())} className="touch-button text-sm px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">
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
                <h3 className="text-base font-semibold text-theme-text mb-1">{game.title}</h3>
                <p className="text-xs text-theme-text-secondary mb-1">{template?.title || game.templateSlug}</p>
                <p className="text-xs text-theme-text-secondary mb-3">Saved {new Date(game.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <a href={url} className="touch-button flex-1 text-center px-3 py-1.5 rounded-lg bg-theme-primary text-white text-xs font-medium hover:bg-theme-primary-hover transition-colors no-underline">
                    Play
                  </a>
                  <Link to={`/create/${game.templateSlug}`} state={{ config: game.config }} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors no-underline">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(game.id)} className="touch-button px-3 py-1.5 rounded-lg bg-theme-danger/10 text-theme-danger border border-theme-danger/30 text-xs hover:bg-theme-danger/20 transition-colors">
                    Del
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
