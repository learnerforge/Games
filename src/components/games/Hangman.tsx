import { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const WORDS = ['REACT','TYPESCRIPT','JAVASCRIPT','BROWSER','GAMES','SLOWROADS','ARENA','PLAY','CODING','WEB','DEVELOPER','PYTHON','RUST','TURBO','VITE','STYLED','HOOKS','STATE','STORE','LOGIC','BOARD','SCORE','LEADER','THEME','DARK','LIGHT','DUST','CANVAS','SNAKE','PONG']

const STAGES = [
  '', 'O', 'O\n|', 'O\n/|', 'O\n/|\\', 'O\n/|\\\n/', 'O\n/|\\\n/ \\',
]

export default function Hangman() {
  const { addScore } = useGame()
  const [word, setWord] = useState('')
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState(0)
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null)

  const startGame = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWord(w)
    setGuessed(new Set())
    setWrong(0)
    setGameOver(null)
  }, [])

  useEffect(() => { startGame() }, [startGame])

  const guess = useCallback((letter: string) => {
    if (gameOver || guessed.has(letter)) return
    setGuessed(prev => new Set(prev).add(letter))
    if (!word.includes(letter)) {
      const nw = wrong + 1
      setWrong(nw)
      if (nw >= 6) {
        setGameOver('lose')
        addScore('hangman', { player: loadData().playerName, score: 0, date: new Date().toISOString(), mode: '1p' })
      }
    } else {
      const revealed = word.split('').filter(l => guessed.has(l) || l === letter).length
      if (revealed === word.length) {
        setGameOver('win')
        addScore('hangman', { player: loadData().playerName, score: word.length * 10, date: new Date().toISOString(), mode: '1p' })
      }
    }
  }, [gameOver, guessed, word, wrong, addScore])

  const display = word.split('').map(l => guessed.has(l) ? l : '_').join(' ')
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Wrong: {wrong}/6</span>
        <button onClick={startGame} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">
          New Word
        </button>
      </div>

      <pre className="text-lg font-mono text-theme-primary mb-4 leading-relaxed">
        {STAGES[wrong]}
      </pre>

      <p className="text-2xl font-mono tracking-widest mb-6 text-theme-text">{display}</p>

      {gameOver && (
        <p className={`text-lg font-semibold mb-4 ${gameOver === 'win' ? 'text-theme-success' : 'text-theme-danger'}`}>
          {gameOver === 'win' ? 'You saved him!' : `Word was: ${word}`}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-1.5 max-w-[400px] mx-auto">
        {ALPHABET.map(l => {
          const used = guessed.has(l)
          const isCorrect = word.includes(l)
          return (
            <button
              key={l}
              onClick={() => guess(l)}
              disabled={used || !!gameOver}
              className={`touch-button w-8 h-8 rounded text-sm font-semibold transition-colors ${
                used
                  ? isCorrect ? 'bg-theme-success/20 text-theme-success' : 'bg-theme-danger/10 text-theme-danger/50'
                  : 'bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary'
              }`}
            >
              {l}
            </button>
          )
        })}
      </div>
    </div>
  )
}
