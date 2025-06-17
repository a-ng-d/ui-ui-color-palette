import { deepMap } from 'nanostores'
import { ExchangeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../content/locales'
import { presets } from './presets'

export const $palette = deepMap<ExchangeConfiguration>({
  id: '',
  name: locales.get().settings.global.name.default,
  description: '',
  preset: presets[0],
  scale: {},
  shift: {
    chroma: 100,
  },
  areSourceColorsLocked: false,
  colorSpace: 'LCH',
  visionSimulationMode: 'NONE',
  algorithmVersion: 'v3',
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  colors: [],
})
