import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  createEmptyBoard, placeLetter, isBoardFull, getEmptyCells,
  type Board,
} from '../../utils/gameSOS'

interface SOSConfig {
  title: string
  gridSize: number
  winCondition: 'full' | 'points'
  pointsToWin: number
  player1Label: string
  player2Label: string
  boardColor: string
  cellColor: string
  lineColor: string
  textColor: string
  showSosHighlight: boolean
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): SOSConfig {
  return {
    title: String(raw.title || 'SOS'),
    gridSize: Math.min(12, Math.max(5, Number(raw.gridSize) || 8)),
    winCondition: raw.winCondition === 'points' ? 'points' : 'full',
    pointsToWin: Math.min(25, Math.max(3, Number(raw.pointsToWin) || 10)),
    player1Label: String(raw.player1Label || 'Player 1'),
    player2Label: String(raw.player2Label || 'Player 2'),
    boardColor: String(raw.boardColor || '#1e293b'),
    cellColor: String(raw.cellColor || '#334155'),
    lineColor: String(raw.lineColor || '#475569'),
    textColor: String(raw.textColor || '#f1f5f9'),
    showSosHighlight: raw.showSosHighlight !== false,
  }
}

export default function SOS({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const size = cfg.gridSize

  const [board, setBoard] = useState<Board>(() => createEmptyBoard(size))
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [winner, setWinner] = useState<0 | 1 | 2>(0)
  const [sosPositions, setSosPositions] = useState<
    { start: [number, number]; end: [number, number]; mid: [number, number] }[]
  >([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [movesCount, setMovesCount] = useState(0)

  const isGameOver = winner !== 0 || isBoardFull(board)

  const handleCellClick = useCallback((r: number, c: number) => {
    if (isGameOver) return
    if (board[r][c] !== 0) return
    setSelectedCell([r, c])
  }, [board, isGameOver])

  const handlePlaceLetter = useCallback((letter: 'S' | 'O') => {
    if (!selectedCell) return
    const [r, c] = selectedCell
    if (board[r][c] !== 0) { setSelectedCell(null); return }

    const result = placeLetter(board, r, c, letter)
    setBoard(result.board)
    setLastMove([r, c])
    setSosPositions(result.sosPositions)
    setMovesCount(m => m + 1)

    const newScore1 = result.sosFormed && currentPlayer === 1 ? score1 + 1 : score1
    const newScore2 = result.sosFormed && currentPlayer === 2 ? score2 + 1 : score2
    setScore1(newScore1)
    setScore2(newScore2)

    if (result.sosFormed) {
      if (cfg.winCondition === 'points') {
        if (currentPlayer === 1 && newScore1 >= cfg.pointsToWin) {
          setWinner(1)
          if (onScore) onScore(newScore1)
          setSelectedCell(null)
          return
        }
        if (currentPlayer === 2 && newScore2 >= cfg.pointsToWin) {
          setWinner(2)
          if (onScore) onScore(newScore2)
          setSelectedCell(null)
          return
        }
      }
    } else {
      setCurrentPlayer(p => p === 1 ? 2 : 1)
    }

    if (isBoardFull(result.board)) {
      if (newScore1 > newScore2) setWinner(1)
      else if (newScore2 > newScore1) setWinner(2)
      else setWinner(0)
    }

    setSelectedCell(null)
  }, [selectedCell, board, currentPlayer, score1, score2, cfg, onScore])

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard(size))
    setScore1(0)
    setScore2(0)
    setCurrentPlayer(1)
    setWinner(0)
    setSosPositions([])
    setSelectedCell(null)
    setLastMove(null)
    setMovesCount(0)
  }, [size])

  const cellPx = size <= 6 ? 56 : size <= 8 ? 48 : size <= 10 ? 40 : 32
  const gap = 2
  const boardPx = size * cellPx + (size + 1) * gap

  const sosHighlightSet = useMemo(() => {
    if (!cfg.showSosHighlight) return new Set<string>()
    const set = new Set<string>()
    for (const pos of sosPositions) {
      set.add(`${pos.start[0]},${pos.start[1]}`)
      set.add(`${pos.mid[0]},${pos.mid[1]}`)
      set.add(`${pos.end[0]},${pos.end[1]}`)
    }
    return set
  }, [sosPositions, cfg.showSosHighlight])

  const emptyCellCount = getEmptyCells(board).length

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') { handleRestart(); return }
      if (e.key === 's' || e.key === 'S') { handlePlaceLetter('S'); return }
      if (e.key === 'o' || e.key === 'O') { handlePlaceLetter('O'); return }
      if (e.key === 'Escape') { setSelectedCell(null) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handlePlaceLetter, handleRestart])

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto select-none">
      {/* Title & Score */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{size}×{size} · {emptyCellCount} cells left</p>
        </div>
        <div className="flex gap-2">
          <div className={`text-center rounded-lg px-3 py-1 min-w-[60px] ${currentPlayer === 1 && !isGameOver ? 'ring-2 ring-theme-primary' : ''}`}
            style={{ background: currentPlayer === 1 ? `${cfg.cellColor}88` : cfg.cellColor }}>
            <div className="text-[10px] text-theme-text-secondary uppercase truncate max-w-[60px]">{cfg.player1Label}</div>
            <div className="text-sm font-bold text-theme-text">{score1}</div>
          </div>
          <div className={`text-center rounded-lg px-3 py-1 min-w-[60px] ${currentPlayer === 2 && !isGameOver ? 'ring-2 ring-theme-primary' : ''}`}
            style={{ background: currentPlayer === 2 ? `${cfg.cellColor}88` : cfg.cellColor }}>
            <div className="text-[10px] text-theme-text-secondary uppercase truncate max-w-[60px]">{cfg.player2Label}</div>
            <div className="text-sm font-bold text-theme-text">{score2}</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-xl p-[2px] overflow-hidden touch-none"
        style={{ width: boardPx, height: boardPx, background: cfg.boardColor }}
      >
        <div
          className="absolute inset-[2px] grid"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: `${gap}px` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
              const isLast = lastMove?.[0] === r && lastMove?.[1] === c
              const isSos = sosHighlightSet.has(`${r},${c}`)
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="flex items-center justify-center rounded-md cursor-pointer font-bold text-base transition-all duration-150"
                  style={{
                    background: isSelected
                      ? `${cfg.textColor}33`
                      : isSos && cfg.showSosHighlight
                        ? '#fbbf24'
                        : cell === 'S' || cell === 'O'
                          ? cfg.cellColor
                          : `${cfg.cellColor}66`,
                    color: cfg.textColor,
                    opacity: cell !== 0 || isGameOver ? 1 : 0.6,
                    fontSize: cellPx >= 48 ? '20px' : cellPx >= 40 ? '16px' : '13px',
                    border: isLast ? `2px solid ${cfg.textColor}` : `1px solid ${cfg.lineColor}44`,
                    boxShadow: isSos && cfg.showSosHighlight ? '0 0 8px rgba(251, 191, 36, 0.6)' : 'none',
                  }}
                >
                  {cell === 0 ? '' : cell}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Letter selector */}
      {selectedCell && !isGameOver && (
        <div className="flex gap-3 mt-4 animate-fade-in">
          <button
            onClick={() => handlePlaceLetter('S')}
            className="touch-button w-14 h-14 rounded-xl text-2xl font-bold bg-theme-primary text-white hover:bg-theme-primary-hover transition-colors shadow-lg"
          >
            S
          </button>
          <button
            onClick={() => handlePlaceLetter('O')}
            className="touch-button w-14 h-14 rounded-xl text-2xl font-bold bg-theme-primary text-white hover:bg-theme-primary-hover transition-colors shadow-lg"
          >
            O
          </button>
          <button
            onClick={() => setSelectedCell(null)}
            className="touch-button px-4 py-1 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text-secondary text-sm hover:border-theme-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-3 gap-2 flex-wrap">
        <div className="flex gap-2">
          <button onClick={handleRestart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ↻ New Game
          </button>
        </div>
        <div className="text-xs text-theme-text-secondary">
          Moves: {movesCount}
        </div>
      </div>

      {!selectedCell && !isGameOver && (
        <div className="mt-2 text-[10px] text-theme-text-secondary/60">
          {currentPlayer === 1 ? cfg.player1Label : cfg.player2Label}'s turn — tap a cell, then choose S or O
        </div>
      )}

      {/* Win / Draw overlay */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            {winner !== 0 ? (
              <>
                <p className="text-4xl mb-2">🏆</p>
                <p className="text-xl font-bold text-theme-text mb-1">
                  {winner === 1 ? cfg.player1Label : cfg.player2Label} Wins!
                </p>
                <p className="text-sm text-theme-text-secondary mb-4">
                  {score1} – {score2}
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-2">🤝</p>
                <p className="text-xl font-bold text-theme-text mb-1">Draw!</p>
                <p className="text-sm text-theme-text-secondary mb-4">
                  {score1} – {score2}
                </p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  handleRestart()
                }}
                className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="mt-2 text-[10px] text-theme-text-secondary/60">
        Click a cell · Press S or O to place · R = Restart
      </div>
    </div>
  )
}
