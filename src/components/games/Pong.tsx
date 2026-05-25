import { useRef, useEffect, useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const W = 600, H = 400
const PAD_W = 10, PAD_H = 60
const BALL_SIZE = 8
const SPEED = 4

export default function Pong() {
  const { addScore } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'1p' | '2p' | null>(null)
  const [running, setRunning] = useState(false)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [winner, setWinner] = useState<number | null>(null)

  const ballRef = useRef({ x: W/2, y: H/2, dx: SPEED, dy: SPEED })
  const p1Ref = useRef(H/2 - PAD_H/2)
  const p2Ref = useRef(H/2 - PAD_H/2)
  const keysRef = useRef<Set<string>>(new Set())
  const animRef = useRef(0)

  const resetBall = useCallback((dir: number) => {
    ballRef.current = { x: W/2, y: H/2, dx: SPEED * dir, dy: (Math.random() - 0.5) * SPEED }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#334155'
    ctx.fillRect(W/2 - 1, 0, 2, H)

    ctx.fillStyle = '#6366f1'
    ctx.fillRect(0, p1Ref.current, PAD_W, PAD_H)
    ctx.fillStyle = '#ec4899'
    ctx.fillRect(W - PAD_W, p2Ref.current, PAD_W, PAD_H)

    ctx.fillStyle = '#f1f5f9'
    ctx.beginPath()
    ctx.arc(ballRef.current.x, ballRef.current.y, BALL_SIZE/2, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  const update = useCallback(() => {
    const keys = keysRef.current
    if (keys.has('w') || keys.has('ArrowUp')) p1Ref.current = Math.max(0, p1Ref.current - 6)
    if (keys.has('s') || keys.has('ArrowDown')) p1Ref.current = Math.min(H - PAD_H, p1Ref.current + 6)

    if (mode === '2p') {
      if (keys.has('ArrowUp')) p2Ref.current = Math.max(0, p2Ref.current - 6)
      if (keys.has('ArrowDown')) p2Ref.current = Math.min(H - PAD_H, p2Ref.current + 6)
    } else {
      const aiTarget = ballRef.current.y - PAD_H/2
      p2Ref.current += (aiTarget - p2Ref.current) * 0.1
    }

    const ball = ballRef.current
    ball.x += ball.dx
    ball.y += ball.dy

    if (ball.y < 0 || ball.y > H) ball.dy = -ball.dy

    if (ball.x < PAD_W && ball.y > p1Ref.current && ball.y < p1Ref.current + PAD_H) {
      ball.dx = Math.abs(ball.dx)
      const off = (ball.y - p1Ref.current - PAD_H/2) / (PAD_H/2)
      ball.dy = off * SPEED
    }
    if (ball.x > W - PAD_W - BALL_SIZE/2 && ball.y > p2Ref.current && ball.y < p2Ref.current + PAD_H) {
      ball.dx = -Math.abs(ball.dx)
      const off = (ball.y - p2Ref.current - PAD_H/2) / (PAD_H/2)
      ball.dy = off * SPEED
    }

    if (ball.x < 0) {
      setScores(prev => {
        const ns = { ...prev, 2: prev[2] + 1 }
        if (ns[2] >= 5) setWinner(2)
        return ns
      })
      resetBall(-1)
    }
    if (ball.x > W) {
      setScores(prev => {
        const ns = { ...prev, 1: prev[1] + 1 }
        if (ns[1] >= 5) setWinner(1)
        return ns
      })
      resetBall(1)
    }

    draw()
    if (!winner) animRef.current = requestAnimationFrame(update)
  }, [draw, resetBall, winner, mode])

  const startGame = useCallback(() => {
    p1Ref.current = H/2 - PAD_H/2
    p2Ref.current = H/2 - PAD_H/2
    resetBall(1)
    setScores({ 1: 0, 2: 0 })
    setWinner(null)
    setRunning(true)
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(update)
  }, [update, resetBall])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (e.key === ' ') { e.preventDefault(); if (!running) startGame() }
    }
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key)
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [running, startGame])

  useEffect(() => {
    if (winner && mode) {
      addScore('pong', { player: loadData().playerName, score: Math.max(scores[1], scores[2]) * 10, date: new Date().toISOString(), mode })
    }
  }, [winner])

  useEffect(() => {
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  if (!mode) {
    return (
      <div className="text-center py-8">
        <p className="text-theme-text-secondary mb-4">Select mode:</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setMode('1p')} className="touch-button px-6 py-3 rounded-lg bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors">vs AI</button>
          <button onClick={() => setMode('2p')} className="touch-button px-6 py-3 rounded-lg bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors">2 Players</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>P1: {scores[1]}</span>
        <span>P2: {scores[2]} {mode === '1p' ? '(AI)' : ''}</span>
        {winner && <span className="text-theme-success font-semibold">Player {winner} Wins!</span>}
        <button onClick={startGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">
          {running ? 'Restart' : 'Start'}
        </button>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-lg border border-theme-border w-full max-w-[600px]"
          tabIndex={0}
        />
      </div>

      <div className="text-center mt-2 text-xs text-theme-text-secondary">
        {mode === '1p' ? 'W/S or ↑/↓ to move · Space to start' : 'P1: W/S · P2: ↑/↓ · Space to start'}
      </div>
    </div>
  )
}
