import {
  ExchangeConfiguration,
  makeDefaultShift,
  PresetConfiguration,
  ShiftCurveConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doScale } from '@unoff/utils'
import { ScaleMessage } from '../types/messages'
import { defaultPreset } from '../stores/presets'
import { $palette } from '../stores/palette'
import { sendPluginMessage } from './pluginMessage'

interface ResetScaleArgs {
  id: string
  preset: PresetConfiguration
  onChangeScale: () => void
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
}

export const resetScale = ({
  id,
  preset: currentPreset,
  onChangeScale,
  onChangeShift,
}: ResetScaleArgs) => {
  const preset = currentPreset ?? defaultPreset
  const scaleMessage: ScaleMessage = {
    type: 'UPDATE_SCALE',
    id,
    data: $palette.value as ExchangeConfiguration,
  }

  if (preset.id === 'CUSTOM_1_10') preset.stops = [1, 2, 3, 4, 5, 6]
  else if (preset.id === 'CUSTOM_10_100')
    preset.stops = [10, 20, 30, 40, 50, 60]
  else if (preset.id === 'CUSTOM_100_1000')
    preset.stops = [100, 200, 300, 400, 500, 600]

  scaleMessage.data.scale = doScale(preset.stops, preset.min, preset.max)
  scaleMessage.data.shift.chroma = makeDefaultShift('CHROMA')
  scaleMessage.data.shift.hue = makeDefaultShift('HUE')

  $palette.setKey('preset', preset)
  $palette.setKey('scale', scaleMessage.data.scale)
  $palette.setKey('shift.chroma', makeDefaultShift('CHROMA'))
  $palette.setKey('shift.hue', makeDefaultShift('HUE'))

  onChangeScale()
  onChangeShift('SHIFT_CHROMA', 'SHIFTED', makeDefaultShift('CHROMA'))
  onChangeShift('SHIFT_HUE', 'SHIFTED', makeDefaultShift('HUE'))

  sendPluginMessage({ pluginMessage: scaleMessage }, '*')
}
