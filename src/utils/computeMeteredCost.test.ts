import { describe, expect, it } from 'vitest'
import { Meter } from '../types/config'
import { computeMeteredCost, estimateMeteredCost } from './computeMeteredCost'

const colorMeter: Meter = { units: { color: 2 } }
const layerMeter: Meter = { units: { layer: 1 } }

describe('computeMeteredCost', () => {
  it('charges 24 for 6 colors x 2 modes', () => {
    expect(computeMeteredCost(colorMeter, { color: 12 })).toBe(24)
  })
  it('charges 8 for 2 changed colors x 2 modes', () => {
    expect(computeMeteredCost(colorMeter, { color: 4 })).toBe(8)
  })
  it('charges 0 for zero units, even with a floor', () => {
    expect(computeMeteredCost(colorMeter, { color: 0 })).toBe(0)
    expect(computeMeteredCost({ ...colorMeter, min: 10 }, {})).toBe(0)
  })
  it('charges 40 for 40 layers', () => {
    expect(computeMeteredCost(layerMeter, { layer: 40 })).toBe(40)
  })
  it('applies the floor when units > 0', () => {
    expect(computeMeteredCost({ ...colorMeter, min: 10 }, { color: 1 })).toBe(
      10
    )
  })
  it('applies the cap only when configured', () => {
    expect(computeMeteredCost(colorMeter, { color: 500 })).toBe(1000)
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
    expect(estimateMeteredCost(colorMeter, { color: 12 })).toBe(24)
    expect(estimateMeteredCost(colorMeter, { color: 0 })).toBe(0)
  })
})
