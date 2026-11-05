import { Meter, MeterUnit } from '../types/config'

export type MeteredUsage = Partial<Record<MeterUnit, number>>

const computeFromUsage = (meter: Meter, usage: MeteredUsage): number => {
  const units = Object.entries(usage) as Array<[MeterUnit, number]>
  const totalUnits = units.reduce(
    (sum, [, count]) => sum + (Number.isFinite(count) ? Math.max(0, count) : 0),
    0
  )

  if (totalUnits === 0) return 0

  const raw = units.reduce(
    (sum, [unit, count]) =>
      sum +
      (meter.units[unit] ?? 0) *
        (Number.isFinite(count) ? Math.max(0, count) : 0),
    0
  )

  let cost = Math.ceil(raw)
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
