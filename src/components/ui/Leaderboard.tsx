import { useGame } from '../../context/GameContext'
import { loadData } from '../../utils/storage'

interface LeaderboardProps {
  gameSlug: string
  compact?: boolean
}

export default function Leaderboard({ gameSlug, compact }: LeaderboardProps) {
  const { getScoresForGame, refreshKey } = useGame()
  const scores = getScoresForGame(gameSlug)
  const playerName = loadData().playerName
  void refreshKey

  if (scores.length === 0) {
    return <div className="text-center py-6"><p className="text-theme-text-secondary text-sm">No scores yet.</p></div>
  }

  const display = compact ? scores.slice(0, 5) : scores.slice(0, 10)

  return (
    <div>
      <h3 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wide mb-2">Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-border text-theme-text-secondary text-xs uppercase">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 pr-2">Player</th>
              <th className="text-right py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {display.map((entry, i) => (
              <tr key={i} className={`border-b border-theme-border/50 ${entry.playerName === playerName ? 'text-theme-primary font-medium' : 'text-theme-text'}`}>
                <td className="py-2 pr-2 text-theme-text-secondary">{i + 1}</td>
                <td className="py-2 pr-2">{entry.playerName}</td>
                <td className="py-2 text-right">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
