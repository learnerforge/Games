import type { ComponentType } from 'react'
import type { GameComponentMap } from '../../types'
import Snake from './Snake'
import Quiz from './Quiz'
import Memory from './Memory'
import Pong from './Pong'
import Game2048 from './Game2048'
import TicTacToe from './TicTacToe'
import ConnectFour from './ConnectFour'
import RockPaperScissors from './RockPaperScissors'
import Hangman from './Hangman'
import TypingTest from './TypingTest'

const componentMap: GameComponentMap = {
  snake: Snake,
  quiz: Quiz,
  memory: Memory,
  pong: Pong,
  game2048: Game2048,
  tictactoe: TicTacToe,
  connectfour: ConnectFour,
  rockpaperscissors: RockPaperScissors,
  hangman: Hangman,
  typingtest: TypingTest,
}

export function getGameComponent(key: string): ComponentType<{ config: Record<string, unknown>; onScore?: (score: number) => void }> | null {
  return componentMap[key] || null
}
