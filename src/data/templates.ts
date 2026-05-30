import type { GameTemplate, ConfigField } from '../types'

const snakeSchema: ConfigField[] = [
  { key: 'title', label: 'Game Title', type: 'text', defaultValue: 'Classic Snake' },
  { key: 'speed', label: 'Speed', type: 'slider', defaultValue: 150, min: 60, max: 300, step: 10, description: 'Lower = faster' },
  { key: 'gridSize', label: 'Grid Size', type: 'select', defaultValue: 20, options: [{ label: '15×15', value: 15 }, { label: '20×20', value: 20 }, { label: '25×25', value: 25 }] },
  { key: 'snakeColor', label: 'Snake Color', type: 'color', defaultValue: '#6366f1' },
  { key: 'foodColor', label: 'Food Color', type: 'color', defaultValue: '#ef4444' },
  { key: 'wallMode', label: 'Wall Behavior', type: 'select', defaultValue: 'die', options: [{ label: 'Die on wall', value: 'die' }, { label: 'Wrap around', value: 'wrap' }] },
]

const memorySchema: ConfigField[] = [
  { key: 'gridCols', label: 'Columns', type: 'select', defaultValue: 4, options: [{ label: '4', value: 4 }, { label: '6', value: 6 }] },
  { key: 'gridRows', label: 'Rows', type: 'select', defaultValue: 4, options: [{ label: '4', value: 4 }, { label: '6', value: 6 }] },
  { key: 'timerEnabled', label: 'Show Timer', type: 'toggle', defaultValue: true },
  { key: 'cardSet', label: 'Card Style', type: 'select', defaultValue: 'emoji', options: [{ label: 'Emoji', value: 'emoji' }, { label: 'Animals', value: 'animals' }, { label: 'Numbers', value: 'numbers' }] },
]

const quizSchema: ConfigField[] = [
  { key: 'questionCount', label: 'Questions', type: 'slider', defaultValue: 10, min: 5, max: 25, step: 1 },
  { key: 'timePerQuestion', label: 'Time per Question (s)', type: 'slider', defaultValue: 0, min: 0, max: 30, step: 5, description: '0 = no timer' },
  { key: 'category', label: 'Category', type: 'select', defaultValue: 'general', options: [{ label: 'General Knowledge', value: 'general' }, { label: 'Science', value: 'science' }, { label: 'Mixed', value: 'mixed' }] },
]

const pongSchema: ConfigField[] = [
  { key: 'ballSpeed', label: 'Ball Speed', type: 'slider', defaultValue: 4, min: 2, max: 8, step: 1 },
  { key: 'paddleSize', label: 'Paddle Size', type: 'slider', defaultValue: 60, min: 30, max: 120, step: 5 },
  { key: 'aiDifficulty', label: 'AI Difficulty', type: 'select', defaultValue: 'medium', options: [{ label: 'Easy', value: 'easy' }, { label: 'Medium', value: 'medium' }, { label: 'Hard', value: 'hard' }] },
  { key: 'winScore', label: 'Winning Score', type: 'slider', defaultValue: 5, min: 3, max: 15, step: 1 },
  { key: 'paddleColor', label: 'Paddle Color', type: 'color', defaultValue: '#6366f1' },
  { key: 'ballColor', label: 'Ball Color', type: 'color', defaultValue: '#f1f5f9' },
]

const tttSchema: ConfigField[] = [
  { key: 'title', label: 'Game Title', type: 'text', defaultValue: 'Classic Tic Tac Toe' },
  { key: 'boardSize', label: 'Board Size', type: 'select', defaultValue: 3, options: [{ label: '3×3', value: 3 }, { label: '4×4', value: 4 }, { label: '5×5', value: 5 }] },
  { key: 'aiDifficulty', label: 'AI Difficulty', type: 'select', defaultValue: 'medium', options: [{ label: 'Easy (random)', value: 'easy' }, { label: 'Medium (minimax)', value: 'medium' }] },
  { key: 'playerMark', label: 'Player Mark', type: 'select', defaultValue: 'X', options: [{ label: 'X', value: 'X' }, { label: 'O', value: 'O' }, { label: '★', value: '★' }, { label: '●', value: '●' }] },
]

const cfSchema: ConfigField[] = [
  { key: 'rows', label: 'Rows', type: 'select', defaultValue: 6, options: [{ label: '6', value: 6 }, { label: '7', value: 7 }, { label: '8', value: 8 }] },
  { key: 'cols', label: 'Columns', type: 'select', defaultValue: 7, options: [{ label: '7', value: 7 }, { label: '8', value: 8 }, { label: '9', value: 9 }] },
  { key: 'winLength', label: 'Win Length', type: 'select', defaultValue: 4, options: [{ label: '3', value: 3 }, { label: '4', value: 4 }, { label: '5', value: 5 }] },
]

