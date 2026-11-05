import {
  Data,
  FullConfiguration,
  PaletteDataThemeItem,
} from '@yelbolt/engine-ui-color-palette'
import { MeteredAction, UsageUnit } from '../../types/messages'

// Web harness only: there is no canvas, so nothing is really written. The
// usage reported mirrors what a host would measure on a first run (every item
// created), so credits can be exercised in the browser.

const readThemes = (id?: string): Array<PaletteDataThemeItem> => {
  if (id === undefined) return []
  const raw = window.localStorage.getItem(`palette_${id}`)
  if (raw === null) return []

  try {
    const palette = JSON.parse(raw) as FullConfiguration
    return new Data(palette).makePaletteData().themes
  } catch {
    return []
  }
}

// Same working-themes rule as the hosts: custom themes when there are some,
// the default theme otherwise.
const workingThemes = (themes: Array<PaletteDataThemeItem>) => {
  const hasCustomThemes = themes.some((theme) => theme.type === 'custom theme')

  return themes.filter((theme) =>
    hasCustomThemes
      ? theme.type === 'custom theme'
      : theme.type === 'default theme'
  )
}

const countColorModes = (themes: Array<PaletteDataThemeItem>) =>
  workingThemes(themes).reduce((acc, theme) => acc + theme.colors.length, 0)

const countShadeModes = (themes: Array<PaletteDataThemeItem>) =>
  workingThemes(themes).reduce(
    (acc, theme) =>
      acc + theme.colors.reduce((sum, color) => sum + color.shades.length, 0),
    0
  )

export const mockUsage = (
  action: MeteredAction,
  id?: string
): Partial<Record<UsageUnit, number>> => {
  const themes = readThemes(id)

  switch (action) {
    case 'SYNC_LOCAL_STYLES':
      return { style: countShadeModes(themes) }
    case 'SYNC_LOCAL_VARIABLES':
      return { variable: countShadeModes(themes) }
    case 'SYNC_LOCAL_TOKENS':
      return { token: countShadeModes(themes) }
    case 'CREATE_DOCUMENT':
      return { color: countColorModes(themes) }
    case 'UPDATE_DOCUMENT':
      // No document can be selected without a canvas
      return { color: 0 }
    case 'SIMULATE_PALETTE':
      return { layer: 0 }
  }
}

export const reportMockUsage = (
  iframe: HTMLIFrameElement | null | undefined,
  action: MeteredAction,
  id?: string
) =>
  iframe?.contentWindow?.postMessage({
    type: 'REPORT_USAGE',
    data: { action, usage: mockUsage(action, id) },
  })
