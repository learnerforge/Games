export type CellValue = 0 | 'S' | 'O'
export type Board = CellValue[][]

export interface PlaceResult {
  board: Board
  sosFormed: boolean
  sosPositions: { start: [number, number]; end: [number, number]; mid: [number, number] }[]
}

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(0) as CellValue[])
}

function inBounds(r: number, c: number, size: number): boolean {
  return r >= 0 && r < size && c >= 0 && c < size
}

export function checkSOS(
  board: Board,
  row: number,
  col: number,
  letter: 'S' | 'O',
): { start: [number, number]; end: [number, number]; mid: [number, number] }[] {
  const size = board.length
  const found: { start: [number, number]; end: [number, number]; mid: [number, number] }[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ]

  for (const [dr, dc] of directions) {
    if (letter === 'S') {
      // SOS pattern: S at (row,col) as start, O as mid, S as end
      const mr = row + dr, mc = col + dc
      const er = row + 2 * dr, ec = col + 2 * dc
      if (
        inBounds(mr, mc, size) && inBounds(er, ec, size) &&
        board[mr][mc] === 'O' && board[er][ec] === 'S'
      ) {
        found.push({ start: [row, col], mid: [mr, mc], end: [er, ec] })
      }
    } else if (letter === 'O') {
      // SOS pattern: O at (row,col) as mid, S as start and end
      const sr = row - dr, sc = col - dc
      const er = row + dr, ec = col + dc
      if (
        inBounds(sr, sc, size) && inBounds(er, ec, size) &&
        board[sr][sc] === 'S' && board[er][ec] === 'S'
      ) {
        found.push({ start: [sr, sc], mid: [row, col], end: [er, ec] })
      }
    }
  }

  return found
}

export function placeLetter(
  board: Board,
  row: number,
  col: number,
  letter: 'S' | 'O',
): PlaceResult {
  const newBoard = board.map(r => [...r]) as Board
  newBoard[row][col] = letter
  const sosPositions = checkSOS(newBoard, row, col, letter)
  return { board: newBoard, sosFormed: sosPositions.length > 0, sosPositions }
}

export function getEmptyCells(board: Board): [number, number][] {
  const empty: [number, number][] = []
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[r].length; c++)
      if (board[r][c] === 0) empty.push([r, c])
  return empty
}

export function isBoardFull(board: Board): boolean {
  return getEmptyCells(board).length === 0
}

export interface SOSGameState {
  board: Board
  score1: number
  score2: number
  currentPlayer: 1 | 2
  winner: 0 | 1 | 2
  isDraw: boolean
  sosPositions: { start: [number, number]; end: [number, number]; mid: [number, number] }[]
  lastMove: [number, number] | null
}
