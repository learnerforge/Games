import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { TEMPLATES } from '../data/templates'
import { encodeConfig } from '../utils/configCodec'
import { addSavedGame } from '../utils/storage'
import ConfigPanel from '../components/ui/ConfigPanel'
import { getGameComponent } from '../components/games/gameMap'
import type { GameTemplate } from '../types'

export default function CreatePage() {
  const { slug } = useParams<{ slug: string }>()
  const template = TEMPLATES.find(t => t.slug === slug)

  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-theme-text-secondary text-lg">Template not found</p>
        <Link to="/" className="text-theme-primary underline mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  return <CreateForm template={template} />
}

function CreateForm({ template }: { template: GameTemplate }) {
  const [config, setConfig] = useState<Record<string, unknown>>({ ...template.defaultConfig })
  const [gameName, setGameName] = useState(`${template.title} Custom`)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateConfig = useCallback((key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const GameComponent = getGameComponent(template.componentKey)

  const shareUrl = `${window.location.origin}/Games/#/play/${template.slug}?c=${encodeConfig(config)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    addSavedGame({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      templateSlug: template.slug,
      name: gameName.trim() || `${template.title} Custom`,
      config: { ...config },
      date: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="touch-button text-theme-text-secondary hover:text-theme-text transition-colors text-sm">← Home</Link>
        <h2 className="text-xl font-bold text-theme-text">{template.icon} Customize {template.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-theme-bg-card border border-theme-border rounded-xl p-4 md:p-6 min-h-[300px]">
            {GameComponent ? (
              <GameComponent config={config} />
            ) : (
              <div className="text-center py-10 text-theme-text-secondary">
                <p className="text-lg mb-2">Preview</p>
                <p>Configure the settings and see the live preview here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-theme-bg-card border border-theme-border rounded-xl p-4">
          <ConfigPanel schema={template.configSchema} config={config} onChange={updateConfig} />

          <hr className="border-theme-border my-4" />

          <div className="space-y-3">
            <div>
              <label className="text-xs text-theme-text-secondary block mb-1">Game Name</label>
              <input
                type="text"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm focus:outline-none focus:border-theme-primary"
              />
            </div>

            <button
              onClick={handleCopy}
              className="touch-button w-full px-4 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-hover transition-colors"
            >
              {copied ? '✓ Link Copied!' : '📋 Copy Share Link'}
            </button>

            <button
              onClick={handleSave}
              className="touch-button w-full px-4 py-2.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm hover:border-theme-primary transition-colors"
            >
              {saved ? '✓ Saved!' : '💾 Save Locally'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
