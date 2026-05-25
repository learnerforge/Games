import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES, CATEGORIES } from '../data/templates'

export default function HomePage() {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter)

  return (
    <div>
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">
          Create & Share Custom Games
        </h1>
        <p className="text-theme-text-secondary text-base max-w-lg mx-auto">
          Pick a template. Tweak the settings. Share your unique version with anyone.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
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
        {filtered.map(t => (
          <div key={t.slug} className="bg-theme-bg-card border border-theme-border rounded-xl p-5 flex flex-col">
            <div className="text-4xl mb-3">{t.icon}</div>
            <h3 className="text-lg font-semibold text-theme-text mb-1">{t.title}</h3>
            <p className="text-sm text-theme-text-secondary mb-4 leading-relaxed flex-1">{t.description}</p>
            <div className="flex gap-2">
              <Link to={`/create/${t.slug}`} className="touch-button flex-1 text-center px-3 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors no-underline">
                Customize
              </Link>
              <Link to={`/play/${t.slug}`} className="touch-button px-3 py-2 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm hover:border-theme-primary transition-colors no-underline">
                Play
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
