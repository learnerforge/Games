import { useState, useCallback, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import { createBoard, dropPiece, checkWin, isBoardFull, type Board } from '../../utils/gameConnectFour'
import type { ScoreEntry } from '../../types'

interface CFConfig {
  title: string
  rows: number
  cols: number
  winLength: number
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): CFConfig {
  return {
    title: String(raw.title || 'Connect Four'),
    rows: [6, 7, 8].includes(Number(raw.rows)) ? Number(raw.rows) : 6,
    cols: [7, 8, 9].includes(Number(raw.cols)) ? Number(raw.cols) : 7,
    winLength: Math.min(5, Math.max(3, Number(raw.winLength) || 4)),
  }
}

export default function ConnectFour({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const [board, setBoard] = useState<Board>(() => createBoard(cfg.rows, cfg.cols))
  const [turn, setTurn] = useState(1)
  const [winner, setWinner] = useState<number | 'draw' | null>(null)
  const [moves, setMoves] = useState(0)
  const scoreSubmitted = useRef(false)

  const handleDrop = useCallback((col: number) => {
    if (winner) return
    setBoard(prev => {
      const result = dropPiece(prev, col, turn)
      if (!result) return prev
      const { board: newBoard, row } = result
      const won = checkWin(newBoard, row, col, turn, cfg.winLength)
      const draw = !won && isBoardFull(newBoard)
      if (won) {
        setWinner(turn)
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameSlug: 'connectfour',
          gameTitle: cfg.title,
          playerName: loadData().playerName,
          score: turn === 1 ? 10 : 5,
          moves: moves + 1,
          gridSize: cfg.rows,
          targetNumber: cfg.winLength,
          createdAt: new Date().toISOString(),
        }
        if (!scoreSubmitted.current) { scoreSubmitted.current = true; onScore?.(entry.score) }
        addScore('connectfour', { player: entry.playerName, score: entry.score, date: entry.createdAt, mode: '2p' })
      } else if (draw) {
        setWinner('draw')
      } else {
        setTurn(t => t === 1 ? 2 : 1)
      }
      setMoves(m => m + 1)
      return newBoard
    })
  }, [turn, winner, moves, cfg.title, cfg.rows, cfg.winLength, onScore, addScore])

  const restart = useCallback(() => {
    setBoard(createBoard(cfg.rows, cfg.cols))
    setTurn(1); setWinner(null); setMoves(0)
  }, [cfg.rows, cfg.cols])

  const cellSize = cfg.cols <= 7 ? 40 : 36
  const gap = 2
  const isGameOver = winner !== null

  const getStatusText = () => {
    if (winner === 'draw') return "It's a Draw!"
    if (winner) return `Player ${winner} Wins!`
    return `Player ${turn}'s turn`
  }

  return (
    <div className="flex flex-col items-center w-full mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{cfg.rows}×{cfg.cols} · Connect {cfg.winLength}</p>
        </div>
        <div className="flex gap-2">
          <div className={`text-center rounded-lg px-3 py-1 min-w-[50px] ${turn === 1 && !isGameOver ? 'ring-2 ring-red-400' : ''}`}
            style={{ background: turn === 1 && !isGameOver ? '#ef444422' : 'transparent' }}>
            <div className="text-[10px] text-theme-text-secondary uppercase">P1</div>
            <div className="text-sm font-bold text-red-400">●</div>
          </div>
          <div className={`text-center rounded-lg px-3 py-1 min-w-[50px] ${turn === 2 && !isGameOver ? 'ring-2 ring-yellow-400' : ''}`}
            style={{ background: turn === 2 && !isGameOver ? '#eab30822' : 'transparent' }}>
            <div className="text-[10px] text-theme-text-secondary uppercase">P2</div>
            <div className="text-sm font-bold text-yellow-400">●</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-sm font-semibold text-theme-text mb-3">{getStatusText()}</div>

      {/* Column drop buttons */}
      <div className="flex gap-[2px] mb-1" style={{ width: cfg.cols * cellSize + (cfg.cols - 1) * gap }}>
        {Array.from({ length: cfg.cols }, (_, c) => (
          <button key={c} onClick={() => handleDrop(c)} disabled={isGameOver}
            className="touch-button flex-1 h-8 rounded-t-lg bg-theme-bg-secondary border border-theme-border/50 text-xs text-theme-text-secondary hover:text-theme-primary hover:border-theme-primary transition-colors disabled:opacity-30"
          >
            ↓
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="bg-theme-bg-secondary rounded-xl p-2 border border-theme-border"
        style={{ width: cfg.cols * cellSize + (cfg.cols - 1) * gap + 16 }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cfg.cols}, ${cellSize}px)`, gap: `${gap}px` }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`}
                className="rounded-full transition-all"
                style={{
                  width: cellSize, height: cellSize,
                  background: cell === 1 ? '#ef4444'
                    : cell === 2 ? '#eab308'
                    : '#1e293b',
                  boxShadow: cell ? 'inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)' : 'none',
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3">
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
          ↻ Restart
        </button>
        <span className="text-xs text-theme-text-secondary">Moves: {moves}</span>
      </div>

      <div className="mt-2 text-[10px] text-theme-text-secondary/60">
        Click ↓ to drop · Players take turns
      </div>

      {/* Game over overlay */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">
              {winner === 'draw' ? '🤝' : winner === 1 ? '🔴' : '🟡'}
            </p>
            <p className="text-xl font-bold text-theme-text mb-1">
              {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </p>
            <p className="text-sm text-theme-text-secondary mb-4">{moves} moves played</p>
            <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
