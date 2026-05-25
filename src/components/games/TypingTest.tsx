import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const WORDS = ['the','quick','brown','fox','jumps','over','lazy','dog','react','typescript','vite','tailwind','canvas','game','score','player','arena','roads','slow','web','browser','mobile','touch','keyboard','theme','dark','light','blue','dust','snake','pong','memory','match','tile','merge','quiz','typing','speed','test','hangman','guess','word','letter','build','code','function','state','hook','effect']

export default function TypingTest() {
  const { addScore } = useGame()
  const [words, setWords] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateWords = useCallback(() => {
    const w: string[] = []
    for (let i = 0; i < 200; i++) w.push(WORDS[Math.floor(Math.random() * WORDS.length)])
    return w
  }, [])

  const startTest = useCallback(() => {
    setWords(generateWords())
    setCurrent(0)
    setInput('')
    setCorrect(0)
    setTotal(0)
    setTimeLeft(30)
    setStarted(true)
    setFinished(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [generateWords])

  useEffect(() => {
    if (!started || finished) return
    if (timeLeft <= 0) {
      setFinished(true)
      const wpm = Math.round(correct / 5 / (30 / 60))
      addScore('typingtest', { player: loadData().playerName, score: wpm, date: new Date().toISOString(), mode: '1p' })
      return
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [started, finished, timeLeft, correct, addScore])

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

  const wpm = finished ? Math.round(correct / 5 / (30 / 60)) : 0
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-theme-text-secondary">
        <span>Time: {timeLeft}s</span>
        {started && !finished && <span>WPM: {Math.round(correct / 5 / ((30 - timeLeft) / 60)) || 0}</span>}
        {finished && <span className="text-theme-success font-semibold">Done!</span>}
        <button onClick={startTest} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text hover:border-theme-primary transition-colors">
          {started ? 'Restart' : 'Start'}
        </button>
      </div>

      {!started ? (
        <div className="text-center py-8">
          <p className="text-theme-text-secondary mb-4">Type as many words as you can in 30 seconds.</p>
          <button onClick={startTest} className="touch-button px-6 py-3 rounded-lg bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors">Start Test</button>
        </div>
      ) : (
        <>
          <div className="bg-theme-bg-secondary rounded-lg p-4 mb-4 border border-theme-border min-h-[80px]">
            <p className="text-lg leading-relaxed font-mono tracking-wide">
              {words.slice(current, current + 10).map((w, i) => {
                let cls = 'text-theme-text'
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
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full px-4 py-3 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-lg focus:outline-none focus:border-theme-primary transition-colors disabled:opacity-50"
          />

          {finished && (
            <div className="text-center mt-4 space-y-1">
              <p className="text-2xl font-bold text-theme-text">{wpm} WPM</p>
              <p className="text-sm text-theme-text-secondary">Accuracy: {accuracy}% · Words: {correct}/{total}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
