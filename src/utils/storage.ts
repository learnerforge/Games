import type { StorageData, Theme, ScoreEntry } from '../types'

const STORAGE_KEY = 'playroads-data'

function getDefaultData(): StorageData {
  return {
    playerName: 'Player',
    theme: 'dark',
    scores: {},
  }
}

export function loadData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    const data = JSON.parse(raw) as StorageData
    return {
      playerName: data.playerName || 'Player',
      theme: data.theme || 'dark',
      scores: data.scores || {},
    }
  } catch {
    return getDefaultData()
  }
}

export function saveData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function saveTheme(theme: Theme): void {
  const data = loadData()
  data.theme = theme
  saveData(data)
}

export function savePlayerName(name: string): void {
  const data = loadData()
  data.playerName = name
  saveData(data)
}

export function saveScore(gameSlug: string, entry: ScoreEntry): void {
  const data = loadData()
  if (!data.scores[gameSlug]) data.scores[gameSlug] = []
  data.scores[gameSlug].push(entry)
  data.scores[gameSlug].sort((a, b) => b.score - a.score)
  if (data.scores[gameSlug].length > 100) {
    data.scores[gameSlug] = data.scores[gameSlug].slice(0, 100)
  }
  saveData(data)
}

export function getScores(gameSlug: string): ScoreEntry[] {
  const data = loadData()
  return data.scores[gameSlug] || []
}

export function getTopScore(gameSlug: string): number {
  const scores = getScores(gameSlug)
  return scores.length > 0 ? scores[0].score : 0
}

export function clearAllScores(): void {
  const data = loadData()
  data.scores = {}
  saveData(data)
}
