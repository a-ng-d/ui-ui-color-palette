import { deepMap } from 'nanostores'
import { ExchangeConfiguration } from '../types/configurations'
import { locals } from '../content/locals'
import { presets } from './presets'
import globalConfig from '../global.config'
import { AlgorithmVersionConfiguration } from '@a_ng_d/utils-ui-color-palette'

export const $palette = deepMap<ExchangeConfiguration>({
  id: '',
  name: locals.get().settings.global.name.default,
  description: '',
  preset: presets[0],
  scale: {},
  shift: {
    chroma: 100,
  },
  areSourceColorsLocked: false,
  colorSpace: 'LCH',
  visionSimulationMode: 'NONE',
  algorithmVersion: globalConfig.versions
    .algorithmVersion as AlgorithmVersionConfiguration,
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  colors: [],
  isThemeSwitched: false,
})
