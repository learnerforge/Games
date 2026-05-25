import { useState, useCallback, useEffect, useRef } from 'react'
import {
  initializeBoard, moveTiles, hasAvailableMoves, hasWon,
  getAnimationDuration, getTileStyle, type TileStyleTheme,
} from '../../utils/game2048'
import type { Grid } from '../../utils/game2048'

interface Game2048Config {
  title: string
  gridSize: number
  targetNumber: number
  startingTiles: number
  tileStyle: TileStyleTheme
  boardColor: string
  emptyCellColor: string
  tileTextColor: string
  animationSpeed: string
  difficulty: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): Game2048Config {
  return {
    title: String(raw.title || 'Classic 2048'),
    gridSize: Math.min(6, Math.max(3, Number(raw.gridSize) || 4)),
    targetNumber: Number(raw.targetNumber) || 2048,
    startingTiles: Math.min(3, Math.max(1, Number(raw.startingTiles) || 2)),
    tileStyle: (['classic', 'neon', 'pastel', 'minimal', 'dust'].includes(String(raw.tileStyle)) ? String(raw.tileStyle) : 'classic') as TileStyleTheme,
    boardColor: String(raw.boardColor || '#bbada0'),
    emptyCellColor: String(raw.emptyCellColor || '#cdc1b4'),
    tileTextColor: String(raw.tileTextColor || '#f9f6f2'),
    animationSpeed: String(raw.animationSpeed || 'normal'),
    difficulty: String(raw.difficulty || 'normal'),
  }
}

