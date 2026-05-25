export type Grid = number[][]

export interface MoveResult {
  grid: Grid
  score: number
  moved: boolean
  merged: { row: number; col: number; value: number }[]
}

export function createEmptyBoard(size: number): Grid {
  return Array.from({ length: size }, () => Array(size).fill(0))
}

export function getDifficultySpawn(difficulty: string): { p2: number; p4: number } {
  switch (difficulty) {
    case 'easy': return { p2: 0.9, p4: 0.1 }
    case 'hard': return { p2: 0.65, p4: 0.35 }
    default: return { p2: 0.8, p4: 0.2 }
  }
}

export function getEmptyCells(grid: Grid): { r: number; c: number }[] {
  const empty: { r: number; c: number }[] = []
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c] === 0) empty.push({ r, c })
  return empty
}

export function addRandomTile(grid: Grid, difficulty: string): Grid {
  const empty = getEmptyCells(grid)
  if (empty.length === 0) return grid
  const { r, c } = empty[Math.floor(Math.random() * empty.length)]
  const { p2 } = getDifficultySpawn(difficulty)
  const g = grid.map(row => [...row])
  g[r][c] = Math.random() < p2 ? 2 : 4
  return g
}

export function initializeBoard(size: number, startingTiles: number, difficulty: string): Grid {
  let g = createEmptyBoard(size)
  for (let i = 0; i < startingTiles; i++) g = addRandomTile(g, difficulty)
  return g
}

export function mergeLine(line: number[]): { result: number[]; score: number; mergeCount: number } {
  let arr = line.filter(v => v !== 0)
  let score = 0
  let mergeCount = 0
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2
      score += arr[i]
      mergeCount++
      arr.splice(i + 1, 1)
    }
  }
  while (arr.length < line.length) arr.push(0)
  return { result: arr, score, mergeCount }
}

export function moveLeft(grid: Grid): MoveResult {
  let totalScore = 0
  let moved = false
  const merged: MoveResult['merged'] = []
  const g = grid.map((row, r) => {
    const { result: newRow, score } = mergeLine(row)
    totalScore += score
    if (newRow.some((v, i) => v !== row[i])) moved = true
    for (let c = 0; c < newRow.length; c++) {
      if (newRow[c] !== row[c] && newRow[c] !== 0) merged.push({ row: r, col: c, value: newRow[c] })
    }
    return newRow
  })
  return { grid: g, score: totalScore, moved, merged }
}

export function rotateCW(grid: Grid): Grid {
  const n = grid.length
  return Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => grid[n - 1 - r][c]))
}

export function rotateCCW(grid: Grid): Grid {
  const n = grid.length
  return Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => grid[r][n - 1 - c]))
}

export function moveUp(grid: Grid): MoveResult {
  const rotated = rotateCCW(grid)
  const result = moveLeft(rotated)
  return { ...result, grid: rotateCW(result.grid) }
}

export function moveDown(grid: Grid): MoveResult {
  const rotated = rotateCW(grid)
  const result = moveLeft(rotated)
  return { ...result, grid: rotateCCW(result.grid) }
}

export function moveRight(grid: Grid): MoveResult {
  const flipped = grid.map(r => [...r].reverse())
  const result = moveLeft(flipped)
  return { ...result, grid: result.grid.map(r => r.reverse()) }
}

export function moveTiles(grid: Grid, dir: string): MoveResult {
  switch (dir) {
    case 'left': return moveLeft(grid)
    case 'right': return moveRight(grid)
    case 'up': return moveUp(grid)
    case 'down': return moveDown(grid)
    default: return { grid, score: 0, moved: false, merged: [] }
  }
}

export function hasAvailableMoves(grid: Grid): boolean {
  if (getEmptyCells(grid).length > 0) return true
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const v = grid[r][c]
      if ((r + 1 < grid.length && grid[r + 1][c] === v) ||
          (c + 1 < grid[r].length && grid[r][c + 1] === v)) return true
    }
  }
  return false
}

export function hasWon(grid: Grid, target: number): boolean {
  return grid.some(r => r.some(v => v >= target))
}

export function getAnimationDuration(speed: string): number {
  switch (speed) {
    case 'slow': return 200
    case 'fast': return 60
    default: return 120
  }
}

export function getTileValue(gridSize: number): number {
  return gridSize <= 3 ? 48 : gridSize <= 4 ? 36 : 28
}

export type TileStyleTheme = 'classic' | 'neon' | 'pastel' | 'minimal' | 'dust'

export interface TileColors {
  bg: string
  text: string
  cell: Record<number, { bg: string; text: string; shadow?: string }>
}

