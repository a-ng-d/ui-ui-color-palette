import { describe, expect, it } from 'vitest'
import {
  displayedCredits,
  easeOutCubic,
  interpolateCredits,
} from './creditsTween'

describe('easeOutCubic', () => {
  it('maps 0 to 0 and 1 to 1, clamping outside the range', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(-2)).toBe(0)
    expect(easeOutCubic(5)).toBe(1)
  })
  it('is monotonic and front-loaded', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
    expect(easeOutCubic(0.6)).toBeGreaterThan(easeOutCubic(0.4))
  })
})

describe('interpolateCredits', () => {
  it('hits both endpoints', () => {
    expect(interpolateCredits(100, 90, 0)).toBe(100)
    expect(interpolateCredits(100, 90, 1)).toBe(90)
  })
})

describe('displayedCredits', () => {
  it('starts at from, ends exactly at to', () => {
    expect(displayedCredits(100, 90, 0)).toBe(100)
    expect(displayedCredits(100, 90, 700)).toBe(90)
    expect(displayedCredits(100, 90, 5000)).toBe(90)
  })
  it('returns rounded integers in between, never below the target', () => {
    for (let t = 0; t <= 700; t += 35) {
      const v = displayedCredits(100, 90, t)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(90)
      expect(v).toBeLessThanOrEqual(100)
    }
  })
  it('jumps when the duration is zero', () => {
    expect(displayedCredits(10, 5, 0, 0)).toBe(5)
  })
})
