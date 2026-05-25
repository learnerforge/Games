import { useState, useCallback, useMemo } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import { QUIZ_QUESTIONS } from '../../data/quiz'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface QuizConfig {
  questionCount: number
  timePerQuestion: number
  category: string
}

export default function Quiz({ config: rawConfig }: { config: Record<string, unknown> }) {
  const config = {
    questionCount: Math.min(Math.max(Number(rawConfig.questionCount) || 10, 5), 25),
    timePerQuestion: Number(rawConfig.timePerQuestion) || 0,
    category: String(rawConfig.category || 'general'),
  } satisfies QuizConfig

  const { addScore } = useGame()

  const questions = useMemo(() => shuffle(QUIZ_QUESTIONS).slice(0, config.questionCount), [config.questionCount])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.timePerQuestion)

  const handleAnswer = useCallback((i: number) => {
    if (answered || finished) return
    setSelected(i)
    setAnswered(true)
    if (i === questions[current].correctIndex) setScore(s => s + 1)
  }, [answered, finished, current, questions])

  const nextQuestion = useCallback(() => {
    if (current >= questions.length - 1) {
      setFinished(true)
      const finalScore = score + (selected === questions[current].correctIndex ? 1 : 0)
      addScore('quiz', { player: loadData().playerName, score: finalScore * 10, date: new Date().toISOString(), mode: '1p' })
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setSelected(-1)
      setTimeLeft(config.timePerQuestion)
    }
  }, [current, questions, score, selected, config.timePerQuestion, addScore])

  const restart = () => {
    setCurrent(0)
    setScore(0)
    setAnswered(false)
    setSelected(-1)
    setFinished(false)
    setTimeLeft(config.timePerQuestion)
  }

  if (finished) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-2">🏆</p>
        <p className="text-lg font-semibold text-theme-text mb-1">Quiz Complete!</p>
        <p className="text-sm text-theme-text-secondary mb-4">Score: {score}/{questions.length}</p>
        <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors">Play Again</button>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Q {current + 1}/{questions.length}</span>
        <span>Score: {score}</span>
        {config.timePerQuestion > 0 && <span>Time: {timeLeft}s</span>}
        <div className="flex gap-2">
          {answered && (
            <button onClick={nextQuestion} className="touch-button px-3 py-1.5 rounded-lg bg-theme-primary text-white text-xs">
              {current >= questions.length - 1 ? 'Finish' : 'Next →'}
            </button>
          )}
          <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors text-xs">Restart</button>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-theme-text mb-4">{q.question}</p>
        <div className="space-y-2 max-w-md mx-auto">
          {q.options.map((opt, i) => {
            let cls = 'bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary'
            if (answered && i === q.correctIndex) cls = 'bg-theme-success/20 border-theme-success text-theme-success'
            else if (answered && i === selected && i !== q.correctIndex) cls = 'bg-theme-danger/20 border-theme-danger text-theme-danger'
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
    </div>
  )
}
