import { describe, expect, it } from 'vitest'
import { Meter } from '../types/config'
import { computeMeteredCost, estimateMeteredCost } from './computeMeteredCost'

const colorMeter: Meter = { units: { color: 4 } }
const layerMeter: Meter = { units: { layer: 2 } }

describe('computeMeteredCost', () => {
  it('charges 48 for 6 colors x 2 modes', () => {
    expect(computeMeteredCost(colorMeter, { color: 12 })).toBe(48)
  })
  it('charges 16 for 2 changed colors x 2 modes', () => {
    expect(computeMeteredCost(colorMeter, { color: 4 })).toBe(16)
  })
  it('charges 0 for zero units, even with a floor', () => {
    expect(computeMeteredCost(colorMeter, { color: 0 })).toBe(0)
    expect(computeMeteredCost({ ...colorMeter, min: 10 }, {})).toBe(0)
  })
  it('charges 80 for 40 layers', () => {
    expect(computeMeteredCost(layerMeter, { layer: 40 })).toBe(80)
  })
  it('applies the floor when units > 0', () => {
    expect(computeMeteredCost({ ...colorMeter, min: 10 }, { color: 1 })).toBe(
      10
    )
  })
  it('applies the cap only when configured', () => {
    expect(computeMeteredCost(colorMeter, { color: 500 })).toBe(2000)
    expect(
      computeMeteredCost({ ...colorMeter, max: 100 }, { color: 500 })
    ).toBe(100)
  })
  it('rounds up fractional rates', () => {
    expect(computeMeteredCost({ units: { color: 0.5 } }, { color: 3 })).toBe(2)
  })
})

describe('estimateMeteredCost', () => {
  it('uses the same formula', () => {
    expect(estimateMeteredCost(colorMeter, { color: 12 })).toBe(48)
    expect(estimateMeteredCost(colorMeter, { color: 0 })).toBe(0)
  })
})

describe('style, variable and token meters', () => {
  it('charges 1 per item', () => {
    expect(computeMeteredCost({ units: { style: 1 } }, { style: 30 })).toBe(30)
    expect(
      computeMeteredCost({ units: { variable: 1 } }, { variable: 20 })
    ).toBe(20)
    expect(computeMeteredCost({ units: { token: 1 } }, { token: 7 })).toBe(7)
  })
})
