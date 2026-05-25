import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ScoreEntry } from '../types'
import { saveScore, getScores, getTopScore, clearAllScores } from '../utils/storage'

interface GameContextValue {
  addScore: (gameSlug: string, entry: { player: string; score: number; date: string; mode: string }) => void
  addScoreEntry: (entry: ScoreEntry) => void
  getScoresForGame: (gameSlug: string) => ScoreEntry[]
  getBestScore: (gameSlug: string) => number
  resetAllScores: () => void
  refreshKey: number
}

const GameContext = createContext<GameContextValue>({
  addScore: () => {},
  addScoreEntry: () => {},
  getScoresForGame: () => [],
  getBestScore: () => 0,
  resetAllScores: () => {},
  refreshKey: 0,
})

export function GameProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const addScore = (gameSlug: string, entry: { player: string; score: number; date: string; mode: string }) => {
    const full: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameSlug,
      gameTitle: gameSlug,
      playerName: entry.player,
      score: entry.score,
      moves: 0,
      gridSize: 0,
      targetNumber: 0,
      createdAt: entry.date,
    }
    saveScore(full)
    setRefreshKey(k => k + 1)
  }

  const addScoreEntry = (entry: ScoreEntry) => {
    saveScore(entry)
    setRefreshKey(k => k + 1)
  }

  const getScoresForGame = (gameSlug: string) => getScores(gameSlug)
  const getBestScore = (gameSlug: string) => getTopScore(gameSlug)

  const resetAllScores = () => {
    clearAllScores()
    setRefreshKey(k => k + 1)
  }

  return (
    <GameContext.Provider value={{ addScore, addScoreEntry, getScoresForGame, getBestScore, resetAllScores, refreshKey }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
