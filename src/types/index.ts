export type Theme = 'dark' | 'blue' | 'dust'

export type GameMode = '1p' | '2p'

export type ConfigFieldType = 'slider' | 'toggle' | 'color' | 'select' | 'number' | 'text'

export interface ScoreEntry {
  id: string
  gameSlug: string
  gameTitle: string
  playerName: string
  score: number
  moves: number
  gridSize: number
  targetNumber: number
  createdAt: string
}

export interface GameScores {
  [gameSlug: string]: ScoreEntry[]
}

export interface SavedGame {
  id: string
  templateSlug: string
  title: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface StorageData {
  playerName: string
  theme: Theme
  scores: GameScores
  savedGames: SavedGame[]
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

export interface ConfigField {
  key: string
  label: string
  type: ConfigFieldType
  defaultValue: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string | number }[]
  description?: string
}

export interface GameTemplate {
  slug: string
  title: string
  description: string
  icon: string
  category: string
  componentKey: string
  configSchema: ConfigField[]
  defaultConfig: Record<string, unknown>
}

export type GameComponentMap = Record<string, React.ComponentType<{ config: Record<string, unknown>; onScore?: (score: number) => void }>>
