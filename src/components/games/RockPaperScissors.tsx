import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

const CHOICES = ['rock', 'paper', 'scissors'] as const
const EMOJIS: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' }
const BEATS: Record<string, string> = { rock: 'scissors', scissors: 'paper', paper: 'rock' }

function getCPUChoice(): string {
  return CHOICES[Math.floor(Math.random() * 3)]
}

export default function RockPaperScissors() {
  const { addScore } = useGame()
  const [playerChoice, setPlayerChoice] = useState<string | null>(null)
  const [cpuChoice, setCpuChoice] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [cpuWins, setCpuWins] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const play = useCallback((choice: string) => {
    const cpu = getCPUChoice()
    setPlayerChoice(choice)
    setCpuChoice(cpu)

    let res: string
    if (choice === cpu) {
      res = 'draw'
    } else if (BEATS[choice] === cpu) {
      res = 'win'
      setPlayerWins(p => p + 1)
    } else {
      res = 'lose'
      setCpuWins(c => c + 1)
    }
    setResult(res)

    if (round >= 5 || res === 'win' && playerWins + 1 >= 3 || res === 'lose' && cpuWins + 1 >= 3) {
      setGameOver(true)
      const finalScore = res === 'win' ? playerWins + 1 - cpuWins : playerWins - (cpuWins + 1)
      addScore('rockpaperscissors', {
        player: loadData().playerName,
        score: Math.max(0, finalScore * 10),
        date: new Date().toISOString(),
        mode: '1p',
      })
    } else {
      setRound(r => r + 1)
    }
  }, [round, playerWins, cpuWins, addScore])

  const restart = () => {
    setPlayerChoice(null)
    setCpuChoice(null)
    setResult(null)
    setRound(1)
    setPlayerWins(0)
    setCpuWins(0)
    setGameOver(false)
  }

  if (gameOver) {
    const won = playerWins > cpuWins
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">{won ? '🎉' : '😔'}</div>
        <p className="text-lg font-semibold text-theme-text mb-1">{won ? 'You Win!' : 'CPU Wins!'}</p>
        <p className="text-sm text-theme-text-secondary mb-4">{playerWins} - {cpuWins}</p>
        <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white font-medium hover:bg-theme-primary-hover transition-colors">
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-4 text-sm text-theme-text-secondary">
        <span>You: {playerWins}</span>
        <span>Round: {round}/5</span>
        <span>CPU: {cpuWins}</span>
      </div>

      {result && (
        <div className="mb-4">
          <div className="flex justify-center gap-8 items-center text-3xl mb-2">
            <span>{playerChoice ? EMOJIS[playerChoice] : '?'}</span>
            <span className="text-theme-text-secondary text-base">vs</span>
            <span>{cpuChoice ? EMOJIS[cpuChoice] : '?'}</span>
          </div>
          <p className={`text-sm font-semibold ${
            result === 'win' ? 'text-theme-success' : result === 'lose' ? 'text-theme-danger' : 'text-theme-text-secondary'
          }`}>
            {result === 'win' ? 'You win this round!' : result === 'lose' ? 'CPU wins this round!' : 'Draw!'}
          </p>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {CHOICES.map(c => (
          <button
            key={c}
            onClick={() => play(c)}
            disabled={!!result}
            className="touch-button w-20 h-20 rounded-xl bg-theme-bg-secondary border border-theme-border hover:border-theme-primary text-3xl transition-colors disabled:opacity-50"
          >
            {EMOJIS[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