const rpsSchema: ConfigField[] = [
  { key: 'roundsToWin', label: 'Rounds to Win', type: 'slider', defaultValue: 3, min: 1, max: 7, step: 1 },
  { key: 'choiceStyle', label: 'Choice Style', type: 'select', defaultValue: 'emoji', options: [{ label: 'Emoji', value: 'emoji' }, { label: 'Text', value: 'text' }] },
]

const hangmanSchema: ConfigField[] = [
  { key: 'maxWrong', label: 'Max Wrong Guesses', type: 'slider', defaultValue: 6, min: 3, max: 10, step: 1 },
  { key: 'wordTheme', label: 'Word Theme', type: 'select', defaultValue: 'mixed', options: [{ label: 'Mixed', value: 'mixed' }, { label: 'Tech', value: 'tech' }, { label: 'Animals', value: 'animals' }] },
]

const typingSchema: ConfigField[] = [
  { key: 'duration', label: 'Duration (s)', type: 'slider', defaultValue: 30, min: 15, max: 120, step: 15 },
  { key: 'wordLength', label: 'Word Length', type: 'select', defaultValue: 'mixed', options: [{ label: 'Short', value: 'short' }, { label: 'Medium', value: 'medium' }, { label: 'Mixed', value: 'mixed' }] },
]

const game2048Schema: ConfigField[] = [
  { key: 'title', label: 'Game Title', type: 'text', defaultValue: 'Classic 2048' },
  { key: 'gridSize', label: 'Grid Size', type: 'select', defaultValue: 4, options: [{ label: '3×3', value: 3 }, { label: '4×4', value: 4 }, { label: '5×5', value: 5 }, { label: '6×6', value: 6 }] },
  { key: 'targetNumber', label: 'Target Number', type: 'select', defaultValue: 2048, options: [{ label: '512', value: 512 }, { label: '1024', value: 1024 }, { label: '2048', value: 2048 }, { label: '4096', value: 4096 }, { label: '8192', value: 8192 }] },
  { key: 'startingTiles', label: 'Starting Tiles', type: 'select', defaultValue: 2, options: [{ label: '1 tile', value: 1 }, { label: '2 tiles', value: 2 }, { label: '3 tiles', value: 3 }] },
  { key: 'tileStyle', label: 'Tile Style', type: 'select', defaultValue: 'classic', options: [{ label: 'Classic', value: 'classic' }, { label: 'Neon', value: 'neon' }, { label: 'Pastel', value: 'pastel' }, { label: 'Minimal', value: 'minimal' }, { label: 'Dust', value: 'dust' }] },
  { key: 'boardColor', label: 'Board Color', type: 'color', defaultValue: '#bbada0' },
  { key: 'emptyCellColor', label: 'Empty Cell Color', type: 'color', defaultValue: '#cdc1b4' },
  { key: 'tileTextColor', label: 'Tile Text Color', type: 'color', defaultValue: '#f9f6f2' },
  { key: 'animationSpeed', label: 'Animation Speed', type: 'select', defaultValue: 'normal', options: [{ label: 'Slow', value: 'slow' }, { label: 'Normal', value: 'normal' }, { label: 'Fast', value: 'fast' }] },
  { key: 'difficulty', label: 'Difficulty', type: 'select', defaultValue: 'normal', options: [{ label: 'Easy', value: 'easy' }, { label: 'Normal', value: 'normal' }, { label: 'Hard', value: 'hard' }] },
]