export default function Game2048({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const animDuration = getAnimationDuration(cfg.animationSpeed)
  const tileStyle = getTileStyle(cfg.tileStyle, cfg.boardColor, cfg.emptyCellColor)
  const size = cfg.gridSize
  const cellPx = size <= 3 ? 80 : size <= 4 ? 64 : 52

  const [board, setBoard] = useState<Grid>(() => initializeBoard(size, cfg.startingTiles, cfg.difficulty))
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(localStorage.getItem('playroads-2048-best') || '0') } catch { return 0 }
  })
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [continuePlaying, setContinuePlaying] = useState(false)
  const [undoStack, setUndoStack] = useState<{ board: Grid; score: number }[]>([])
  const [showNewTile, setShowNewTile] = useState<{ r: number; c: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const saveBest = useCallback((s: number) => {
    if (s > bestScore) {
      setBestScore(s)
      try { localStorage.setItem('playroads-2048-best', String(s)) } catch {}
    }
  }, [bestScore])

  const handleMove = useCallback((dir: string) => {
    if (gameOver || (won && !continuePlaying)) return

    setBoard(prev => {
      const result = moveTiles(prev.map(r => [...r]), dir)
      if (!result.moved) return prev

      setUndoStack(stack => {
        const next = [...stack, { board: prev.map(r => [...r]), score }]
        if (next.length > 10) next.shift()
        return next
      })

      const newScore = score + result.score
      setScore(newScore)
      setMoves(m => m + 1)
      saveBest(newScore)

      const nextGrid = [...result.grid.map(r => [...r])]
      const { r, c } = placeNewTile(nextGrid, cfg.difficulty)
      setShowNewTile({ r, c })
      setTimeout(() => setShowNewTile(null), animDuration)

      if (!continuePlaying && hasWon(nextGrid, cfg.targetNumber)) {
        setWon(true)
        if (onScore) onScore(newScore)
      } else if (!hasAvailableMoves(nextGrid)) {
        setGameOver(true)
        if (onScore) onScore(newScore)
      }

      return nextGrid
    })
  }, [gameOver, won, continuePlaying, score, saveBest, cfg.targetNumber, cfg.difficulty, animDuration, onScore])

  function placeNewTile(grid: Grid, difficulty: string): { r: number; c: number } {
    const empty: { r: number; c: number }[] = []
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[r].length; c++)
        if (grid[r][c] === 0) empty.push({ r, c })
    if (empty.length === 0) return { r: 0, c: 0 }
    const { r, c } = empty[Math.floor(Math.random() * empty.length)]
    const diff = difficulty === 'easy' ? 0.9 : difficulty === 'hard' ? 0.65 : 0.8
    grid[r][c] = Math.random() < diff ? 2 : 4
    return { r, c }
  }

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const last = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setBoard(last.board)
    setScore(last.score)
    if (won) setWon(false)
    if (gameOver) setGameOver(false)
    setContinuePlaying(true)
  }, [undoStack, won, gameOver])

  const handleRestart = useCallback(() => {
    setBoard(initializeBoard(size, cfg.startingTiles, cfg.difficulty))
    setScore(0)
    setMoves(0)
    setWon(false)
    setGameOver(false)
    setContinuePlaying(false)
    setUndoStack([])
  }, [size, cfg.startingTiles, cfg.difficulty])

  const handleContinue = useCallback(() => {
    setContinuePlaying(true)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
        r: 'restart', z: 'undo',
      }
      const action = keyMap[e.key]
      if (!action) return
      e.preventDefault()
      if (action === 'restart') handleRestart()
      else if (action === 'undo') handleUndo()
      else handleMove(action)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove, handleRestart, handleUndo])

  let touchStart = { x: 0, y: 0 }
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left')
    else handleMove(dy > 0 ? 'down' : 'up')
  }

  const gap = size <= 3 ? 6 : size <= 4 ? 4 : 3
  const boardSize = size * cellPx + (size + 1) * gap

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{size}×{size} · Target: {cfg.targetNumber}</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[60px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Score</div>
            <div className="text-sm font-bold text-theme-text">{score}</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[60px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Best</div>
            <div className="text-sm font-bold text-theme-primary">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="relative rounded-xl p-[6px] overflow-hidden touch-none"
        style={{
          width: boardSize,
          height: boardSize,
          background: cfg.boardColor,
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Background cells */}
        <div
          className="absolute inset-[6px] grid"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: `${gap}px` }}
        >
          {Array.from({ length: size * size }).map((_, i) => (
            <div key={`bg-${i}`} className="rounded-lg" style={{ background: cfg.emptyCellColor, opacity: 0.5 }} />
          ))}
        </div>

        {/* Tiles */}
        <div
          className="absolute inset-[6px] grid"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: `${gap}px`, pointerEvents: 'none' }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              if (cell === 0) return <div key={`${r}-${c}`} />
              const colors = tileStyle.cell[cell] || tileStyle.cell[tileStyle.cell[2048] ? 2048 : 2] || { bg: cfg.boardColor, text: cfg.tileTextColor }
              const isNew = showNewTile?.r === r && showNewTile?.c === c
              const fontSize = cell >= 1000 ? (cell >= 10000 ? 'text-xs' : 'text-sm') : 'text-base'
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center rounded-lg font-bold ${fontSize} select-none`}
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    transition: `all ${animDuration}ms ease-in-out`,
                    animation: isNew ? `tile-pop ${animDuration}ms ease-in-out` : 'none',
                    boxShadow: colors.shadow || 'none',
                  }}
                >
                  {cell}
                </div>
              )
            })
          )}
        </div>

        {/* Win overlay */}
        {won && !continuePlaying && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
            <p className="text-3xl font-bold text-yellow-400 mb-1">🎉 You Win!</p>
            <p className="text-sm text-white/80 mb-3">Reached {cfg.targetNumber}!</p>
            <div className="flex gap-2">
              <button onClick={handleContinue} className="touch-button px-5 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover">Continue</button>
              <button onClick={handleRestart} className="touch-button px-5 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30">Restart</button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
            <p className="text-3xl font-bold text-red-400 mb-1">Game Over</p>
            <p className="text-sm text-white/80 mb-1">Score: {score}</p>
            <p className="text-xs text-white/60 mb-3">Moves: {moves}</p>
            <button onClick={handleRestart} className="touch-button px-5 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover">Play Again</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3 gap-2 flex-wrap">
        <div className="flex gap-2">
          <button onClick={handleRestart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ↻ New
          </button>
          <button onClick={handleUndo} disabled={undoStack.length === 0 || gameOver} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ↩ Undo ({undoStack.length})
          </button>
        </div>
        <div className="text-xs text-theme-text-secondary">
          Moves: {moves}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-2 text-[10px] text-theme-text-secondary/60">
        Arrow keys / WASD · R=Restart · Z=Undo
      </div>

      <style>{`
        @keyframes tile-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
