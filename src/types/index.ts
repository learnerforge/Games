export type Theme = 'dark' | 'blue' | 'dust'

export type GameMode = '1p' | '2p'

export interface ScoreEntry {
  player: string
  player2?: string
  score: number
  date: string
  mode: GameMode
}

export interface GameScores {
  [gameSlug: string]: ScoreEntry[]
}

export interface StorageData {
  playerName: string
  theme: Theme
  scores: GameScores
}

export interface GameConfig {
  slug: string
  title: string
  description: string
  category: GameCategory
  modes: GameMode[]
  icon: string
}

export type GameCategory =
  | 'single-player'
  | 'two-player'
  | 'puzzle'
  | 'arcade'
  | 'racing'
  | 'multiplayer'

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}
