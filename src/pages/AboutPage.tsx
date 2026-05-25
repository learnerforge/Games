export default function AboutPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-theme-text mb-4">About</h1>
      <div className="space-y-3 text-theme-text-secondary text-sm leading-relaxed">
        <p>
          <strong className="text-theme-text">PlayRoads Arena</strong> is a web-only browser game platform
          inspired by Slow Roads. Play instantly — no downloads, no sign-ups.
        </p>
        <p>
          Built with React, TypeScript, Tailwind CSS, and the Canvas API.
          Scores are saved locally in your browser using LocalStorage.
        </p>
        <p>
          Works on Android, iPhone, iPad, Windows, macOS, Linux, Chromebook, and tablets.
        </p>
        <h2 className="text-base font-semibold text-theme-text pt-2">Controls</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-theme-text">Keyboard:</strong> Arrow keys, WASD, Space, Enter, Escape</li>
          <li><strong className="text-theme-text">Touch:</strong> Tap buttons, swipe for Snake/2048/Pong</li>
          <li><strong className="text-theme-text">Mouse:</strong> Click to interact</li>
        </ul>
        <h2 className="text-base font-semibold text-theme-text pt-2">Tech Stack</h2>
        <p>React 18, TypeScript, Vite 6, Tailwind CSS 4, Canvas API, LocalStorage</p>
      </div>
    </div>
  )
}
