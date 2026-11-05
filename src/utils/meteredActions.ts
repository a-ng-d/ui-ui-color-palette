import { MeteredAction } from '../types/messages'
import { Config, MeterKey } from '../types/config'
import { MeteredUsage, estimateMeteredCost } from './computeMeteredCost'

export const ACTION_METER: Record<MeteredAction, MeterKey> = {
  SYNC_LOCAL_STYLES: 'localStylesSync',
  SYNC_LOCAL_VARIABLES: 'localVariablesSync',
  SYNC_LOCAL_TOKENS: 'localTokensSync',
  CREATE_DOCUMENT: 'documentGenerate',
  UPDATE_DOCUMENT: 'documentUpdate',
  SIMULATE_PALETTE: 'paletteSimulate',
}

export const isMeteredAction = (
  config: Pick<Config, 'meteredActions'>,
  action: MeteredAction
): boolean => config.meteredActions?.includes(action) ?? false

export const areCreditsEnabled = (config: Pick<Config, 'plan'>): boolean =>
  config.plan.isProEnabled && config.plan.isCreditsEnabled

export const estimateAction = (
  config: Pick<Config, 'plan'>,
  action: MeteredAction,
  estimatedUsage: MeteredUsage
): number =>
  estimateMeteredCost(config.plan.meters[ACTION_METER[action]], estimatedUsage)

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

export const estimateUsage = (
  action: MeteredAction,
  context: { sourceColors: number; modes: number; selectionLayers: number }
): MeteredUsage => {
  if (action === 'SIMULATE_PALETTE') return { layer: context.selectionLayers }
  if (action === 'UPDATE_DOCUMENT') return { color: context.sourceColors }
  return { color: context.sourceColors * context.modes }
}

export const isOutOfCredits = (
  config: Pick<Config, 'plan'>,
  balance: number,
  estimate: number
): boolean => areCreditsEnabled(config) && (balance <= 0 || estimate > balance)

export const creditsGateValue = (
  config: Pick<Config, 'plan'>,
  balance: number,
  estimate: number
): number => (isOutOfCredits(config, balance, estimate) ? 0 : -1)
