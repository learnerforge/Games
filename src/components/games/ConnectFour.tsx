import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const ROWS = 6
const COLS = 7

type Board = (number | null)[][]

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function checkWin(board: Board, row: number, col: number, player: number): boolean {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (let d = -1; d <= 1; d += 2) {
      let r = row + dr * d, c = col + dc * d
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++
        r += dr * d
        c += dc * d
      }
    }
    if (count >= 4) return true
  }
  return false
}

export default function ConnectFour() {
  const { addScore } = useGame()
  const [board, setBoard] = useState<Board>(createBoard())
  const [turn, setTurn] = useState(1)
  const [winner, setWinner] = useState<number | 'draw' | null>(null)

  const drop = useCallback((col: number) => {
    if (winner) return
    setBoard(prev => {
      const b = prev.map(r => [...r])
      for (let row = ROWS - 1; row >= 0; row--) {
        if (b[row][col] === null) {
          b[row][col] = turn
          if (checkWin(b, row, col, turn)) {
            setWinner(turn)
            addScore('connectfour', { player: loadData().playerName, score: turn === 1 ? 10 : 5, date: new Date().toISOString(), mode: '2p' })
          } else if (b.every(r => r.every(c => c !== null))) {
            setWinner('draw')
          }
          setTurn(t => t === 1 ? 2 : 1)
          return b
        }
      }
      return prev
    })
  }, [turn, winner, addScore])

  const restart = () => {
    setBoard(createBoard())
    setTurn(1)
    setWinner(null)
  }

  const status = winner
    ? winner === 'draw' ? 'Draw!' : `Player ${winner} Wins!`
    : `Player ${turn}'s turn`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-theme-text-secondary">{status}</div>
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm hover:border-theme-primary transition-colors">Restart</button>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              onClick={() => drop(c)}
              disabled={!!winner}
              className="touch-button w-9 h-9 rounded-full bg-theme-primary/20 text-theme-primary text-sm hover:bg-theme-primary/30 transition-colors disabled:opacity-30"
            >
              ↓
            </button>
          ))}
        </div>
        <div className="inline-grid grid-cols-7 gap-1.5 bg-theme-bg-secondary p-2 rounded-lg border border-theme-border">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-9 h-9 rounded-full transition-all ${
                  cell === 1 ? 'bg-red-500 shadow-inner' : cell === 2 ? 'bg-yellow-500 shadow-inner' : 'bg-theme-bg border border-theme-border/50'
                }`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
