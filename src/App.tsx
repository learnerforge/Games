import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { GameProvider } from './context/GameContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import PlayPage from './pages/PlayPage'
import SavedPage from './pages/SavedPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/create/:slug" element={<CreatePage />} />
            <Route path="/play/:slug" element={<PlayPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </GameProvider>
    </ThemeProvider>
  )
}
