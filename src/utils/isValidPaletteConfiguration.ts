import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'

export default function isValidPaletteConfiguration(
  data: unknown
): data is FullConfiguration {
  if (typeof data !== 'object' || data === null) return false

  const candidate = data as Record<string, unknown>

  if (candidate.type !== 'UI_COLOR_PALETTE') return false

  const meta = candidate.meta as Record<string, unknown> | undefined
  if (typeof meta?.id !== 'string' || meta.id.length === 0) return false

  if (!Array.isArray(candidate.themes) || candidate.themes.length === 0)
    return false

  if (typeof candidate.base !== 'object' || candidate.base === null)
    return false

  return true
}
