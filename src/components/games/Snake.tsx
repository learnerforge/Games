import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const GRID_SIZE = 20
const CELL_SIZE = 20
const SPEED = 150

type Dir = { x: number; y: number }
type Point = { x: number; y: number }

export default function Snake() {
  const { addScore } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const gameRef = useRef({ snake: [{ x: 10, y: 10 }], food: { x: 15, y: 15 }, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, running: false })

  const spawnFood = useCallback((snake: Point[]): Point => {
    let p: Point
    do {
      p = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }
    } while (snake.some(s => s.x === p.x && s.y === p.y))
    return p
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-bg-secondary').trim() || '#1e293b'
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

    const g = gameRef.current
    g.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#6366f1' : '#818cf8'
      ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    ctx.fillStyle = '#ef4444'
    ctx.fillRect(g.food.x * CELL_SIZE + 1, g.food.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
  }, [])

  const gameLoop = useCallback(() => {
    const g = gameRef.current
    if (!g.running) return

    g.dir = g.nextDir
    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || g.snake.some(s => s.x === head.x && s.y === head.y)) {
      g.running = false
      setGameOver(true)
      return
    }

    g.snake.unshift(head)
    if (head.x === g.food.x && head.y === g.food.y) {
      g.food = spawnFood(g.snake)
      setScore(s => {
        const ns = s + 10
        return ns
      })
    } else {
      g.snake.pop()
    }

    draw()
    setTimeout(gameLoop, SPEED)
  }, [draw, spawnFood])

  const startGame = () => {
    const g = gameRef.current
    g.snake = [{ x: 10, y: 10 }]
    g.dir = { x: 1, y: 0 }
    g.nextDir = { x: 1, y: 0 }
    g.food = spawnFood(g.snake)
    g.running = true
    setGameOver(false)
    setScore(0)
    setStarted(true)
    setTimeout(gameLoop, SPEED)
  }

  useEffect(() => {
    if (!started) return
    const handleKey = (e: KeyboardEvent) => {
      const g = gameRef.current
      const keyMap: Record<string, Dir> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      }
      const nd = keyMap[e.key]
      if (nd && (nd.x !== -g.dir.x || nd.y !== -g.dir.y)) {
        g.nextDir = nd
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started])

  useEffect(() => {
    if (!started || !canvasRef.current) return
    draw()
  }, [started, draw])

  const handleSwipe = (dir: string) => {
    const g = gameRef.current
    const dirMap: Record<string, Dir> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
    const nd = dirMap[dir]
    if (nd && (nd.x !== -g.dir.x || nd.y !== -g.dir.y)) g.nextDir = nd
  }

  let touchStart = { x: 0, y: 0 }
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.x
    const dy = t.clientY - touchStart.y
    if (Math.abs(dx) > Math.abs(dy)) handleSwipe(dx > 0 ? 'right' : 'left')
    else handleSwipe(dy > 0 ? 'down' : 'up')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Score: {score}</span>
        {gameOver && <span className="text-theme-danger font-semibold">Game Over!</span>}
        <button onClick={() => { startGame() }} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">
          {started ? 'Restart' : 'Start'}
        </button>
      </div>

      <div
        className="flex justify-center touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="rounded-lg border border-theme-border"
        />
      </div>

      {!started && (
        <div className="text-center mt-3">
          <p className="text-sm text-theme-text-secondary">Use arrow keys or swipe to play</p>
        </div>
      )}

      {gameOver && score > 0 && (
        <div className="text-center mt-3">
          {(() => { addScore('snake', { player: loadData().playerName, score, date: new Date().toISOString(), mode: '1p' }); return null })()}
        </div>
      )}
    </div>
  )
}