const STYLE_COLORS: Record<TileStyleTheme, (boardColor: string, emptyColor: string) => TileColors> = {
  classic: () => ({
    bg: '#bbada0', text: '#776e65',
    cell: {
      2: { bg: '#eee4da', text: '#776e65' },
      4: { bg: '#ede0c8', text: '#776e65' },
      8: { bg: '#f2b179', text: '#f9f6f2' },
      16: { bg: '#f59563', text: '#f9f6f2' },
      32: { bg: '#f67c5f', text: '#f9f6f2' },
      64: { bg: '#f65e3b', text: '#f9f6f2' },
      128: { bg: '#edcf72', text: '#f9f6f2' },
      256: { bg: '#edcc61', text: '#f9f6f2' },
      512: { bg: '#edc850', text: '#f9f6f2' },
      1024: { bg: '#edc53f', text: '#f9f6f2' },
      2048: { bg: '#edc22e', text: '#f9f6f2' },
      4096: { bg: '#b884cb', text: '#f9f6f2' },
      8192: { bg: '#a0a0a0', text: '#f9f6f2' },
    },
  }),
  neon: () => ({
    bg: '#0a0a1a', text: '#e0e0ff',
    cell: {
      2: { bg: '#1a1a3e', text: '#818cf8' },
      4: { bg: '#1e1b4b', text: '#a78bfa' },
      8: { bg: '#312e81', text: '#c4b5fd' },
      16: { bg: '#3730a3', text: '#ddd6fe' },
      32: { bg: '#4c1d95', text: '#ede9fe' },
      64: { bg: '#5b21b6', text: '#f5f3ff' },
      128: { bg: '#6d28d9', text: '#ffffff' },
      256: { bg: '#7c3aed', text: '#ffffff' },
      512: { bg: '#8b5cf6', text: '#ffffff' },
      1024: { bg: '#9333ea', text: '#ffffff' },
      2048: { bg: '#a855f7', text: '#ffffff' },
      4096: { bg: '#c084fc', text: '#ffffff' },
      8192: { bg: '#e9d5ff', text: '#1a1a3e' },
    },
  }),
  pastel: () => ({
    bg: '#f8f0e3', text: '#8b7355',
    cell: {
      2: { bg: '#fce4ec', text: '#c62828' },
      4: { bg: '#f3e5f5', text: '#6a1b9a' },
      8: { bg: '#e8eaf6', text: '#283593' },
      16: { bg: '#e0f2f1', text: '#00695c' },
      32: { bg: '#e8f5e9', text: '#2e7d32' },
      64: { bg: '#fff3e0', text: '#e65100' },
      128: { bg: '#fce4ec', text: '#880e4f' },
      256: { bg: '#f3e5f5', text: '#4a148c' },
      512: { bg: '#e8eaf6', text: '#1a237e' },
      1024: { bg: '#e0f2f1', text: '#004d40' },
      2048: { bg: '#e8f5e9', text: '#1b5e20' },
      4096: { bg: '#fff3e0', text: '#bf360c' },
      8192: { bg: '#fce4ec', text: '#b71c1c' },
    },
  }),
  minimal: (boardColor, _emptyColor) => ({
    bg: boardColor, text: '#333333',
    cell: {
      2: { bg: '#ffffff', text: '#333333' },
      4: { bg: '#f8f8f8', text: '#333333' },
      8: { bg: '#f0f0f0', text: '#333333' },
      16: { bg: '#e8e8e8', text: '#222222' },
      32: { bg: '#e0e0e0', text: '#222222' },
      64: { bg: '#d8d8d8', text: '#222222' },
      128: { bg: '#d0d0d0', text: '#111111' },
      256: { bg: '#c8c8c8', text: '#111111' },
      512: { bg: '#c0c0c0', text: '#111111' },
      1024: { bg: '#b8b8b8', text: '#000000' },
      2048: { bg: '#b0b0b0', text: '#000000' },
      4096: { bg: '#a8a8a8', text: '#000000' },
      8192: { bg: '#a0a0a0', text: '#000000' },
    },
  }),
  dust: () => ({
    bg: '#292524', text: '#d6d3d1',
    cell: {
      2: { bg: '#44403c', text: '#d6d3d1' },
      4: { bg: '#57534e', text: '#d6d3d1' },
      8: { bg: '#78716c', text: '#fafaf9' },
      16: { bg: '#a8a29e', text: '#1c1917' },
      32: { bg: '#92400e', text: '#fffbeb' },
      64: { bg: '#b45309', text: '#fffbeb' },
      128: { bg: '#d97706', text: '#1c1917' },
      256: { bg: '#f59e0b', text: '#1c1917' },
      512: { bg: '#fbbf24', text: '#1c1917' },
      1024: { bg: '#fcd34d', text: '#1c1917' },
      2048: { bg: '#fde68a', text: '#1c1917' },
      4096: { bg: '#d4a373', text: '#1c1917' },
      8192: { bg: '#e6ccb2', text: '#1c1917' },
    },
  }),
}

export function getTileStyle(style: TileStyleTheme, boardColor: string, _emptyColor: string): TileColors {
  return (STYLE_COLORS[style] || STYLE_COLORS.classic)(boardColor, _emptyColor)
}
