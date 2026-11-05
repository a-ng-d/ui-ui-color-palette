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

describe('token metering', () => {
  const aiMeter: Meter = {
    units: {},
    tokens: { tokensPerCredit: 400, outputTokenWeight: 4 },
  }
  it('weights output tokens x4 and rounds up per 400 tokens', () => {
    // 200 + 4 * 100 = 600 -> 1.5 -> 2
    expect(
      computeMeteredCost(aiMeter, { promptTokens: 200, completionTokens: 100 })
    ).toBe(2)
    // 400 + 4 * 100 = 800 -> 2
    expect(
      computeMeteredCost(aiMeter, { promptTokens: 400, completionTokens: 100 })
    ).toBe(2)
    expect(
      computeMeteredCost(aiMeter, { promptTokens: 1, completionTokens: 0 })
    ).toBe(1)
  })
  it('charges 0 when nothing was consumed', () => {
    expect(computeMeteredCost(aiMeter, {})).toBe(0)
    expect(
      computeMeteredCost(
        { ...aiMeter, min: 5 },
        { promptTokens: 0, completionTokens: 0 }
      )
    ).toBe(0)
  })
  it('applies min and max to tokens', () => {
    expect(
      computeMeteredCost(
        { ...aiMeter, max: 3 },
        { promptTokens: 4000, completionTokens: 1000 }
      )
    ).toBe(3)
    expect(
      estimateMeteredCost(
        { ...aiMeter, min: 5 },
        { promptTokens: 10, completionTokens: 10 }
      )
    ).toBe(5)
  })
  it('adds unit rates when both are present', () => {
    expect(
      computeMeteredCost(
        { units: { color: 1 }, tokens: aiMeter.tokens },
        { color: 2, promptTokens: 400 }
      )
    ).toBe(3)
  })
})
