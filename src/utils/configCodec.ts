export function encodeConfig(config: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(config)
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch {
    return ''
  }
}

export function decodeConfig(encoded: string): Record<string, unknown> | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4
    const padded = padding ? base64 + '='.repeat(4 - padding) : base64
    const json = decodeURIComponent(escape(atob(padded)))
    const parsed = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export function validateConfig(
  raw: Record<string, unknown>,
  schema: import('../types').ConfigField[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of schema) {
    const value = raw[field.key]
    if (value === undefined || value === null) {
      result[field.key] = field.defaultValue
      continue
    }
    switch (field.type) {
      case 'slider':
      case 'number': {
        const num = Number(value)
        if (isNaN(num)) {
          result[field.key] = field.defaultValue
        } else if (field.min !== undefined && num < field.min) {
          result[field.key] = field.min
        } else if (field.max !== undefined && num > field.max) {
          result[field.key] = field.max
        } else {
          result[field.key] = num
        }
        break
      }
      case 'text': {
        result[field.key] = String(value)
        break
      }
      case 'toggle': {
        result[field.key] = value === true || value === 'true'
        break
      }
      case 'color': {
        if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
          result[field.key] = value
        } else {
          result[field.key] = field.defaultValue
        }
        break
      }
      case 'select': {
        if (field.options?.some(o => o.value === value)) {
          result[field.key] = value
        } else {
          result[field.key] = field.defaultValue
        }
        break
      }
      default:
        result[field.key] = value
    }
  }
  return result
}
