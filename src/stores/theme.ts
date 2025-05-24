import { ThemeConfiguration } from '../types/configurations'
import doScale from '../utils/doScale'
import { presets } from './presets'

const defaultTheme: ThemeConfiguration = {
  name: 'None',
  id: '00000000000',
  description: '',
  scale: doScale(presets[0].scale, presets[0].min, presets[0].max),
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
