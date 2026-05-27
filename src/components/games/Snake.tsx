import { useState, useRef, useEffect, useCallback } from 'react'
import {
  createInitialState, tick, isOpposite,
  type Point, type SnakeState,
} from '../../utils/gameSnake'
import type { ScoreEntry } from '../../types'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

interface SnakeConfig {
  title: string
  speed: number
  gridSize: number
  snakeColor: string
  foodColor: string
  wallMode: 'die' | 'wrap'
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): SnakeConfig {
  return {
    title: String(raw.title || 'Snake'),
    speed: Math.min(300, Math.max(60, Number(raw.speed) || 150)),
    gridSize: [15, 20, 25].includes(Number(raw.gridSize)) ? Number(raw.gridSize) : 20,
    snakeColor: String(raw.snakeColor || '#6366f1'),
    foodColor: String(raw.foodColor || '#ef4444'),
    wallMode: raw.wallMode === 'wrap' ? 'wrap' : 'die',
  }
}

const MAX_BOARD_PX = 480

export default function Snake({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<SnakeState>(createInitialState(cfg.gridSize))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem('playroads-snake-best') || '0') } catch { return 0 }
  })
  const [foodEaten, setFoodEaten] = useState(0)
  const foodRef = useRef(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animRef = useRef<number>(0)
  const scoreSubmittedRef = useRef(false)

  const cellSize = Math.min(Math.floor(MAX_BOARD_PX / cfg.gridSize), 32)
  const canvasPx = cellSize * cfg.gridSize

  const saveBest = useCallback((s: number) => {
    if (s > highScore) {
      setHighScore(s)
      try { localStorage.setItem('playroads-snake-best', String(s)) } catch {}
    }
  }, [highScore])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const st = stateRef.current
    const cs = cellSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-bg-secondary').trim() || '#1e293b'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < cfg.gridSize; x++) {
      for (let y = 0; y < cfg.gridSize; y++) {
        ctx.fillStyle = `${bg}dd`
        ctx.fillRect(x * cs + 0.5, y * cs + 0.5, cs - 1, cs - 1)
      }
    }

    const headColor = cfg.snakeColor
    const bodyColor = lightenColor(cfg.snakeColor, 20)

    st.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? headColor : bodyColor
      const pad = 1
      const radius = 3
      const x = seg.x * cs + pad
      const y = seg.y * cs + pad
      const w = cs - pad * 2
      const h = cs - pad * 2
      roundRect(ctx, x, y, w, h, radius)
      ctx.fill()
    })

    ctx.fillStyle = cfg.foodColor
    const fx = st.food.x * cs + cs / 2
    const fy = st.food.y * cs + cs / 2
    ctx.beginPath()
    ctx.arc(fx, fy, cs / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff22'
    ctx.fillRect(st.food.x * cs + 1, st.food.y * cs + 1, cs / 4, cs / 4)
  }, [cfg.gridSize, cfg.snakeColor, cfg.foodColor, cellSize])

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, (num >> 16) + percent)
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent)
    const b = Math.min(255, (num & 0x0000FF) + percent)
    return `rgb(${r},${g},${b})`
  }

  const gameTick = useCallback(() => {
    if (paused) return
    const st = stateRef.current
    if (st.gameOver) return

    const newState = tick(st, cfg.gridSize, cfg.wallMode)
    stateRef.current = newState
    setScore(newState.score)
    if (newState.ate) {
      foodRef.current += 1
      setFoodEaten(foodRef.current)
    }

    if (newState.gameOver) {
      setGameOver(true)
      saveBest(newState.score)
      if (!scoreSubmittedRef.current) {
        scoreSubmittedRef.current = true
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameSlug: 'snake',
          gameTitle: cfg.title,
          playerName: loadData().playerName,
          score: newState.score,
          moves: foodRef.current,
          gridSize: cfg.gridSize,
          targetNumber: 0,
          createdAt: new Date().toISOString(),
        }
        onScore?.(newState.score)
        addScore('snake', { player: entry.playerName, score: entry.score, date: entry.createdAt, mode: '1p' })
      }
    }
    draw()
  }, [cfg.gridSize, cfg.wallMode, paused, draw, saveBest, onScore, addScore, cfg.title])

  useEffect(() => {
    if (!started || paused || gameOver) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
      return
    }
    tickRef.current = setInterval(gameTick, cfg.speed)
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }
  }, [started, paused, gameOver, cfg.speed, gameTick])

  useEffect(() => {
    if (!animRef.current) {
      const loop = () => { draw(); animRef.current = requestAnimationFrame(loop) }
      animRef.current = requestAnimationFrame(loop)
    }
    return () => { if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = 0 } }
  }, [draw])

  const startGame = useCallback(() => {
    stateRef.current = createInitialState(cfg.gridSize)
    setScore(0)
    setGameOver(false)
    setPaused(false)
    setStarted(true)
    setFoodEaten(0)
    foodRef.current = 0
    scoreSubmittedRef.current = false
    draw()
  }, [cfg.gridSize, draw])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started) return
      const st = stateRef.current
      const keyMap: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      }
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        if (!gameOver) setPaused(p => !p)
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        startGame()
        return
      }
      const nd = keyMap[e.key]
      if (nd && !isOpposite(nd, st.dir)) {
        stateRef.current.nextDir = nd
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, gameOver, startGame])

  let touchStart = { x: 0, y: 0 }
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!started || gameOver) return
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return
    const st = stateRef.current
    const dirMap: Record<string, Point> = {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
    }
    let dir: string
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left'
    else dir = dy > 0 ? 'down' : 'up'
    const nd = dirMap[dir]
    if (nd && !isOpposite(nd, st.dir)) stateRef.current.nextDir = nd
  }

  return (
    <div className="flex flex-col items-center w-full mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{cfg.gridSize}×{cfg.gridSize} · {cfg.wallMode === 'wrap' ? 'Wrap' : 'Die on wall'}</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[60px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Score</div>
            <div className="text-sm font-bold text-theme-text">{score}</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[60px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Best</div>
            <div className="text-sm font-bold text-theme-primary">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative" style={{ width: canvasPx, height: canvasPx }}>
        <canvas
          ref={canvasRef}
          width={canvasPx}
          height={canvasPx}
          className="rounded-xl border border-theme-border block touch-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />

        {/* Pause overlay */}
        {started && paused && !gameOver && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
            <p className="text-2xl font-bold text-white mb-1">⏸ Paused</p>
            <p className="text-sm text-white/70">Press Space or P to resume</p>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
            <p className="text-3xl font-bold text-red-400 mb-1">Game Over</p>
            <p className="text-sm text-white/80 mb-1">Score: {score}</p>
            <p className="text-xs text-white/60 mb-3">Food eaten: {foodEaten}</p>
            <div className="flex gap-2">
              <button onClick={startGame} className="touch-button px-5 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3 gap-2 flex-wrap">
        <div className="flex gap-2">
          {!started ? (
            <button onClick={startGame} className="touch-button px-4 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Start Game
            </button>
          ) : (
            <>
              <button onClick={() => { if (!gameOver) setPaused(p => !p) }} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button onClick={startGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
                ↻ Restart
              </button>
            </>
          )}
        </div>
        <div className="text-xs text-theme-text-secondary">
          {foodEaten} food
        </div>
      </div>

      {!started && (
        <div className="mt-2 text-[10px] text-theme-text-secondary/60">
          Arrow keys / WASD · Space = Pause · R = Restart
        </div>
      )}
      {started && !paused && !gameOver && (
        <div className="mt-2 text-[10px] text-theme-text-secondary/60">
          Space / P = Pause
        </div>
      )}
    </div>
  )
}
