import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import { QUIZ_QUESTIONS } from '../../data/quiz'
import type { ScoreEntry } from '../../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface QuizConfig {
  title: string
  questionCount: number
  timePerQuestion: number
  category: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): QuizConfig {
  return {
    title: String(raw.title || 'Quiz'),
    questionCount: Math.min(25, Math.max(5, Number(raw.questionCount) || 10)),
    timePerQuestion: Math.min(60, Math.max(0, Number(raw.timePerQuestion) || 0)),
    category: String(raw.category || 'general'),
  }
}

export default function Quiz({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const questions = useMemo(() => shuffle(QUIZ_QUESTIONS).slice(0, cfg.questionCount), [cfg.questionCount])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(cfg.timePerQuestion)
  const scoreSubmitted = useRef(false)

  // Timer countdown
  useEffect(() => {
    if (finished || answered || cfg.timePerQuestion <= 0) return
    if (timeLeft <= 0) {
      handleAnswer(-1)
      return
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [finished, answered, timeLeft, cfg.timePerQuestion])

  const handleAnswer = useCallback((i: number) => {
    if (answered || finished) return
    setSelected(i)
    setAnswered(true)
    if (i >= 0 && i === questions[current].correctIndex) setScore(s => s + 1)
  }, [answered, finished, current, questions])

  const nextQuestion = useCallback(() => {
    if (current >= questions.length - 1) {
      setFinished(true)
      if (!scoreSubmitted.current) {
        scoreSubmitted.current = true
        const finalScore = score + (selected === questions[current].correctIndex ? 1 : 0)
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameSlug: 'quiz', gameTitle: cfg.title,
          playerName: loadData().playerName,
          score: finalScore * 10, moves: finalScore, gridSize: 0, targetNumber: 0,
          createdAt: new Date().toISOString(),
        }
        onScore?.(finalScore * 10)
        addScore('quiz', { player: entry.playerName, score: finalScore * 10, date: entry.createdAt, mode: '1p' })
      }
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setSelected(-1)
      setTimeLeft(cfg.timePerQuestion)
    }
  }, [current, questions, score, selected, cfg.title, cfg.timePerQuestion, onScore, addScore])

  const restart = () => {
    setCurrent(0); setScore(0); setAnswered(false)
    setSelected(-1); setFinished(false); setTimeLeft(cfg.timePerQuestion)
  }

  const q = questions[current]
  const displayScore = score + (answered && selected === questions[current]?.correctIndex ? 1 : 0)

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary capitalize">{cfg.category} · {cfg.questionCount} questions</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Score</div>
            <div className="text-sm font-bold text-theme-primary">{displayScore}</div>
          </div>
          {cfg.timePerQuestion > 0 && (
            <div className={`text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px] ${timeLeft <= 5 && !answered ? 'ring-2 ring-red-400' : ''}`}>
              <div className="text-[10px] text-theme-text-secondary uppercase">Time</div>
              <div className="text-sm font-bold text-theme-text">{timeLeft}s</div>
            </div>
          )}
        </div>
      </div>

      {!finished && q && (
        <>
          {/* Progress bar */}
          <div className="w-full bg-theme-bg-secondary rounded-full h-1.5 mb-4">
            <div className="bg-theme-primary h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <div className="flex justify-between text-xs text-theme-text-secondary mb-2">
              <span>Q {current + 1}/{questions.length}</span>
              <span>{answered ? 'Answered' : 'Choose an option'}</span>
            </div>
            <p className="text-lg font-semibold text-theme-text mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let cls = 'bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary'
                if (answered && i === q.correctIndex) cls = 'bg-green-800/20 border-green-400/50 text-green-400'
                else if (answered && i === selected && i !== q.correctIndex) cls = 'bg-red-800/20 border-red-400/50 text-red-400'
                else if (selected === i) cls = 'bg-theme-primary/10 border-theme-primary text-theme-primary'
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                    className={`touch-button w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
                ↻ Restart
              </button>
            </div>
            {answered && (
              <button onClick={nextQuestion} className="touch-button px-4 py-1.5 rounded-lg bg-theme-primary text-white text-xs font-medium hover:bg-theme-primary-hover transition-colors">
                {current >= questions.length - 1 ? 'Finish' : 'Next →'}
              </button>
            )}
          </div>
        </>
      )}

      {/* Game over overlay */}
      {finished && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-xl font-bold text-theme-text mb-1">Quiz Complete!</p>
            <p className="text-sm text-theme-text-secondary mb-1">Score: {displayScore}/{questions.length}</p>
            <p className="text-xs text-theme-text-secondary mb-4">
              {displayScore === questions.length ? 'Perfect score!' : displayScore >= questions.length / 2 ? 'Well done!' : 'Keep practicing!'}
            </p>
            <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
