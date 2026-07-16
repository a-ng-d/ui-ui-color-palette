import {
  BaseConfiguration,
  ColorConfiguration,
  PresetConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doScale } from '@unoff/utils'
import { defaultPreset } from './presets'

const FALLBACK_PRESET: PresetConfiguration = {
  id: 'CUSTOM_10_100',
  name: 'Custom',
  stops: [10, 20, 30, 40, 50, 60],
  min: 10,
  max: 90,
  easing: 'LINEAR',
  family: 'Custom',
}

export const makePreviewData = (
  sourceColors: Array<SourceColorConfiguration>
): { base: BaseConfiguration; themes: Array<ThemeConfiguration> } => {
  const preset = defaultPreset ?? FALLBACK_PRESET
  return {
    base: {
      name: '',
      description: '',
      preset,
      shift: { chroma: 100, hue: 0 },
      areSourceColorsLocked: false,
      colors: sourceColors.map(
        (sourceColor): ColorConfiguration => ({
          id: sourceColor.id,
          name: sourceColor.name,
          description: '',
          rgb: sourceColor.rgb,
          hue: {
            shift: sourceColor.hue?.shift ?? 0,
            isLocked: sourceColor.hue?.isLocked ?? false,
          },
          chroma: {
            shift: sourceColor.chroma?.shift ?? 100,
            isLocked: sourceColor.chroma?.isLocked ?? false,
          },
          alpha: { isEnabled: false, backgroundColor: '#FFFFFF' },
        })
      ),
      colorSpace: 'LCH',
      algorithmVersion: 'v3',
    },
    themes: [
      {
        id: '00000000000',
        name: 'None',
        description: '',
        scale: doScale(preset.stops, preset.min, preset.max, preset.easing),
        paletteBackground: '#FFFFFF',
        visionSimulationMode: 'NONE',
        textColorsTheme: { lightColor: '#FFFFFF', darkColor: '#000000' },
        isEnabled: true,
        type: 'default theme',
      },
    ],
  }
}