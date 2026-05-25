import { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const SIZE = 4

type Grid = number[][]

function createEmpty(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addTile(grid: Grid): Grid {
  const g = grid.map(r => [...r])
  const empty: { r: number; c: number }[] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (g[r][c] === 0) empty.push({ r, c })
  if (empty.length === 0) return g
  const { r, c } = empty[Math.floor(Math.random() * empty.length)]
  g[r][c] = Math.random() < 0.9 ? 2 : 4
  return g
}

function slide(row: number[]): { row: number[]; score: number } {
  let arr = row.filter(v => v !== 0)
  let score = 0
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2
      score += arr[i]
      arr.splice(i + 1, 1)
    }
  }
  while (arr.length < SIZE) arr.push(0)
  return { row: arr, score }
}

function moveLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let totalScore = 0
  let moved = false
  const g = grid.map(row => {
    const { row: newRow, score } = slide(row)
    totalScore += score
    if (newRow.some((v, i) => v !== row[i])) moved = true
    return newRow
  })
  return { grid: g, score: totalScore, moved }
}

function rotate(grid: Grid): Grid {
  return grid[0].map((_, c) => grid.map(r => r[c]).reverse())
}

function move(dir: string, grid: Grid): { grid: Grid; score: number; moved: boolean } {
  const rots: Record<string, number> = { left: 0, down: 1, right: 2, up: 3 }
  const n = rots[dir] ?? 0
  let g = grid.map(r => [...r])
  for (let i = 0; i < n; i++) g = rotate(g)
  const result = moveLeft(g)
  g = result.grid
  for (let i = 0; i < (4 - n) % 4; i++) g = rotate(g)
  return { grid: g, score: result.score, moved: result.moved }
}

const TILE_COLORS: Record<number, string> = {
  2: 'bg-amber-100 text-amber-800', 4: 'bg-amber-200 text-amber-800',
  8: 'bg-orange-400 text-white', 16: 'bg-orange-500 text-white',
  32: 'bg-red-500 text-white', 64: 'bg-red-600 text-white',
  128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white', 1024: 'bg-yellow-700 text-white',
  2048: 'bg-yellow-800 text-white',
}

export default function Game2048() {
  const { addScore } = useGame()
  const [grid, setGrid] = useState<Grid>(() => addTile(addTile(createEmpty())))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const handleMove = useCallback((dir: string) => {
    if (gameOver) return
    setGrid(prev => {
      const result = move(dir, prev)
      if (!result.moved) return prev
      const newGrid = addTile(result.grid)
      setScore(s => s + result.score)

      const won = newGrid.some(r => r.some(v => v >= 2048))
      const isOver = !newGrid.some(r => r.some(v => v === 0)) &&
        !['left','right','up','down'].some(d => move(d, newGrid).moved)
      if (isOver && !won) { setGameOver(true); addScore('game2048', { player: loadData().playerName, score, date: new Date().toISOString(), mode: '1p' }) }

      return newGrid
    })
  }, [gameOver, addScore])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      }
      const dir = keyMap[e.key]
      if (dir) { e.preventDefault(); handleMove(dir) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  let touchStart = { x: 0, y: 0 }
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left')
    else handleMove(dy > 0 ? 'down' : 'up')
  }

  const restart = () => {
    setGrid(addTile(addTile(createEmpty())))
    setScore(0)
    setGameOver(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Score: {score}</span>
        {gameOver && <span className="text-theme-danger font-semibold">No moves left!</span>}
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">Restart</button>
      </div>

      <div
        className="inline-grid grid-cols-4 gap-2 p-2 rounded-lg bg-theme-bg-secondary border border-theme-border mx-auto"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg font-bold text-lg transition-all ${
                cell ? TILE_COLORS[cell] || 'bg-theme-bg-card text-theme-text' : 'bg-theme-bg/50'
              }`}
            >
              {cell || ''}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
