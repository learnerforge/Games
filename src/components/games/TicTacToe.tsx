import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createEmptyBoard, checkWinner, getAIMove, getWinLines,
  type Board, type Player,
} from '../../utils/gameTicTacToe'
import type { ScoreEntry } from '../../types'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

interface TTTConfig {
  title: string
  boardSize: number
  aiDifficulty: string
  playerMark: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): TTTConfig {
  return {
    title: String(raw.title || 'Tic Tac Toe'),
    boardSize: [3, 4, 5].includes(Number(raw.boardSize)) ? Number(raw.boardSize) : 3,
    aiDifficulty: raw.aiDifficulty === 'easy' ? 'easy' : 'medium',
    playerMark: ['X', 'O', '★', '●'].includes(String(raw.playerMark)) ? String(raw.playerMark) : 'X',
  }
}

const AI_MARK: Player = 'O'

export default function TicTacToe({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const size = cfg.boardSize
  const playerMark = cfg.playerMark as string

  const [board, setBoard] = useState<Board>(() => createEmptyBoard(size))
  const [turn, setTurn] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [mode, setMode] = useState<'1p' | '2p' | null>(null)
  const [moves, setMoves] = useState(0)
  const [xScore, setXScore] = useState(0)
  const [oScore, setOScore] = useState(0)
  const scoreSubmittedRef = useRef(false)
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isBoardFull = board.every(c => c !== null)

  const submitScore = useCallback((result: Player | 'draw') => {
    if (scoreSubmittedRef.current) return
    scoreSubmittedRef.current = true
    const pts = result === 'X' ? 10 : result === 'O' ? 5 : 0
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameSlug: 'tictactoe',
      gameTitle: cfg.title,
      playerName: loadData().playerName,
      score: pts,
      moves,
      gridSize: cfg.boardSize,
      targetNumber: 0,
      createdAt: new Date().toISOString(),
    }
    onScore?.(pts)
    addScore('tictactoe', { player: entry.playerName, score: pts, date: entry.createdAt, mode: mode! })
  }, [cfg.title, cfg.boardSize, moves, mode, onScore, addScore])

  const handleMove = useCallback((i: number) => {
    if (board[i] || winner || isBoardFull) return
    if (mode === '1p' && turn === AI_MARK) return

    const newBoard = [...board] as Board
    newBoard[i] = turn
    setBoard(newBoard)
    setMoves(m => m + 1)

    const result = checkWinner(newBoard, size)
    if (result) {
      setWinner(result)
      if (result === 'X') setXScore(s => s + 1)
      else if (result === 'O') setOScore(s => s + 1)
      submitScore(result)
      return
    }

    const nextTurn = turn === 'X' ? 'O' : 'X'
    setTurn(nextTurn)
  }, [board, turn, winner, isBoardFull, mode, size, playerMark, submitScore])

  useEffect(() => {
    if (mode !== '1p' || turn !== AI_MARK || winner || isBoardFull) return

    aiTimeoutRef.current = setTimeout(() => {
      setBoard(prev => {
        const aiMove = getAIMove(prev, size, cfg.aiDifficulty, AI_MARK)
        if (aiMove === -1) return prev
        const b = [...prev] as Board
        b[aiMove] = AI_MARK
        const r = checkWinner(b, size)
        if (r) {
          setWinner(r)
          if (r === 'X') setXScore(s => s + 1)
          else if (r === 'O') setOScore(s => s + 1)
          submitScore(r)
        } else {
          setTurn('X')
        }
        setMoves(m => m + 1)
        return b
      })
    }, 300)

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
    }
  }, [mode, turn, winner, isBoardFull, size, cfg.aiDifficulty, submitScore])

  const restart = useCallback(() => {
    setBoard(createEmptyBoard(size))
    setTurn('X')
    setWinner(null)
    setMoves(0)
    scoreSubmittedRef.current = false
    setXScore(0)
    setOScore(0)
  }, [size])

  const cellPx = size <= 3 ? 80 : size <= 4 ? 64 : 52
  const gap = 2
  const boardPx = size * cellPx + (size + 1) * gap

  const winLines = winner && winner !== 'draw'
    ? getWinLines(size).filter(line => line.every(i => board[i] === winner))
    : []

  if (!mode) {
    return (
      <div className="flex flex-col items-center py-8">
        <p className="text-theme-text-secondary mb-4 text-sm">Choose a mode to start:</p>
        <div className="flex gap-3">
          <button onClick={() => setMode('1p')} className="touch-button px-6 py-3 rounded-xl bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors shadow-lg">
            🤖 vs AI
          </button>
          <button onClick={() => setMode('2p')} className="touch-button px-6 py-3 rounded-xl bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors shadow-lg">
            👥 2 Players
          </button>
        </div>
        <p className="mt-4 text-[10px] text-theme-text-secondary/60">
          {cfg.boardSize}×{cfg.boardSize} · {cfg.aiDifficulty === 'easy' ? 'Easy AI' : 'Medium AI'}
        </p>
      </div>
    )
  }

  const displayMark = (internal: 'X' | 'O') =>
    mode === '2p' ? internal : internal === 'X' ? playerMark : 'O'

  const isGameOver = winner !== null || isBoardFull
  let statusText: string
  if (winner === 'draw') statusText = "It's a Draw!"
  else if (winner) statusText = `${displayMark(winner)} Wins!`
  else statusText = `${displayMark(turn)}'s turn`

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{cfg.boardSize}×{cfg.boardSize} · {mode === '1p' ? 'vs AI' : '2 Players'}</p>
        </div>
        <div className="flex gap-2">
          <div className={`text-center rounded-lg px-3 py-1 min-w-[60px] ${turn === 'X' && !isGameOver ? 'ring-2 ring-theme-primary' : ''}`}
            style={{ background: `${turn === 'X' && !isGameOver ? '#6366f122' : 'transparent'}` }}>
            <div className="text-[10px] text-theme-text-secondary uppercase">X</div>
            <div className="text-sm font-bold text-theme-text">{xScore}</div>
          </div>
          <div className={`text-center rounded-lg px-3 py-1 min-w-[60px] ${turn === 'O' && !isGameOver ? 'ring-2 ring-theme-primary' : ''}`}
            style={{ background: `${turn === 'O' && !isGameOver ? '#6366f122' : 'transparent'}` }}>
            <div className="text-[10px] text-theme-text-secondary uppercase">O</div>
            <div className="text-sm font-bold text-theme-text">{oScore}</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-sm font-semibold text-theme-text mb-3">{statusText}</div>

      {/* Board */}
      <div
        className="relative rounded-xl p-[2px] overflow-hidden"
        style={{ width: boardPx, height: boardPx, background: '#94a3b8' }}
      >
        <div
          className="absolute inset-[2px] grid"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: `${gap}px` }}
        >
          {board.map((cell, i) => {
            const isWinning = winLines.some(line => line.includes(i))
            return (
              <div
                key={i}
                onClick={() => handleMove(i)}
                className="flex items-center justify-center rounded-md cursor-pointer font-bold transition-all duration-150 touch-button"
                style={{
                  background: cell ? '#1e293b' : '#334155',
                  color: isWinning ? '#fbbf24' : cell === 'X' ? '#818cf8' : '#f87171',
                  fontSize: cellPx >= 64 ? '28px' : cellPx >= 52 ? '22px' : '18px',
                  opacity: cell || isGameOver ? 1 : 0.7,
                  boxShadow: isWinning ? 'inset 0 0 12px rgba(251,191,36,0.4)' : 'none',
                }}
              >
                {cell ? displayMark(cell) : ''}
              </div>
            )
          })}
        </div>

        {/* Game over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
            <p className="text-2xl font-bold text-white mb-1">
              {winner === 'draw' ? "It's a Draw!" : `${winner ? displayMark(winner) : ''} Wins!`}
            </p>
            <p className="text-sm text-white/70 mb-3">Moves: {moves}</p>
            <button onClick={restart} className="touch-button px-5 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ↻ Restart
          </button>
          <button onClick={() => { setMode(null); restart() }} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ← Mode
          </button>
        </div>
        <div className="text-xs text-theme-text-secondary">
          Moves: {moves}
        </div>
      </div>

      <div className="mt-2 text-[10px] text-theme-text-secondary/60">
        Click a cell to place your mark
      </div>

      <style>{`
        @keyframes ttt-pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}


