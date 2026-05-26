# PlayRoads Arena

A **zero-cost, browser-only** game customizer platform. Pick a template, tweak the settings, and share your unique version with anyone via a link. No backend, no sign-ups, no downloads.

## How It Works

1. **Pick a template** from the home page
2. **Customize** grid size, colors, difficulty, win conditions, and more
3. **Play** instantly or save your config for later
4. **Share** your custom version via a URL — the full config is encoded in the link

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** for build tooling
- **Tailwind CSS 4** for styling
- **React Router v7** (HashRouter for GitHub Pages compatibility)
- **Canvas API** for game rendering
- **LocalStorage** for persistence (scores, saved games, player name, theme)
- **GitHub Pages** for deployment

No backend. No database. No authentication. No cost.

## 🎮 Game Templates

| Template | Slug | Category | Configurable |
|---|---|---|---|
| 🐍 Snake | `snake` | Arcade | Speed, grid size, colors, wall behavior |
| 🃏 Memory Match | `memory` | Puzzle | Grid size, card style, timer |
| 🧠 Quiz Battle | `quiz` | Single | Question count, timer, category |
| 🏓 Pong | `pong` | Arcade | Ball speed, paddle size, AI difficulty, colors |
| ⊞ Tic Tac Toe | `tictactoe` | 2-Player | Board size, AI difficulty, player marks |
| 🔴 Connect Four | `connectfour` | 2-Player | Board size, win length |
| ✂ Rock Paper Scissors | `rockpaperscissors` | Single | Rounds to win, choice style |
| 💀 Hangman | `hangman` | Puzzle | Max wrong guesses, word theme |
| ⌨ Typing Speed Test | `typingtest` | Single | Duration, word length |
| 🔢 **2048** | `game2048` | Puzzle | Grid size (3–6), target (512–8192), tile themes (5), colors, speed, difficulty |
| 🆘 **SOS** | `sos` | 2-Player | Grid size (5–12), win condition, colors, player names |

## Features

- **Config-driven templates** — each game has a schema of customizable fields
- **URL-based sharing** — full config is base64url-encoded in the share link
- **Config validation** — decoded URL configs are validated against the schema and merged with defaults
- **Saved games** — store up to 50 custom configs in LocalStorage with Play, Edit, and Delete
- **Score tracking** — per-game leaderboard with top 200 scores
- **Player name** — shown on leaderboard entries
- **3 themes** — Dark (default), Blue (light), Dust (warm earth tones)
- **Responsive** — works on mobile, tablet, desktop, Chromebook
- **Touch + keyboard** — swipe controls on 2048, tap-to-place on SOS, keyboard shortcuts everywhere
- **Zero cost** — no server, no API, no database

## Project Structure

```
src/
├── components/
│   ├── games/          # Game components (Game2048, SOS, Snake, ...)
│   │   └── gameMap.ts  # String-key → component registry
│   ├── layout/         # App layout, header, navigation
│   └── ui/             # Reusable UI (ConfigPanel, Leaderboard)
├── context/            # React context (Theme, Game/score management)
├── data/
│   └── templates.ts    # Template registry with schemas
├── hooks/
│   └── useLocalStorage.ts
├── pages/
│   ├── HomePage.tsx    # Template browser
│   ├── CreatePage.tsx  # Customizer (config panel + live preview)
│   ├── PlayPage.tsx    # Play with URL-decoded config
│   ├── SavedPage.tsx   # Saved games list
│   ├── SettingsPage.tsx# Theme, player name, data reset
│   └── AboutPage.tsx
├── types/
│   └── index.ts        # All TypeScript types
├── utils/
│   ├── configCodec.ts  # base64url encode/decode + validation
│   ├── storage.ts      # LocalStorage CRUD
│   ├── game2048.ts     # 2048 game engine
│   └── gameSOS.ts      # SOS game engine
├── App.tsx
└── main.tsx
```

## Getting Started

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
```

Other commands:

```bash
npm run build      # TypeScript check + production build → dist/
npm run preview    # Serve the production build locally
npm run lint       # Run ESLint
```

## Deployment

The project is designed for GitHub Pages:

```bash
npm run build
# Deploy dist/ to the gh-pages branch
# Or push to main and let GitHub Actions handle it
```

The base path is set to `/Games/` in `vite.config.ts` — update it if you deploy elsewhere.

## Sharing a Custom Game

When you customize a game on the Create page, the URL updates automatically with an encoded config. Copy that URL and send it to anyone:

```
https://{your-username}.github.io/Games/#/play/game2048?c=eyJncmlkU2l6ZSI6NSwidGlsZVN0eWxlIjoibmVvbiJ9
```

The `?c=` parameter contains the full config as base64url. When someone opens the link, PlayPage decodes and validates it, then renders the game with those settings. If the URL is invalid or tampered with, it falls back to the template defaults.

## Architecture Principles

- **Template registry** uses `componentKey: string` (not React components stored directly) to avoid circular imports and bundle bloat.
- **Config validation** happens in two places: on the Create page (user tweaks sliders/sees preview) and on the Play page (decoded URL config is merged with schema defaults).
- **Game engines** are pure utility modules (`src/utils/game*.ts`) — no React dependencies, fully testable, shared between the game component and any future headless usage.
- **Scoring** uses a flat `ScoreEntry[]` array, not per-game buckets, to simplify querying. `getScores(gameSlug?)` filters when a slug is provided.
- **Component type** follows: `Props { config: Record<string, unknown>; onScore?: (score: number) => void }`.

## Adding a New Game Template

1. Create game logic in `src/utils/gameX.ts`
2. Create `src/components/games/GameX.tsx` (follows `Props` pattern above)
3. Register in `src/data/templates.ts` — add schema + template entry
4. Add to `src/components/games/gameMap.ts`
5. (Optional) Add any new `ConfigFieldType` to `src/types/index.ts` and handle it in `ConfigPanel.tsx` + `configCodec.ts`

## License

MIT
