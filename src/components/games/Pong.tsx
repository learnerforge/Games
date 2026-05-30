import { useState, useCallback, useRef, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import {
  createPongState, tickPong, defaultPongConfig,
  type PongState, type PongConfig,
} from '../../utils/gamePong'
import type { ScoreEntry } from '../../types'

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): PongConfig & { title: string; color: string } {
  return {
    ...defaultPongConfig,
    title: String(raw.title || 'Pong'),
    scoreToWin: Math.min(11, Math.max(1, Number(raw.scoreToWin) || 5)),
    speed: Math.min(10, Math.max(2, Number(raw.speed) || 4)),
    color: ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b'].includes(String(raw.color)) ? String(raw.color) : '#3b82f6',
  }
}

export default function Pong({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<PongState>(createPongState(cfg))
  const [state, setState] = useState<PongState>(stateRef.current)
  const [paused, setPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const keysRef = useRef({ up: false, down: false, w: false, s: false })
  const scoreSubmitted = useRef(false)
  const animRef = useRef<number>(0)
  const cfgRef = useRef(cfg)
  cfgRef.current = cfg

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const s = stateRef.current
    const c = cfgRef.current

    ctx.clearRect(0, 0, c.width, c.height)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, c.width, c.height)

    // Center line
    ctx.strokeStyle = '#334155'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(c.width / 2, 0)
    ctx.lineTo(c.width / 2, c.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Paddle 1
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(0, s.paddle1Y, c.paddleWidth, c.paddleHeight)

    // Paddle 2
    ctx.fillStyle = c.color
    ctx.fillRect(c.width - c.paddleWidth, s.paddle2Y, c.paddleWidth, c.paddleHeight)

    // Ball
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.ballX + c.ballSize / 2, s.ballY + c.ballSize / 2, c.ballSize / 2, 0, Math.PI * 2)
    ctx.fill()

    // Score
    ctx.fillStyle = '#475569'
    ctx.font = '48px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(String(s.score1), c.width / 2 - 60, 60)
    ctx.fillText(String(s.score2), c.width / 2 + 60, 60)
  }, [])

  const gameLoop = useCallback(() => {
    if (stateRef.current.done) return

    const dir1 = (keysRef.current.w ? -1 : 0) + (keysRef.current.s ? 1 : 0)
    const dir2 = (keysRef.current.up ? -1 : 0) + (keysRef.current.down ? 1 : 0)

    const next = tickPong(stateRef.current, cfgRef.current, dir1, dir2)
    stateRef.current = next
    setState(next)
    draw()

    if (!next.done) {
      animRef.current = requestAnimationFrame(gameLoop)
    }
  }, [draw])

  const startGame = useCallback(() => {
    stateRef.current = createPongState(cfg)
    setState(stateRef.current)
    setStarted(true)
    setPaused(false)
    setPaused(false)
    animRef.current = requestAnimationFrame(gameLoop)
  }, [cfg, gameLoop])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = cfg.width
    canvas.height = cfg.height
    draw()
  }, [cfg.width, cfg.height, draw])

  useEffect(() => {
    if (!started || state.done) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setPaused(p => !p)
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        startGame()
        return
      }
      if (e.key === 'ArrowUp') keysRef.current.up = true
      if (e.key === 'ArrowDown') keysRef.current.down = true
      if (e.key === 'w' || e.key === 'W') keysRef.current.w = true
      if (e.key === 's' || e.key === 'S') keysRef.current.s = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keysRef.current.up = false
      if (e.key === 'ArrowDown') keysRef.current.down = false
      if (e.key === 'w' || e.key === 'W') keysRef.current.w = false
      if (e.key === 's' || e.key === 'S') keysRef.current.s = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [started, state.done, startGame])

  // Pause/Resume animation
  useEffect(() => {
    if (!started || state.done) return
    if (paused) {
      cancelAnimationFrame(animRef.current)
    } else {
      animRef.current = requestAnimationFrame(gameLoop)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [paused, started, state.done, gameLoop])

  // Score submission when done
  useEffect(() => {
    if (!state.done || !started || scoreSubmitted.current) return
    scoreSubmitted.current = true
    const finalScore = Math.max(1, state.score1 * 10)
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameSlug: 'pong', gameTitle: cfg.title,
      playerName: loadData().playerName,
      score: finalScore, moves: state.score1, gridSize: 0, targetNumber: 0,
      createdAt: new Date().toISOString(),
    }
    onScore?.(finalScore)
    addScore('pong', { player: entry.playerName, score: finalScore, date: entry.createdAt, mode: '2p' })
  }, [state.done, started, state.score1, state.score2, cfg.title, onScore, addScore])

  return (
    <div className="flex flex-col items-center w-full mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">First to {cfg.scoreToWin} · {cfg.speed}</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">P1</div>
            <div className="text-sm font-bold text-red-400">{state.score1}</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">P2</div>
            <div className="text-sm font-bold" style={{ color: cfg.color }}>{state.score2}</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="rounded-xl border border-theme-border max-w-full"
        style={{ aspectRatio: `${cfg.width}/${cfg.height}` }}
      />

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3">
        <div className="flex gap-2">
          {started && (
            <button onClick={() => setPaused(p => !p)} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
          <button onClick={startGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ↻ Restart
          </button>
        </div>
        <span className="text-xs text-theme-text-secondary">
          W/S · ↑/↓ · P pause · R restart
        </span>
      </div>

      {/* Start overlay */}
      {!started && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">🏓</p>
            <p className="text-xl font-bold text-theme-text mb-1">{cfg.title}</p>
            <p className="text-sm text-theme-text-secondary mb-4">First to {cfg.scoreToWin}</p>
            <div className="text-xs text-theme-text-secondary mb-4 space-y-1">
              <p><span className="text-red-400 font-bold">W/S</span> — Paddle 1</p>
              <p><span className="font-bold" style={{ color: cfg.color }}>↑/↓</span> — Paddle 2</p>
            </div>
            <button onClick={startGame} className="touch-button px-8 py-3 rounded-xl bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors shadow-lg">
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {started && paused && !state.done && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-2xl font-bold text-theme-text mb-4">Paused</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setPaused(false)} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
                ▶ Resume
              </button>
              <button onClick={startGame} className="touch-button px-6 py-2.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm font-medium hover:border-theme-primary transition-colors">
                ↻ Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {state.done && started && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-xl font-bold text-theme-text mb-1">
              {state.score1 > state.score2 ? 'Player 1 Wins!' : 'Player 2 Wins!'}
            </p>
            <p className="text-sm text-theme-text-secondary mb-4">{state.score1} – {state.score2}</p>
            <button onClick={startGame} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
