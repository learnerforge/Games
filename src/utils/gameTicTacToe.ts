export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]
export type WinResult = Player | 'draw' | null

export function createEmptyBoard(size: number): Board {
  return Array(size * size).fill(null)
}

export function getWinLines(size: number): number[][] {
  const lines: number[][] = []

  for (let r = 0; r < size; r++) {
    const row: number[] = []
    for (let c = 0; c < size; c++) row.push(r * size + c)
    lines.push(row)
  }

  for (let c = 0; c < size; c++) {
    const col: number[] = []
    for (let r = 0; r < size; r++) col.push(r * size + c)
    lines.push(col)
  }

  const diag1: number[] = []
  const diag2: number[] = []
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i)
    diag2.push(i * size + (size - 1 - i))
  }
  lines.push(diag1, diag2)

  return lines
}

export function checkWinner(board: Board, size: number): WinResult {
  const lines = getWinLines(size)
  for (const line of lines) {
    const first = board[line[0]]
    if (first && line.every(i => board[i] === first)) return first
  }
  if (board.every(c => c !== null)) return 'draw'
  return null
}

function minimax(board: Board, size: number, depth: number, isMax: boolean, ai: Player, human: Player): number {
  const result = checkWinner(board, size)
  if (result === ai) return 10 - depth
  if (result === human) return depth - 10
  if (result === 'draw') return 0

  let best = isMax ? -Infinity : Infinity
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue
    board[i] = isMax ? ai : human
    const score = minimax(board, size, depth + 1, !isMax, ai, human)
    board[i] = null
    best = isMax ? Math.max(best, score) : Math.min(best, score)
  }
  return best
}

export function getAIMove(board: Board, size: number, difficulty: string, ai: Player): number {
  const human: Player = ai === 'X' ? 'O' : 'X'

  if (difficulty === 'easy') {
    const empty: number[] = []
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) empty.push(i)
    }
    if (empty.length === 0) return -1
    return empty[Math.floor(Math.random() * empty.length)]
  }

  let bestScore = -Infinity
  let bestMove = -1
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue
    board[i] = ai
    const score = minimax(board, size, 0, false, ai, human)
    board[i] = null
    if (score > bestScore) {
      bestScore = score
      bestMove = i
    }
  }
  return bestMove
}
