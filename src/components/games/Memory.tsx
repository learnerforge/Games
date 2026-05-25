import { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

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
  gridCols: number
  gridRows: number
  timerEnabled: boolean
  cardSet: string
}

export default function Memory({ config: rawConfig }: { config: Record<string, unknown> }) {
  const config = {
    gridCols: Number(rawConfig.gridCols) || 4,
    gridRows: Number(rawConfig.gridRows) || 4,
    timerEnabled: rawConfig.timerEnabled !== false,
    cardSet: String(rawConfig.cardSet || 'emoji'),
  } satisfies MemoryConfig

  const { addScore } = useGame()
  const totalCards = config.gridCols * config.gridRows
  const pairs = Math.floor(totalCards / 2)
  const cardSet = CARD_SETS[config.cardSet] || EMOJIS

  const [cards, setCards] = useState<{ value: string; flipped: boolean; matched: boolean }[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [locked, setLocked] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timer, setTimer] = useState(0)

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
    if (gameOver || !config.timerEnabled) return
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [gameOver, config.timerEnabled])

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
        const finalScore = Math.max(1, Math.floor((1000 - moves * 10) / (timer + 1)))
        addScore('memory', { player: loadData().playerName, score: finalScore, date: new Date().toISOString(), mode: '1p' })
      }
    } else {
      setTimeout(() => {
        setCards(prev => { const c = [...prev]; c[a] = { ...c[a], flipped: false }; c[b] = { ...c[b], flipped: false }; return c })
        setFlipped([])
        setLocked(false)
      }, 800)
    }
  }, [flipped, cards, matched, pairs, moves, timer, addScore])

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Moves: {moves}</span>
        {config.timerEnabled && <span>Time: {timer}s</span>}
        {gameOver && <span className="text-theme-success font-semibold">Complete!</span>}
        <button onClick={initGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">Restart</button>
      </div>

      {gameOver && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-theme-success">All matched!</p>
          <p className="text-sm text-theme-text-secondary">{moves} moves in {timer}s</p>
        </div>
      )}

      <div
        className="grid gap-2 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${config.gridCols}, 1fr)` }}
      >
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleFlip(i)}
            className={`touch-button aspect-square rounded-lg text-lg transition-all ${
              card.flipped || card.matched
                ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/30'
                : 'bg-theme-bg-secondary border border-theme-border hover:border-theme-primary'
            } ${card.matched ? 'opacity-50' : ''}`}
          >
            {card.flipped || card.matched ? card.value : '?'}
          </button>
        ))}
      </div>
    </div>
  )
}
