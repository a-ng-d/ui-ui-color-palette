import { ViewConfiguration } from '@yelbolt/engine-ui-color-palette'
import { MeteredAction } from '../types/messages'
import { Config, MeterKey } from '../types/config'
import { MeteredUsage, estimateMeteredCost } from './computeMeteredCost'

export const DOCUMENT_METER: Record<ViewConfiguration, MeterKey> = {
  PALETTE: 'documentPalette',
  PALETTE_WITH_PROPERTIES: 'documentPaletteWithProperties',
  SHEET: 'documentSheet',
}

const ACTION_METER: Record<
  Exclude<MeteredAction, 'CREATE_DOCUMENT' | 'UPDATE_DOCUMENT'>,
  MeterKey
> = {
  SYNC_LOCAL_STYLES: 'localStylesSync',
  SYNC_LOCAL_VARIABLES: 'localVariablesSync',
  SYNC_LOCAL_TOKENS: 'localTokensSync',
  SIMULATE_PALETTE: 'paletteSimulate',
}

export const meterFor = (
  action: MeteredAction,
  view?: ViewConfiguration
): MeterKey => {
  if (action === 'CREATE_DOCUMENT' || action === 'UPDATE_DOCUMENT')
    return DOCUMENT_METER[view ?? 'PALETTE']
  return ACTION_METER[action]
}

export const areCreditsAppliedTo = (
  config: Pick<Config, 'plan'>,
  planStatus: string
): boolean => areCreditsEnabled(config) && planStatus !== 'PAID'

export const areCreditsEnabled = (config: Pick<Config, 'plan'>): boolean =>
  config.plan.isProEnabled && config.plan.isCreditsEnabled

export const estimateAction = (
  config: Pick<Config, 'plan'>,
  action: MeteredAction,
  estimatedUsage: MeteredUsage,
  view?: ViewConfiguration
): number =>
  estimateMeteredCost(
    config.plan.meters[meterFor(action, view)],
    estimatedUsage
  )

export const countSourceColors = (colors: unknown): number =>
  Array.isArray(colors) ? colors.length : 0

export const countModes = (
  themes: ReadonlyArray<{ type?: string }> | undefined
): number => {
  const list = themes ?? []
  const working =
    list.length > 1
      ? list.filter((theme) => theme.type === 'custom theme')
      : list.filter((theme) => theme.type === 'default theme')

  return Math.max(1, working.length)
}

export const countShades = (palette: {
  scale?: Record<string, unknown>
  preset?: { stops?: ReadonlyArray<unknown> }
}): number => {
  const fromScale = Object.keys(palette.scale ?? {}).length
  return fromScale > 0 ? fromScale : (palette.preset?.stops?.length ?? 0)
}

export const estimateUsage = (
  action: MeteredAction,
  context: {
    sourceColors: number
    modes: number
    shades: number
    selectionLayers: number
  }
): MeteredUsage => {
  const items = context.shades * context.sourceColors * context.modes
  if (action === 'SIMULATE_PALETTE') return { layer: context.selectionLayers }
  if (action === 'UPDATE_DOCUMENT') return { color: context.sourceColors }
  if (action === 'SYNC_LOCAL_STYLES') return { style: items }
  if (action === 'SYNC_LOCAL_VARIABLES') return { variable: items }
  if (action === 'SYNC_LOCAL_TOKENS') return { token: items }
  return { color: context.sourceColors * context.modes }
}

export const isOutOfCredits = (
  config: Pick<Config, 'plan'>,
  balance: number,
  estimate: number
): boolean => areCreditsEnabled(config) && (balance <= 0 || estimate > balance)

export const isCreditGatedBlocked = (
  status: { isBlocked: () => boolean },
  config: Pick<Config, 'plan'>,
  balance: number,
  estimate: number
): boolean =>
  areCreditsEnabled(config)
    ? status.isBlocked() && isOutOfCredits(config, balance, estimate)
    : status.isBlocked()

export const isCreditsExhausted = (
  config: Pick<Config, 'plan'>,
  planStatus: string,
  balance: number,
  estimate: number
): boolean =>
  areCreditsAppliedTo(config, planStatus) &&
  isOutOfCredits(config, balance, estimate)

const CHARS_PER_TOKEN = 4
export const EXPECTED_AI_PALETTE_TOKENS = 350

export const estimateAiUsage = (
  promptChars: number,
  instructionChars: number
): MeteredUsage => ({
  promptTokens: Math.ceil((promptChars + instructionChars) / CHARS_PER_TOKEN),
  completionTokens: EXPECTED_AI_PALETTE_TOKENS,
})
