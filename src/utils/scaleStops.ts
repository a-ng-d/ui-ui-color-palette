import {
  EasingConfiguration,
  ScaleConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doScale } from '@unoff/utils'

export const computeScaleForStops = (
  stops: number[],
  currentScale: ScaleConfiguration,
  distributionEasing: EasingConfiguration
): ScaleConfiguration => {
  const currentStopIds = Object.keys(currentScale)
    .map((id) => parseFloat(id))
    .sort((a, b) => a - b)

  if (currentStopIds.length < 2)
    return doScale(stops, 0, 100, distributionEasing)

  const minId = currentStopIds[0]
  const maxId = currentStopIds[currentStopIds.length - 1]
  const minIdValue = parseFloat(currentScale[minId].toString())
  const maxIdValue = parseFloat(currentScale[maxId].toString())
  const isInverted = minIdValue < maxIdValue

  const allValues = Object.values(currentScale).map((v) =>
    parseFloat(v.toString())
  )
  const scaleMin = Math.min(...allValues)
  const scaleMax = Math.max(...allValues)

  let tempEasing = distributionEasing
  if (
    isInverted &&
    tempEasing.includes('EASEIN_') &&
    !tempEasing.includes('INOUT')
  )
    tempEasing = tempEasing.replace(
      'EASEIN_',
      'EASEOUT_'
    ) as EasingConfiguration
  else if (
    isInverted &&
    tempEasing.includes('EASEOUT_') &&
    !tempEasing.includes('INOUT')
  )
    tempEasing = tempEasing.replace(
      'EASEOUT_',
      'EASEIN_'
    ) as EasingConfiguration

  const calculatedScale = doScale(stops, scaleMin, scaleMax, tempEasing)

  return isInverted
    ? Object.fromEntries(
        Object.entries(calculatedScale).map(([id, value]) => [
          id,
          scaleMax - (parseFloat(value.toString()) - scaleMin),
        ])
      )
    : calculatedScale
}