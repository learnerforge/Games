export interface PongState {
  ballX: number
  ballY: number
  ballVx: number
  ballVy: number
  paddle1Y: number
  paddle2Y: number
  score1: number
  score2: number
  done: boolean
}

export interface PongConfig {
  width: number
  height: number
  paddleHeight: number
  paddleWidth: number
  ballSize: number
  speed: number
  scoreToWin: number
}

export const defaultPongConfig: PongConfig = {
  width: 600,
  height: 400,
  paddleHeight: 80,
  paddleWidth: 12,
  ballSize: 10,
  speed: 4,
  scoreToWin: 5,
}

export function createPongState(cfg: PongConfig): PongState {
  return {
    ballX: cfg.width / 2,
    ballY: cfg.height / 2,
    ballVx: (Math.random() > 0.5 ? 1 : -1) * cfg.speed,
    ballVy: (Math.random() > 0.5 ? 1 : -1) * cfg.speed * 0.5,
    paddle1Y: cfg.height / 2 - cfg.paddleHeight / 2,
    paddle2Y: cfg.height / 2 - cfg.paddleHeight / 2,
    score1: 0,
    score2: 0,
    done: false,
  }
}

export function tickPong(
  state: PongState,
  cfg: PongConfig,
  paddle1Dir: number,
  paddle2Dir: number,
): PongState {
  if (state.done) return state

  const s = { ...state }

  // Move paddles
  s.paddle1Y = Math.max(0, Math.min(cfg.height - cfg.paddleHeight, s.paddle1Y + paddle1Dir * cfg.speed * 1.2))
  s.paddle2Y = Math.max(0, Math.min(cfg.height - cfg.paddleHeight, s.paddle2Y + paddle2Dir * cfg.speed * 1.2))

  // Move ball
  s.ballX += s.ballVx
  s.ballY += s.ballVy

  // Top/bottom bounce
  if (s.ballY <= 0 || s.ballY >= cfg.height - cfg.ballSize) {
    s.ballVy = -s.ballVy
  }

  // Paddle 1 (left) collision
  if (
    s.ballVx < 0 &&
    s.ballX <= cfg.paddleWidth &&
    s.ballX > 0 &&
    s.ballY + cfg.ballSize >= s.paddle1Y &&
    s.ballY <= s.paddle1Y + cfg.paddleHeight
  ) {
    s.ballVx = cfg.speed
    const hit = (s.ballY + cfg.ballSize / 2 - (s.paddle1Y + cfg.paddleHeight / 2)) / (cfg.paddleHeight / 2)
    s.ballVy = hit * cfg.speed
  }

  // Paddle 2 (right) collision
  if (
    s.ballVx > 0 &&
    s.ballX + cfg.ballSize >= cfg.width - cfg.paddleWidth &&
    s.ballX + cfg.ballSize < cfg.width &&
    s.ballY + cfg.ballSize >= s.paddle2Y &&
    s.ballY <= s.paddle2Y + cfg.paddleHeight
  ) {
    s.ballVx = -cfg.speed
    const hit = (s.ballY + cfg.ballSize / 2 - (s.paddle2Y + cfg.paddleHeight / 2)) / (cfg.paddleHeight / 2)
    s.ballVy = hit * cfg.speed
  }

  // Scoring
  if (s.ballX <= 0) {
    s.score2++
    const ns = createPongState(cfg)
    s.ballX = ns.ballX; s.ballY = ns.ballY
    s.ballVx = ns.ballVx; s.ballVy = ns.ballVy
    s.score1 = state.score1; s.score2 = state.score2
  } else if (s.ballX >= cfg.width) {
    s.score1++
    const ns = createPongState(cfg)
    s.ballX = ns.ballX; s.ballY = ns.ballY
    s.ballVx = ns.ballVx; s.ballVy = ns.ballVy
    s.score1 = state.score1; s.score2 = state.score2
  }

  if (s.score1 >= cfg.scoreToWin || s.score2 >= cfg.scoreToWin) {
    s.done = true
  }

  return s
}
