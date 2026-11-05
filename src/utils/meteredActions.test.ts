import { describe, expect, it } from 'vitest'
import { Config } from '../types/config'
import { Config as C } from '../types/config'
import {
  estimateAction,
  estimateUsage,
  isCreditGatedBlocked,
  meterFor,
} from './meteredActions'

const makeConfig = (isCreditsEnabled: boolean) =>
  ({ plan: { isProEnabled: true, isCreditsEnabled } }) as Pick<Config, 'plan'>

const proLocked = { isBlocked: () => true }
const unlocked = { isBlocked: () => false }

describe('isCreditGatedBlocked', () => {
  it('keeps the Pro lock when credits are disabled', () => {
    expect(isCreditGatedBlocked(proLocked, makeConfig(false), 100, 4)).toBe(
      true
    )
    expect(isCreditGatedBlocked(unlocked, makeConfig(false), 0, 4)).toBe(false)
  })
  it('blocks an unpaid user only when out of credits', () => {
    const config = makeConfig(true)
    expect(isCreditGatedBlocked(proLocked, config, 100, 4)).toBe(false)
    expect(isCreditGatedBlocked(proLocked, config, 0, 0)).toBe(true)
    expect(isCreditGatedBlocked(proLocked, config, 3, 4)).toBe(true)
  })
  it('never blocks a paid user', () => {
    const config = makeConfig(true)
    expect(isCreditGatedBlocked(unlocked, config, 0, 50)).toBe(false)
  })
})

describe('estimateUsage', () => {
  const context = { sourceColors: 3, modes: 2, shades: 10, selectionLayers: 5 }
  it('counts items for sync actions', () => {
    expect(estimateUsage('SYNC_LOCAL_STYLES', context)).toEqual({ style: 60 })
    expect(estimateUsage('SYNC_LOCAL_VARIABLES', context)).toEqual({
      variable: 60,
    })
    expect(estimateUsage('SYNC_LOCAL_TOKENS', context)).toEqual({ token: 60 })
  })
  it('keeps documents and simulation units', () => {
    expect(estimateUsage('CREATE_DOCUMENT', context)).toEqual({ color: 6 })
    expect(estimateUsage('UPDATE_DOCUMENT', context)).toEqual({ color: 3 })
    expect(estimateUsage('SIMULATE_PALETTE', context)).toEqual({ layer: 5 })
  })
})

describe('document pricing by view', () => {
  const config = {
    plan: {
      isProEnabled: true,
      isCreditsEnabled: true,
      meters: {
        documentPalette: { units: { color: 4 } },
        documentPaletteWithProperties: { units: { color: 6 } },
        documentSheet: { units: { color: 8 } },
      },
    },
  } as unknown as Pick<C, 'plan'>
  const usage = { color: 3 }

  it('resolves one meter per view for generation', () => {
    expect(meterFor('CREATE_DOCUMENT', 'PALETTE')).toBe('documentPalette')
    expect(meterFor('CREATE_DOCUMENT', 'PALETTE_WITH_PROPERTIES')).toBe(
      'documentPaletteWithProperties'
    )
    expect(meterFor('CREATE_DOCUMENT', 'SHEET')).toBe('documentSheet')
  })
  it('prices an update like generating the same view', () => {
    expect(meterFor('UPDATE_DOCUMENT', 'SHEET')).toBe('documentSheet')
    expect(estimateAction(config, 'CREATE_DOCUMENT', usage, 'PALETTE')).toBe(12)
    expect(
      estimateAction(
        config,
        'CREATE_DOCUMENT',
        usage,
        'PALETTE_WITH_PROPERTIES'
      )
    ).toBe(18)
    expect(estimateAction(config, 'CREATE_DOCUMENT', usage, 'SHEET')).toBe(24)
    expect(estimateAction(config, 'UPDATE_DOCUMENT', usage, 'SHEET')).toBe(24)
  })
  it('falls back to the palette meter when the view is missing', () => {
    expect(meterFor('UPDATE_DOCUMENT')).toBe('documentPalette')
    expect(meterFor('SIMULATE_PALETTE')).toBe('paletteSimulate')
  })
})
