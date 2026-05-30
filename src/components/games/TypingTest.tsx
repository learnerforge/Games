import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import type { ScoreEntry } from '../../types'

const SHORT = ['the','fox','jump','over','lazy','dog','web','game','code','fast','slow','red','big','hot','run','top','mix','bit','box','fun']
const MEDIUM = ['quick','brown','react','vite','tailwind','canvas','score','player','arena','world','build','state','theme','light','merge']
const LONG = ['typescript','javascript','browser','keyboard','memory','typing','speed','test','hangman','letter','function','effect']

const ALL_WORDS = [...new Set([...SHORT, ...MEDIUM, ...LONG])]

interface TypingConfig {
  title: string
  duration: number
  wordLength: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): TypingConfig {
  return {
    title: String(raw.title || 'Typing Speed Test'),
    duration: Math.min(120, Math.max(15, Number(raw.duration) || 30)),
    wordLength: ['short', 'medium', 'mixed'].includes(String(raw.wordLength)) ? String(raw.wordLength) : 'mixed',
  }
}

function getWordPool(wordLength: string): string[] {
  if (wordLength === 'short') return SHORT
  if (wordLength === 'medium') return MEDIUM
  return ALL_WORDS
}

function generateWords(pool: string[], count: number): string[] {
  const w: string[] = []
  for (let i = 0; i < count; i++) w.push(pool[Math.floor(Math.random() * pool.length)])
  return w
}

export default function TypingTest({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const pool = getWordPool(cfg.wordLength)
  const [words, setWords] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [timeLeft, setTimeLeft] = useState(cfg.duration)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreSubmitted = useRef(false)

  const startTest = useCallback(() => {
    setWords(generateWords(pool, 200))
    setCurrent(0); setInput(''); setCorrect(0); setTotal(0)
    setTimeLeft(cfg.duration); setStarted(true); setFinished(false)
    scoreSubmitted.current = false
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [pool, cfg.duration])

  useEffect(() => {
    if (!started || finished) return
    if (timeLeft <= 0) {
      setFinished(true)
      if (!scoreSubmitted.current) {
        scoreSubmitted.current = true
        const wpm = Math.round(correct / 5 / (cfg.duration / 60))
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameSlug: 'typingtest',
          gameTitle: cfg.title,
          playerName: loadData().playerName,
          score: wpm,
          moves: correct, gridSize: 0, targetNumber: 0,
          createdAt: new Date().toISOString(),
        }
        onScore?.(wpm)
        addScore('typingtest', { player: entry.playerName, score: wpm, date: entry.createdAt, mode: '1p' })
      }
      return
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [started, finished, timeLeft, correct, cfg.duration, cfg.title, onScore, addScore])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(' ')) {
      const typed = val.trim()
      if (typed === words[current]) setCorrect(c => c + 1)
      setTotal(t => t + 1)
      setCurrent(c => c + 1)
      setInput('')
    } else {
      setInput(val)
    }
  }, [current, words])

  const elapsed = cfg.duration - timeLeft
  const liveWpm = started && !finished ? Math.round(correct / 5 / (Math.max(elapsed, 1) / 60)) || 0 : 0
  const finalWpm = finished ? Math.round(correct / 5 / (cfg.duration / 60)) : 0
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">{cfg.duration}s · {cfg.wordLength} words</p>
        </div>
        <div className="flex gap-2">
          <div className={`text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px] ${timeLeft <= 5 && started && !finished ? 'ring-2 ring-red-400' : ''}`}>
            <div className="text-[10px] text-theme-text-secondary uppercase">Time</div>
            <div className="text-sm font-bold text-theme-text">{timeLeft}s</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[60px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">WPM</div>
            <div className="text-sm font-bold text-theme-primary">{liveWpm}</div>
          </div>
        </div>
      </div>

      {!started ? (
        <div className="text-center py-10">
          <p className="text-theme-text-secondary mb-2 text-sm">Type as many words as you can in {cfg.duration} seconds.</p>
          <p className="text-theme-text-secondary/60 text-xs mb-4">Space bar to submit each word</p>
          <button onClick={startTest} className="touch-button px-8 py-3 rounded-xl bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors shadow-lg">
            Start Test
          </button>
        </div>
      ) : (
        <>
          <div className="bg-theme-bg-secondary rounded-xl p-4 mb-4 border border-theme-border min-h-[80px]">
            <p className="text-lg leading-relaxed font-mono tracking-wide">
              {words.slice(current, current + 10).map((w, i) => {
                let cls = 'text-theme-text/40'
                if (i === 0) cls = 'text-theme-primary font-bold underline decoration-2'
                return <span key={i} className={cls + ' mr-2'}>{w}</span>
              })}
            </p>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            disabled={finished}
            placeholder={finished ? 'Test complete!' : 'Type here and press space...'}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            className="w-full px-4 py-3 rounded-xl bg-theme-bg-secondary border border-theme-border text-theme-text text-lg focus:outline-none focus:border-theme-primary transition-colors disabled:opacity-50"
          />

          <div className="flex justify-between mt-3 text-xs text-theme-text-secondary">
            <span>Word {current + 1}/{words.length} · {correct}/{total} correct</span>
            <span>Accuracy: {accuracy}%</span>
          </div>

          {finished && (
            <div className="mt-6 text-center">
              <div className="inline-block bg-theme-bg-card border border-theme-border rounded-2xl p-6 shadow-lg">
                <p className="text-4xl font-bold text-theme-text mb-1">{finalWpm}</p>
                <p className="text-xs text-theme-text-secondary uppercase tracking-wide mb-3">Words Per Minute</p>
                <div className="flex gap-6 justify-center text-sm text-theme-text-secondary">
                  <span>Accuracy: {accuracy}%</span>
                  <span>Words: {correct}/{total}</span>
                </div>
                <button onClick={startTest} className="touch-button mt-4 px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mt-4">
        {started && (
          <button onClick={startTest} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
            ↻ Restart
          </button>
        )}
      </div>
    </div>
  )
}
