import { useState, useCallback } from 'react'
import { loadData, saveData, savePlayerName } from '../utils/storage'
import type { Theme } from '../types'

export function usePlayerName() {
  const [name, setName] = useState(() => loadData().playerName)

  const updateName = useCallback((n: string) => {
    setName(n)
    savePlayerName(n)
  }, [])

  return [name, updateName] as const
}

export function useStoredTheme() {
  const [theme, setThemeState] = useState(() => loadData().theme)

  const updateTheme = useCallback((t: Theme) => {
    setThemeState(t)
    const data = loadData()
    data.theme = t
    saveData(data)
  }, [])

  return [theme, updateTheme] as const
}
