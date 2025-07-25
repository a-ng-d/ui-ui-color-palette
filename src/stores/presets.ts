import { PresetConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../content/locales'

export const presets: Array<PresetConfiguration> = [
  {
    name: locales.get().scale.presets.material,
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.get().scale.presets.google,
    id: 'MATERIAL',
  },
  {
    name: locales.get().scale.presets.material3,
    stops: [100, 99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
    min: 0,
    max: 100,
    easing: 'NONE',
    family: locales.get().scale.presets.google,
    id: 'MATERIAL_3',
  },
  {
    name: locales.get().scale.presets.tailwind,
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    min: 16,
    max: 96,
    easing: 'LINEAR',
    id: 'TAILWIND',
  },
  {
    name: locales.get().scale.presets.ant,
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    id: 'ANT',
  },
  {
    name: locales.get().scale.presets.ads,
    stops: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.get().scale.presets.atlassian,
    id: 'ADS',
  },
  {
    name: locales.get().scale.presets.adsNeutral,
    stops: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100],
    min: 8,
    max: 100,
    easing: 'LINEAR',
    family: locales.get().scale.presets.atlassian,
    id: 'ADS_NEUTRAL',
  },
  {
    name: locales.get().scale.presets.carbon,
    stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.get().scale.presets.more,
    id: 'CARBON',
  },
  {
    name: locales.get().scale.presets.base,
    stops: [50, 100, 200, 300, 400, 500, 600, 700],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.get().scale.presets.more,
    id: 'BASE',
  },
  {
    name: locales.get().scale.presets.polaris,
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    min: 16,
    max: 100,
    easing: 'EASEOUT_QUAD',
    family: locales.get().scale.presets.more,
    id: 'POLARIS',
  },
  {
    name: locales.get().scale.presets.customOnes,
    stops: [1, 2],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.get().scale.presets.custom,
    id: 'CUSTOM_1_10',
  },
  {
    name: locales.get().scale.presets.customTens,
    stops: [10, 20],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.get().scale.presets.custom,
    id: 'CUSTOM_10_100',
  },
  {
    name: locales.get().scale.presets.customHundreds,
    stops: [100, 200],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.get().scale.presets.custom,
    id: 'CUSTOM_100_1000',
  },
]

export const defaultPreset = presets[0]
