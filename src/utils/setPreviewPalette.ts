import { uid } from 'uid'
import {
  ColorConfiguration,
  Data,
  ExchangeConfiguration,
  PaletteDataColorItem,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'

const setPreviewPalette = (
  sourceColors: Array<SourceColorConfiguration>,
  exchange: ExchangeConfiguration
): Array<PaletteDataColorItem> => {
  const colors: Array<ColorConfiguration> = sourceColors
    .map((sourceColor) => ({
      name: sourceColor.name,
      description: '',
      rgb: sourceColor.rgb,
      id: uid(),
      hue: {
        shift: exchange.shift.hue,
        isLocked: false,
      },
      chroma: {
        shift: exchange.shift.chroma,
        isLocked: false,
      },
      alpha: {
        isEnabled: false,
        backgroundColor: '#FFFFFF',
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const themes: Array<ThemeConfiguration> = [
    {
      name: '',
      description: '',
      scale: exchange.scale,
      paletteBackground: '#FFFFFF',
      visionSimulationMode: exchange.visionSimulationMode,
      textColorsTheme: exchange.textColorsTheme,
      isEnabled: true,
      id: '00000000000',
      type: 'default theme',
    },
  ]

  const data = new Data({
    base: {
      name: exchange.name,
      description: exchange.description,
      preset: exchange.preset,
      shift: exchange.shift,
      areSourceColorsLocked: exchange.areSourceColorsLocked,
      colors: colors,
      colorSpace: exchange.colorSpace,
      algorithmVersion: exchange.algorithmVersion,
    },
    themes: themes,
  }).makePaletteData()

  return data.themes[0].colors
}

export default setPreviewPalette
