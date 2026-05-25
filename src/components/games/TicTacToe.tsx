import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

type Player = 'X' | 'O'
type Board = (Player | null)[]

function checkWinner(board: Board): Player | 'draw' | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ]
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  if (board.every(c => c !== null)) return 'draw'
  return null
}

function minimax(board: Board, depth: number, isMax: boolean): number {
  const result = checkWinner(board)
  if (result === 'O') return 10 - depth
  if (result === 'X') return depth - 10
  if (result === 'draw') return 0

  if (isMax) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, depth + 1, false))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, depth + 1, true))
        board[i] = null
      }
    }
    return best
  }
}

function getAIMove(board: Board): number {
  let bestScore = -Infinity
  let bestMove = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const score = minimax(board, 0, false)
      board[i] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }
  return bestMove
}

export default function TicTacToe() {
  const { addScore } = useGame()
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [turn, setTurn] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [mode, setMode] = useState<'1p' | '2p' | null>(null)
  const [score, setScore] = useState(0)

  const handleMove = useCallback((i: number) => {
    if (board[i] || winner) return
    if (mode === '1p' && turn === 'O') return

    const newBoard = [...board]
    newBoard[i] = turn
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result) {
      if (result === 'draw') {
        setWinner('draw')
      } else {
        setWinner(result)
        const pts = result === 'X' ? 10 : 5
        setScore(pts)
        addScore('tictactoe', { player: loadData().playerName, score: pts, date: new Date().toISOString(), mode: mode! })
      }
      return
    }

    const nextTurn = turn === 'X' ? 'O' : 'X'
    setTurn(nextTurn)

    if (mode === '1p' && nextTurn === 'O') {
      setTimeout(() => {
        setBoard(prev => {
          const aiMove = getAIMove(prev)
          if (aiMove === -1) return prev
          const b = [...prev]
          b[aiMove] = 'O'
          const r = checkWinner(b)
          if (r === 'O') {
            setWinner('O')
            setScore(-5)
            addScore('tictactoe', { player: loadData().playerName, score: -5, date: new Date().toISOString(), mode: '1p' })
          } else if (r === 'draw') {
            setWinner('draw')
          } else {
            setTurn('X')
          }
          return b
        })
      }, 300)
    }
  }, [board, turn, winner, mode, addScore])

  const restart = () => {
    setBoard(Array(9).fill(null))
    setTurn('X')
    setWinner(null)
    setScore(0)
  }

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

  const status = winner
    ? winner === 'draw' ? 'Draw!' : `${winner} Wins!`
    : `${turn}'s turn`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-theme-text-secondary">
          {mode === '1p' ? 'vs AI' : '2 Players'} · Score: {score}
        </div>
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm hover:border-theme-primary transition-colors">
          Restart
        </button>
      </div>
      <div className="text-center mb-4 text-base font-semibold text-theme-text">{status}</div>
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleMove(i)}
            className={`touch-button aspect-square rounded-lg text-2xl font-bold transition-all ${
              cell
                ? 'bg-theme-primary/10 text-theme-primary'
                : 'bg-theme-bg-secondary border border-theme-border hover:border-theme-primary'
            } ${winner ? 'cursor-default' : ''}`}
            disabled={!!winner || (mode === '1p' && turn === 'O')}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  )
}
