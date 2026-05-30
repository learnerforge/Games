import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import type { ScoreEntry } from '../../types'

const ANIMALS = ['elephant', 'giraffe', 'dolphin', 'penguin', 'kangaroo', 'falcon', 'cheetah', 'octopus', 'butterfly', 'scorpion']
const FRUITS = ['banana', 'strawberry', 'pineapple', 'blueberry', 'watermelon', 'raspberry', 'coconut', 'mango']
const SPORTS = ['football', 'basketball', 'tennis', 'baseball', 'swimming', 'cycling', 'hockey', 'skiing']
const TECH = ['javascript', 'typescript', 'python', 'react', 'tailwind', 'vite', 'node', 'rust']

const THEMES: Record<string, string[]> = { animals: ANIMALS, fruits: FRUITS, sports: SPORTS, tech: TECH }
const ALL_WORDS = [...new Set([...ANIMALS, ...FRUITS, ...SPORTS, ...TECH])]

interface HangmanConfig {
  title: string
  maxWrong: number
  theme: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): HangmanConfig {
  return {
    title: String(raw.title || 'Hangman'),
    maxWrong: Math.min(10, Math.max(3, Number(raw.maxWrong) || 6)),
    theme: ['animals', 'fruits', 'sports', 'tech', 'mixed'].includes(String(raw.theme)) ? String(raw.theme) : 'mixed',
  }
}

function pickWord(theme: string): string {
  const pool = theme === 'mixed' ? ALL_WORDS : (THEMES[theme] || ALL_WORDS)
  return pool[Math.floor(Math.random() * pool.length)]
}

const HANGMAN_STAGES = [
  '  ┌───┐\n  │   |\n      |\n      |\n      |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n      |\n      |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n  |   |\n      |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n /|   |\n      |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n /|\\  |\n      |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n /|\\  |\n /    |\n      |\n  ────┘──',
  '  ┌───┐\n  │   |\n  O   |\n /|\\  |\n / \\  |\n      |\n  ────┘──',
]

function HangmanDisplay({ wrong, maxWrong }: { wrong: number; maxWrong: number }) {
  const stage = Math.min(wrong, HANGMAN_STAGES.length - 1)
  const clampedMax = Math.min(maxWrong, HANGMAN_STAGES.length - 1)
  return (
    <pre className="text-theme-text text-[10px] leading-tight font-mono text-center whitespace-pre">
      {HANGMAN_STAGES[Math.floor(stage * (HANGMAN_STAGES.length - 1) / clampedMax)]}
    </pre>
  )
}

export default function Hangman({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const [word, setWord] = useState(() => pickWord(cfg.theme))
  const [guessed, setGuessed] = useState<string[]>([])
  const [wrong, setWrong] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState<boolean | null>(null)
  const scoreSubmitted = useRef(false)

  const wordSet = new Set(word.split(''))
  const guessedSet = new Set(guessed)
  const correctGuesses = guessed.filter(g => wordSet.has(g))
  const revealed = word.split('').map(l => guessedSet.has(l) ? l : '_').join(' ')
  const remaining = [...wordSet].filter(l => !guessedSet.has(l)).length
  const isWon = remaining === 0
  const isLost = wrong >= cfg.maxWrong

  useEffect(() => {
    if (isWon && !gameOver) {
      setGameOver(true); setWon(true)
      if (!scoreSubmitted.current) {
        scoreSubmitted.current = true
        const score = Math.max(1, word.length - wrong) * 10
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, gameSlug: 'hangman',
          gameTitle: cfg.title, playerName: loadData().playerName, score,
          moves: guessed.length, gridSize: 0, targetNumber: 0,
          createdAt: new Date().toISOString(),
        }
        onScore?.(score)
        addScore('hangman', { player: entry.playerName, score, date: entry.createdAt, mode: '1p' })
      }
    } else if (isLost && !gameOver) {
      setGameOver(true); setWon(false)
    }
  }, [isWon, isLost, gameOver, guessed.length, wrong, cfg.title, cfg.maxWrong, onScore, addScore])

  const guess = useCallback((letter: string) => {
    if (gameOver || guessedSet.has(letter)) return
    setGuessed(g => [...g, letter])
    if (!wordSet.has(letter)) setWrong(w => w + 1)
  }, [gameOver, wordSet, guessedSet])

  const restart = useCallback(() => {
    setWord(pickWord(cfg.theme)); setGuessed([]); setWrong(0)
    setGameOver(false); setWon(null)
  }, [cfg.theme])

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary capitalize">Theme: {cfg.theme}</p>
        </div>
        <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
          <div className="text-[10px] text-theme-text-secondary uppercase">Wrong</div>
          <div className="text-sm font-bold text-red-400">{wrong}/{cfg.maxWrong}</div>
        </div>
      </div>

      {/* Hangman visual */}
      <HangmanDisplay wrong={wrong} maxWrong={cfg.maxWrong} />

      {/* Word reveal */}
      <div className="text-center text-2xl font-mono tracking-[0.3em] my-4 text-theme-text select-all">
        {revealed}
      </div>

      {/* Hint: used letters */}
      <div className="flex justify-center gap-2 mb-3 text-xs">
        <span className="text-theme-text-secondary">Used: </span>
        <span className="text-theme-text">
          {guessed.map(g => wordSet.has(g) ? <span key={g} className="text-green-400">{g} </span> : <span key={g} className="text-red-400">{g} </span>)}
        </span>
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap justify-center gap-1 max-w-md mx-auto">
        {alphabet.split('').map(l => {
          const used = guessedSet.has(l)
          const correct = wordSet.has(l)
          return (
            <button key={l} onClick={() => guess(l)} disabled={used || gameOver}
              className={`touch-button w-8 h-8 rounded-lg text-xs font-medium transition-colors
                ${used ? (correct ? 'bg-green-800/30 text-green-400 border-green-800/50' : 'bg-red-800/30 text-red-400 border-red-800/50')
                  : 'bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary'}
                disabled:cursor-not-allowed`}
            >
              {l}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
          ↻ New Word
        </button>
        <span className="text-xs text-theme-text-secondary">
          {correctGuesses.length} found · {word.length - correctGuesses.length} hidden
        </span>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">{won ? '🎉' : '💀'}</p>
            <p className="text-xl font-bold text-theme-text mb-1">{won ? 'You Saved Him!' : 'Game Over'}</p>
            <p className="text-sm text-theme-text-secondary mb-1">
              {won ? `Great job guessing "${word}"!` : `The word was "${word}"`}
            </p>
            <p className="text-xs text-theme-text-secondary mb-4">{guessed.length} guesses · {wrong} wrong</p>
            <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              New Word
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
