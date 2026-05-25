import type { ConfigField } from '../../types'

interface ConfigPanelProps {
  schema: ConfigField[]
  config: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export default function ConfigPanel({ schema, config, onChange }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wide">Settings</h3>
      {schema.map(field => (
        <div key={field.key}>
          <label className="flex items-center justify-between mb-1">
            <span className="text-sm text-theme-text">{field.label}</span>
            <span className="text-xs text-theme-text-secondary font-mono">
              {field.type === 'toggle'
                ? (config[field.key] ? 'On' : 'Off')
                : String(config[field.key] ?? field.defaultValue)}
            </span>
          </label>
          {field.description && (
            <p className="text-xs text-theme-text-secondary mb-1">{field.description}</p>
          )}
          {renderField(field, config[field.key] ?? field.defaultValue, (v) => onChange(field.key, v))}
        </div>
      ))}
    </div>
  )
}

function renderField(field: ConfigField, value: unknown, onChange: (v: unknown) => void) {
  switch (field.type) {
    case 'slider':
      return (
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={Number(value)}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full accent-theme-primary cursor-pointer"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={Number(value)}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm focus:outline-none focus:border-theme-primary"
        />
      )
    case 'toggle':
      return (
        <button
          onClick={() => onChange(!value)}
          className={`touch-button relative w-12 h-6 rounded-full transition-colors ${
            value ? 'bg-theme-primary' : 'bg-theme-border'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : ''
            }`}
          />
        </button>
      )
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={String(value)}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-theme-border bg-transparent"
          />
          <span className="text-xs text-theme-text-secondary font-mono">{String(value)}</span>
        </div>
      )
    case 'select':
      return (
        <select
          value={String(value)}
          onChange={e => {
            const opt = field.options?.find(o => String(o.value) === e.target.value)
            onChange(opt?.value ?? e.target.value)
          }}
          className="w-full px-3 py-1.5 rounded-lg bg-theme-bg-secondary border border-theme-border text-theme-text text-sm focus:outline-none focus:border-theme-primary cursor-pointer"
        >
          {field.options?.map(opt => (
            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
          ))}
        </select>
      )
    default:
      return null
  }
}
