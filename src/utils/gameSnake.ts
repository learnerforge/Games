export type Point = { x: number; y: number }

export interface SnakeState {
  snake: Point[]
  food: Point
  dir: Point
  nextDir: Point
  score: number
  gameOver: boolean
  ate: boolean
}

export function createInitialState(size: number): SnakeState {
  const mid = Math.floor(size / 2)
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  return {
    snake,
    food: spawnFood(snake, size),
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    score: 0,
    gameOver: false,
    ate: false,
  }
}

export function spawnFood(snake: Point[], size: number): Point {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`))
  const free: Point[] = []
  for (let x = 0; x < size; x++)
    for (let y = 0; y < size; y++)
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.floor(Math.random() * free.length)]
}

export function isOpposite(a: Point, b: Point): boolean {
  return a.x === -b.x && a.y === -b.y
}

export function tick(
  state: SnakeState,
  size: number,
  wallMode: 'die' | 'wrap',
): SnakeState {
  if (state.gameOver) return state

  const dir = state.nextDir
  let head: Point = {
    x: state.snake[0].x + dir.x,
    y: state.snake[0].y + dir.y,
  }

  if (wallMode === 'wrap') {
    head = {
      x: ((head.x % size) + size) % size,
      y: ((head.y % size) + size) % size,
    }
  }

  const hitWall = head.x < 0 || head.x >= size || head.y < 0 || head.y >= size
  const hitSelf = !hitWall && state.snake.some(s => s.x === head.x && s.y === head.y)

  if (hitWall || hitSelf) {
    return { ...state, gameOver: true }
  }

  const ate = head.x === state.food.x && head.y === state.food.y
  const newSnake = [head, ...state.snake]
  if (!ate) newSnake.pop()

  const newFood = ate ? spawnFood(newSnake, size) : state.food
  const newScore = ate ? state.score + 10 : state.score

  return {
    snake: newSnake,
    food: newFood,
    dir,
    nextDir: dir,
    score: newScore,
    gameOver: false,
    ate,
  }
}
