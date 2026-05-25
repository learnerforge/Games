import { useState } from 'react'
import GameCard from '../components/ui/GameCard'
import { GAMES, CATEGORIES } from '../data/games'
import type { GameCategory } from '../types'

export default function HomePage() {
  const [filter, setFilter] = useState<GameCategory | 'all'>('all')

  const filtered = filter === 'all'
    ? GAMES
    : GAMES.filter(g => g.category === filter)

  return (
    <div>
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">
          Play Mini Games Instantly
        </h1>
        <p className="text-theme-text-secondary text-base max-w-lg mx-auto">
          No downloads. No sign-ups. Just pick a game and play in your browser.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key as GameCategory | 'all')}
            className={`touch-button rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === cat.key
                ? 'bg-theme-primary text-white'
                : 'bg-theme-bg-secondary text-theme-text-secondary border border-theme-border hover:border-theme-primary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(game => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  )
}
