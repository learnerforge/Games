import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'
import type { ScoreEntry } from '../../types'

const CHOICES = ['rock', 'paper', 'scissors'] as const
const EMOJIS: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' }
const BEATS: Record<string, string> = { rock: 'scissors', scissors: 'paper', paper: 'rock' }

interface RPSConfig {
  title: string
  roundsToWin: number
  choiceStyle: string
}

interface Props {
  config: Record<string, unknown>
  onScore?: (score: number) => void
}

function parseConfig(raw: Record<string, unknown>): RPSConfig {
  return {
    title: String(raw.title || 'Rock Paper Scissors'),
    roundsToWin: Math.min(7, Math.max(1, Number(raw.roundsToWin) || 3)),
    choiceStyle: raw.choiceStyle === 'text' ? 'text' : 'emoji',
  }
}

function getCPUChoice(): string {
  return CHOICES[Math.floor(Math.random() * 3)]
}

export default function RockPaperScissors({ config: rawConfig, onScore }: Props) {
  const cfg = parseConfig(rawConfig)
  const { addScore } = useGame()
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [cpuWins, setCpuWins] = useState(0)
  const [draws, setDraws] = useState(0)
  const [playerChoice, setPlayerChoice] = useState<string | null>(null)
  const [cpuChoice, setCpuChoice] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<'player' | 'cpu' | null>(null)

  const play = useCallback((choice: string) => {
    const cpu = getCPUChoice()
    setPlayerChoice(choice)
    setCpuChoice(cpu)

    let res: string
    if (choice === cpu) {
      res = 'draw'
      setDraws(d => d + 1)
    } else if (BEATS[choice] === cpu) {
      res = 'win'
      const newWins = playerWins + 1
      setPlayerWins(newWins)
      if (newWins >= cfg.roundsToWin) {
        setGameOver(true)
        setWinner('player')
        const entry: ScoreEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameSlug: 'rockpaperscissors',
          gameTitle: cfg.title,
          playerName: loadData().playerName,
          score: newWins * 10,
          moves: round,
          gridSize: 0, targetNumber: 0,
          createdAt: new Date().toISOString(),
        }
        onScore?.(newWins * 10)
        addScore('rockpaperscissors', { player: entry.playerName, score: newWins * 10, date: entry.createdAt, mode: '1p' })
      }
    } else {
      res = 'lose'
      const newWins = cpuWins + 1
      setCpuWins(newWins)
      if (newWins >= cfg.roundsToWin) {
        setGameOver(true)
        setWinner('cpu')
      }
    }
    setResult(res)
    if (!gameOver) setRound(r => r + 1)
  }, [playerWins, cpuWins, round, gameOver, cfg.roundsToWin, cfg.title, onScore, addScore])

  const restart = () => {
    setRound(1); setPlayerWins(0); setCpuWins(0); setDraws(0)
    setPlayerChoice(null); setCpuChoice(null); setResult(null)
    setGameOver(false); setWinner(null)
  }

  const display = cfg.choiceStyle === 'text'
    ? { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' }
    : EMOJIS

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">{cfg.title}</h2>
          <p className="text-xs text-theme-text-secondary">First to {cfg.roundsToWin}</p>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">You</div>
            <div className="text-sm font-bold text-theme-text">{playerWins}</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">CPU</div>
            <div className="text-sm font-bold text-theme-text">{cpuWins}</div>
          </div>
          <div className="text-center bg-theme-bg-secondary rounded-lg px-3 py-1 min-w-[50px]">
            <div className="text-[10px] text-theme-text-secondary uppercase">Draw</div>
            <div className="text-sm font-bold text-theme-text">{draws}</div>
          </div>
        </div>
      </div>

      {/* Round result display */}
      {result && (
        <div className="mb-4 w-full">
          <div className="flex justify-center gap-8 items-center text-4xl py-3">
            <div className="flex flex-col items-center gap-1">
              <span>{display[playerChoice!]}</span>
              <span className="text-[10px] text-theme-text-secondary">You</span>
            </div>
            <span className="text-theme-text-secondary text-lg font-bold">VS</span>
            <div className="flex flex-col items-center gap-1">
              <span>{display[cpuChoice!]}</span>
              <span className="text-[10px] text-theme-text-secondary">CPU</span>
            </div>
          </div>
          <p className={`text-center text-sm font-semibold ${
            result === 'win' ? 'text-green-400' : result === 'lose' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {result === 'win' ? 'You win this round!' : result === 'lose' ? 'CPU wins this round!' : 'Draw!'}
          </p>
        </div>
      )}

      {/* Choice buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {CHOICES.map(c => (
          <button
            key={c}
            onClick={() => play(c)}
            disabled={!!result && !gameOver}
            className="touch-button w-20 h-20 rounded-xl bg-theme-bg-secondary border border-theme-border hover:border-theme-primary text-3xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center">
              <span>{display[c]}</span>
            </div>
          </button>
        ))}
      </div>

      {!result && !gameOver && (
        <p className="mt-3 text-xs text-theme-text-secondary">Round {round} — Choose your move</p>
      )}

      {result && !gameOver && (
        <button onClick={restart} className="touch-button mt-3 px-4 py-1.5 rounded-lg bg-theme-primary text-white text-xs font-medium hover:bg-theme-primary-hover">
          Next Round
        </button>
      )}

      {/* Controls */}
      <div className="w-full flex justify-between items-center mt-4">
        <button onClick={restart} className="touch-button px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-xs hover:border-theme-primary transition-colors">
          ↻ Restart
        </button>
        <span className="text-xs text-theme-text-secondary">Round {round}</span>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-theme-bg-card border border-theme-border rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-4xl mb-2">{winner === 'player' ? '🎉' : '😔'}</p>
            <p className="text-xl font-bold text-theme-text mb-1">{winner === 'player' ? 'You Win!' : 'CPU Wins!'}</p>
            <p className="text-sm text-theme-text-secondary mb-4">{playerWins} – {cpuWins} (draws: {draws})</p>
            <button onClick={restart} className="touch-button px-6 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
