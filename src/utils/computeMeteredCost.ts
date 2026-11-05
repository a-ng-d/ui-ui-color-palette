import { Meter, MeterUnit } from '../types/config'

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
}

export type MeteredUsage = Partial<Record<MeterUnit, number>> & TokenUsage

const safe = (value: number | undefined): number =>
  value !== undefined && Number.isFinite(value) ? Math.max(0, value) : 0

const computeFromUsage = (meter: Meter, usage: MeteredUsage): number => {
  const { promptTokens, completionTokens, ...unitUsage } = usage
  const units = Object.entries(unitUsage) as Array<[MeterUnit, number]>
  const totalUnits = units.reduce((sum, [, count]) => sum + safe(count), 0)
  const prompt = safe(promptTokens)
  const completion = safe(completionTokens)

  if (totalUnits === 0 && prompt + completion === 0) return 0

  const unitCredits = units.reduce(
    (sum, [unit, count]) => sum + (meter.units[unit] ?? 0) * safe(count),
    0
  )
  const tokenCredits = meter.tokens
    ? (prompt + meter.tokens.outputTokenWeight * completion) /
      meter.tokens.tokensPerCredit
    : 0

  let cost = Math.ceil(unitCredits + tokenCredits)
  if (meter.min !== undefined) cost = Math.max(cost, meter.min)
  if (meter.max !== undefined) cost = Math.min(cost, meter.max)

  return cost
}

export const computeMeteredCost = (meter: Meter, usage: MeteredUsage): number =>
  computeFromUsage(meter, usage)

export const estimateMeteredCost = (
  meter: Meter,
  estimatedUsage: MeteredUsage
): number => computeFromUsage(meter, estimatedUsage)

export default computeMeteredCost
