import type { Theme, ScoreEntry, SavedGame } from '../types'

const KEYS = {
  root: 'playroads-data',
  best2048: 'playroads-2048-best',
} as const

interface RawData {
  playerName: string
  theme: Theme
  scores: ScoreEntry[]
  savedGames: SavedGame[]
}

function defaults(): RawData {
  return { playerName: 'Player', theme: 'dark', scores: [], savedGames: [] }
}

function loadRaw(): RawData {
  try {
    const raw = localStorage.getItem(KEYS.root)
    if (!raw) return defaults()
    const d = JSON.parse(raw)
    return {
      playerName: d.playerName || 'Player',
      theme: d.theme || 'dark',
      scores: Array.isArray(d.scores) ? d.scores : [],
      savedGames: Array.isArray(d.savedGames) ? d.savedGames : [],
    }
  } catch { return defaults() }
}

function saveRaw(d: RawData): void {
  localStorage.setItem(KEYS.root, JSON.stringify(d))
}

export function loadData(): { playerName: string; theme: Theme } {
  const d = loadRaw()
  return { playerName: d.playerName, theme: d.theme }
}

export function saveTheme(theme: Theme): void {
  const d = loadRaw()
  d.theme = theme
  saveRaw(d)
}

export function savePlayerName(name: string): void {
  const d = loadRaw()
  d.playerName = name
  saveRaw(d)
}

export function saveScore(entry: ScoreEntry): void {
  const d = loadRaw()
  d.scores.push(entry)
  d.scores.sort((a, b) => b.score - a.score)
  if (d.scores.length > 200) d.scores = d.scores.slice(0, 200)
  saveRaw(d)
}

export function getScores(gameSlug?: string): ScoreEntry[] {
  const d = loadRaw()
  if (gameSlug) return d.scores.filter(s => s.gameSlug === gameSlug)
  return d.scores
}

export function getTopScore(gameSlug: string): number {
  const scores = getScores(gameSlug)
  return scores.length > 0 ? scores[0].score : 0
}

export function clearAllScores(): void {
  const d = loadRaw()
  d.scores = []
  saveRaw(d)
  try { localStorage.removeItem(KEYS.best2048) } catch {}
}

export function addSavedGame(game: SavedGame): void {
  const d = loadRaw()
  d.savedGames.unshift(game)
  if (d.savedGames.length > 50) d.savedGames = d.savedGames.slice(0, 50)
  saveRaw(d)
}

export function removeSavedGame(id: string): void {
  const d = loadRaw()
  d.savedGames = d.savedGames.filter(g => g.id !== id)
  saveRaw(d)
}

export function getSavedGames(): SavedGame[] {
  return loadRaw().savedGames
}

export function updateSavedGame(id: string, updates: Partial<SavedGame>): void {
  const d = loadRaw()
  const idx = d.savedGames.findIndex(g => g.id === id)
  if (idx === -1) return
  d.savedGames[idx] = { ...d.savedGames[idx], ...updates, updatedAt: new Date().toISOString() }
  saveRaw(d)
}

export function getBest2048Score(): number {
  try { return Number(localStorage.getItem(KEYS.best2048) || '0') } catch { return 0 }
}
