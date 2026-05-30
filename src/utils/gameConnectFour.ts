export type Board = (number | null)[][]

export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array(cols).fill(null))
}

export function dropPiece(board: Board, col: number, player: number): { board: Board; row: number } | null {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      const newBoard = board.map(r => [...r]) as Board
      newBoard[row][col] = player
      return { board: newBoard, row }
    }
  }
  return null
}

export function checkWin(board: Board, row: number, col: number, player: number, winLength: number): boolean {
  const rows = board.length, cols = board[0].length
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (let d = -1; d <= 1; d += 2) {
      let r = row + dr * d, c = col + dc * d
      while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
        count++
        r += dr * d
        c += dc * d
      }
    }
    if (count >= winLength) return true
  }
  return false
}

export function isBoardFull(board: Board): boolean {
  return board[0].every(c => c !== null)
}