const snakeTemplate: GameTemplate = {
  slug: 'snake',
  title: 'Snake',
  description: 'Customize speed, colors, and grid size. Share your perfect Snake challenge.',
  icon: '🐍',
  category: 'arcade',
  componentKey: 'snake',
  configSchema: snakeSchema,
  defaultConfig: snakeSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const memoryTemplate: GameTemplate = {
  slug: 'memory',
  title: 'Memory Match',
  description: 'Adjust grid size, card style, and timer. Create your own memory challenge.',
  icon: '🃏',
  category: 'puzzle',
  componentKey: 'memory',
  configSchema: memorySchema,
  defaultConfig: memorySchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const quizTemplate: GameTemplate = {
  slug: 'quiz',
  title: 'Quiz Battle',
  description: 'Set question count, time limits, and category. Challenge friends with your quiz.',
  icon: '🧠',
  category: 'single-player',
  componentKey: 'quiz',
  configSchema: quizSchema,
  defaultConfig: quizSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const pongTemplate: GameTemplate = {
  slug: 'pong',
  title: 'Pong',
  description: 'Tweak ball speed, paddle size, and AI difficulty.',
  icon: '🏓',
  category: 'arcade',
  componentKey: 'pong',
  configSchema: pongSchema,
  defaultConfig: pongSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const tttTemplate: GameTemplate = {
  slug: 'tictactoe',
  title: 'Tic Tac Toe',
  description: 'Change board size, AI difficulty, and player marks.',
  icon: '⊞',
  category: 'two-player',
  componentKey: 'tictactoe',
  configSchema: tttSchema,
  defaultConfig: tttSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const cfTemplate: GameTemplate = {
  slug: 'connectfour',
  title: 'Connect Four',
  description: 'Adjust board size and win length for a fresh challenge.',
  icon: '🔴',
  category: 'two-player',
  componentKey: 'connectfour',
  configSchema: cfSchema,
  defaultConfig: cfSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const rpsTemplate: GameTemplate = {
  slug: 'rockpaperscissors',
  title: 'Rock Paper Scissors',
  description: 'Set rounds and choice style for your classic duel.',
  icon: '✂',
  category: 'single-player',
  componentKey: 'rockpaperscissors',
  configSchema: rpsSchema,
  defaultConfig: rpsSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const hangmanTemplate: GameTemplate = {
  slug: 'hangman',
  title: 'Hangman',
  description: 'Choose word themes and max wrong guesses.',
  icon: '💀',
  category: 'puzzle',
  componentKey: 'hangman',
  configSchema: hangmanSchema,
  defaultConfig: hangmanSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const typingTemplate: GameTemplate = {
  slug: 'typingtest',
  title: 'Typing Speed Test',
  description: 'Set duration and word length for your typing challenge.',
  icon: '⌨',
  category: 'single-player',
  componentKey: 'typingtest',
  configSchema: typingSchema,
  defaultConfig: typingSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const game2048Template: GameTemplate = {
  slug: 'game2048',
  title: '2048',
  description: 'Create your own custom 2048 puzzle with different grid sizes, themes, targets, and difficulty.',
  icon: '🔢',
  category: 'puzzle',
  componentKey: 'game2048',
  configSchema: game2048Schema,
  defaultConfig: game2048Schema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

const sosSchema: ConfigField[] = [
  { key: 'title', label: 'Game Title', type: 'text', defaultValue: 'SOS' },
  { key: 'gridSize', label: 'Grid Size', type: 'select', defaultValue: 8, options: [
    { label: '5×5', value: 5 }, { label: '6×6', value: 6 }, { label: '7×7', value: 7 },
    { label: '8×8', value: 8 }, { label: '9×9', value: 9 }, { label: '10×10', value: 10 },
    { label: '11×11', value: 11 }, { label: '12×12', value: 12 },
  ]},
  { key: 'winCondition', label: 'Win Condition', type: 'select', defaultValue: 'full', options: [
    { label: 'Most points when board full', value: 'full' },
    { label: 'First to target points', value: 'points' },
  ]},
  { key: 'pointsToWin', label: 'Points to Win', type: 'slider', defaultValue: 10, min: 3, max: 25, step: 1, description: 'Only used when win condition is "First to target points"' },
  { key: 'player1Label', label: 'Player 1 Name', type: 'text', defaultValue: 'Player 1' },
  { key: 'player2Label', label: 'Player 2 Name', type: 'text', defaultValue: 'Player 2' },
  { key: 'boardColor', label: 'Board Color', type: 'color', defaultValue: '#1e293b' },
  { key: 'cellColor', label: 'Cell Color', type: 'color', defaultValue: '#334155' },
  { key: 'lineColor', label: 'Grid Line Color', type: 'color', defaultValue: '#475569' },
  { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#f1f5f9' },
  { key: 'showSosHighlight', label: 'Show SOS Highlight', type: 'toggle', defaultValue: true },
]

const sosTemplate: GameTemplate = {
  slug: 'sos',
  title: 'SOS',
  description: 'Classic paper-and-pencil game. Place S and O to spell SOS and score. First to target points wins!',
  icon: '🆘',
  category: 'two-player',
  componentKey: 'sos',
  configSchema: sosSchema,
  defaultConfig: sosSchema.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}),
}

export const TEMPLATES: GameTemplate[] = [
  snakeTemplate,
  memoryTemplate,
  quizTemplate,
  pongTemplate,
  tttTemplate,
  cfTemplate,
  rpsTemplate,
  hangmanTemplate,
  typingTemplate,
  game2048Template,
  sosTemplate,
]

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'arcade', label: 'Arcade' },
  { key: 'puzzle', label: 'Puzzle' },
  { key: 'single-player', label: 'Single' },
  { key: 'two-player', label: 'Two Player' },
] as const
