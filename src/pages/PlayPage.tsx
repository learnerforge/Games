import { useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { TEMPLATES } from '../data/templates'
import { decodeConfig, validateConfig } from '../utils/configCodec'
import { getGameComponent } from '../components/games/gameMap'
import { useGame } from '../context/GameContext'
import { loadData } from '../utils/storage'
import Leaderboard from '../components/ui/Leaderboard'
import type { ScoreEntry } from '../types'

export default function PlayPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { addScoreEntry, getBestScore } = useGame()

  const template = TEMPLATES.find(t => t.slug === slug)

  const config = useMemo(() => {
    if (!template) return null
    const encoded = searchParams.get('c')
    if (!encoded || encoded === '') return template.defaultConfig
    const decoded = decodeConfig(encoded)
    if (!decoded) return template.defaultConfig
    return validateConfig(decoded, template.configSchema)
  }, [template, searchParams])

  if (!template || !config) {
    return (
      <div className="text-center py-20">
        <p className="text-theme-text-secondary text-lg">Game not found</p>
        <Link to="/" className="text-theme-primary underline mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  const GameComponent = getGameComponent(template.componentKey)
  const isShared = searchParams.has('c') && searchParams.get('c') !== ''

  const handleScore = (score: number) => {
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameSlug: template.slug,
      gameTitle: template.title,
      playerName: loadData().playerName,
      score,
      moves: 0,
      gridSize: Number(config.gridSize) || 0,
      targetNumber: Number(config.targetNumber) || 0,
      createdAt: new Date().toISOString(),
    }
    addScoreEntry(entry)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="touch-button text-theme-text-secondary hover:text-theme-text transition-colors text-sm">← Home</Link>
          <h2 className="text-xl font-bold text-theme-text">{template.icon} {template.title}</h2>
          {isShared && <span className="text-xs bg-theme-primary/10 text-theme-primary px-2 py-0.5 rounded-full">Shared</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-text-secondary">Best: {getBestScore(template.slug)}</span>
          <Link to={`/create/${template.slug}`} className="touch-button text-xs px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors no-underline">
            Customize
          </Link>
        </div>
      </div>

      <div className="bg-theme-bg-card border border-theme-border rounded-xl p-4 md:p-6 mb-6">
        {GameComponent ? (
          <GameComponent config={config} onScore={handleScore} />
        ) : (
          <div className="text-center py-10 text-theme-text-secondary">
            <p>This game template is being set up.</p>
          </div>
        )}
      </div>

      <Leaderboard gameSlug={template.slug} />
    </div>
  )
}
