import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ScoreEntry } from '../types'
import { saveScore, getScores, getTopScore, clearAllScores } from '../utils/storage'

interface GameContextValue {
  addScore: (gameSlug: string, entry: ScoreEntry) => void
  getScoresForGame: (gameSlug: string) => ScoreEntry[]
  getBestScore: (gameSlug: string) => number
  resetAllScores: () => void
  refreshKey: number
}

const GameContext = createContext<GameContextValue>({
  addScore: () => {},
  getScoresForGame: () => [],
  getBestScore: () => 0,
  resetAllScores: () => {},
  refreshKey: 0,
})

export function GameProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const addScore = (gameSlug: string, entry: ScoreEntry) => {
    saveScore(gameSlug, entry)
    setRefreshKey(k => k + 1)
  }

  const getScoresForGame = (gameSlug: string) => getScores(gameSlug)
  const getBestScore = (gameSlug: string) => getTopScore(gameSlug)

  const resetAllScores = () => {
    clearAllScores()
    setRefreshKey(k => k + 1)
  }

  return (
    <GameContext.Provider value={{ addScore, getScoresForGame, getBestScore, resetAllScores, refreshKey }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
