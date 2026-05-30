import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import type { ScoreEntry } from '../../types'

const EMOJIS = ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝','🍌','🍍','🥭','🫐','🍈','🥥','🍅','🥑','🌽','🥕']
const ANIMALS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦']
const NUMBERS = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18']

const CARD_SETS: Record<string, string[]> = { emoji: EMOJIS, animals: ANIMALS, numbers: NUMBERS }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface MemoryConfig {
  title: string
  gridCols: number
  gridRows: number
  timerEnabled: boolean
  cardSet: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): MemoryConfig {
  return {
    title: String(raw.title || 'Memory'),
    gridCols: Math.min(6, Math.max(2, Number(raw.gridCols) || 4)),
    gridRows: Math.min(6, Math.max(2, Number(raw.gridRows) || 4)),
    timerEnabled: raw.timerEnabled !== false,
    cardSet: ['emoji', 'animals', 'numbers'].includes(String(raw.cardSet)) ? String(raw.cardSet) : 'emoji',
  }
}

export default function Memory({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const totalCards = cfg.gridCols * cfg.gridRows
  const pairs = Math.floor(totalCards / 2)
  const cardSet = CARD_SETS[cfg.cardSet] || EMOJIS

  const [cards, setCards] = useState<{ value: string; flipped: boolean; matched: boolean }[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [locked, setLocked] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timer, setTimer] = useState(0)
  const scoreSubmitted = useRef(false)

  const initGame = useCallback(() => {
    const selected = shuffle(cardSet).slice(0, pairs)
    const extra = totalCards % 2 !== 0 ? [cardSet[0]] : []
    const deck = shuffle([...selected, ...selected, ...extra]).map(e => ({ value: e, flipped: false, matched: false }))
    setCards(deck)
    setFlipped([])
    setMoves(0)
    setMatched(0)
    setLocked(false)
    setGameOver(false)
    setTimer(0)
  }, [cardSet, pairs, totalCards])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    if (gameOver || !cfg.timerEnabled) return
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [gameOver, cfg.timerEnabled])

  const handleFlip = useCallback((i: number) => {
    if (locked || cards[i]?.flipped || cards[i]?.matched || gameOver) return
    if (flipped.length === 2) return
    setCards(prev => { const c = [...prev]; c[i] = { ...c[i], flipped: true }; return c })
    setFlipped(prev => [...prev, i])
  }, [locked, cards, flipped, gameOver])

  useEffect(() => {
    if (flipped.length !== 2) return
    setLocked(true)
    setMoves(m => m + 1)
    const [a, b] = flipped
    if (cards[a]?.value === cards[b]?.value) {
      setCards(prev => { const c = [...prev]; c[a] = { ...c[a], matched: true }; c[b] = { ...c[b], matched: true }; return c })
      const newMatched = matched + 1
      setMatched(newMatched)
      setFlipped([])
      setLocked(false)
      if (newMatched >= pairs) {
        setGameOver(true)
        if (!scoreSubmitted.current) {
          scoreSubmitted.current = true
          const finalScore = Math.max(1, Math.floor((1000 - moves * 10) / (timer + 1)))
          const entry: ScoreEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            gameSlug: 'memory', gameTitle: cfg.title,
            playerName: loadData().playerName,
            score: finalScore, moves, gridSize: cfg.gridCols, targetNumber: 0,
            createdAt: new Date().toISOString(),
          }
          onScore?.(finalScore)
          addScore('memory', { player: entry.playerName, score: finalScore, date: entry.createdAt, mode: '1p' })
        }
      }
    } else {
      setTimeout(() => {
        setCards(prev => { const c = [...prev]; c[a] = { ...c[a], flipped: false }; c[b] = { ...c[b], flipped: false }; return c })
        setFlipped([])
        setLocked(false)
      }, 800)
    }
  }, [flipped, cards, matched, pairs, moves, timer, cfg.title, cfg.gridCols, onScore, addScore])

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{cfg.gridCols}×{cfg.gridRows} · {cfg.cardSet}</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Moves</div>
            <div className="text-sm font-bold text-theme-text">{moves}</div>
          </div>
          {cfg.timerEnabled && (
            <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
              <div className="text-[10px] text-theme-text-secondary uppercase">Time</div>
              <div className="text-sm font-bold text-theme-text">{timer}s</div>
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cfg.gridCols}, 1fr)` }}>
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleFlip(i)}
            className={`touch-button aspect-square rounded-xl text-lg transition-all ${
              card.flipped || card.matched
                ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/30'
                : 'bg-theme-bg-secondary border border-theme-border hover:border-theme-primary'
            } ${card.matched ? 'opacity-40' : ''}`}
          >
            {card.flipped || card.matched ? card.value : '❓'}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3">
        <button onClick={initGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
          ↻ Restart
        </button>
        <span className="text-xs text-theme-text-secondary">{matched}/{pairs} pairs</span>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-xl font-bold text-theme-text mb-1">All Matched!</p>
            <p className="text-sm text-theme-text-secondary mb-4">{moves} moves in {timer}s</p>
            <button onClick={initGame} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
