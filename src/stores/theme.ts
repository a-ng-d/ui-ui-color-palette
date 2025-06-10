import { ThemeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { doScale } from '@a_ng_d/figmug-utils'
import { presets } from './presets'

const defaultTheme: ThemeConfiguration = {
  name: 'None',
  id: '00000000000',
  description: '',
  scale: doScale(presets[0].stops, presets[0].min, presets[0].max),
  paletteBackground: '#FFFFFF',
  visionSimulationMode: 'NONE',
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  isEnabled: true,
  type: 'default theme',
}

export default defaultTheme
