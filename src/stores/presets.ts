import { PresetConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { Translations } from '../types/translations'
import { locales } from '../content/locales'

export const getPresets = (locales: Translations): Array<PresetConfiguration> => [
  {
    name: locales.scale.presets.customOnes,
    stops: [1, 2, 3, 4, 5, 6],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.scale.presets.custom,
    id: 'CUSTOM_1_10',
  },
  {
    name: locales.scale.presets.customTens,
    stops: [10, 20, 30, 40, 50, 60],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.scale.presets.custom,
    id: 'CUSTOM_10_100',
  },
  {
    name: locales.scale.presets.customHundreds,
    stops: [100, 200, 300, 400, 500, 600],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.scale.presets.custom,
    id: 'CUSTOM_100_1000',
  },
  {
    name: locales.scale.presets.material,
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.scale.presets.google,
    id: 'MATERIAL',
  },
  {
    name: locales.scale.presets.material3,
    stops: [100, 99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
    min: 0,
    max: 100,
    easing: 'NONE',
    family: locales.scale.presets.google,
    id: 'MATERIAL_3',
  },
  {
    name: locales.scale.presets.tailwind,
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    min: 16,
    max: 96,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'TAILWIND',
  },
  {
    name: locales.scale.presets.ant,
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    min: 24,
    max: 96,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'ANT',
  },
  {
    name: locales.scale.presets.bootstrap,
    stops: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 15,
    max: 95,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'BOOTSTRAP',
  },
  {
    name: locales.scale.presets.radix,
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    min: 5,
    max: 95,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'RADIX',
  },
  {
    name: locales.scale.presets.untitledUI,
    stops: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    min: 5,
    max: 100,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'UNTITLED_UI',
  },
  {
    name: locales.scale.presets.openColor,
    stops: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    min: 15,
    max: 100,
    family: locales.scale.presets.framework,
    easing: 'LINEAR',
    id: 'OPEN_COLOR',
  },
  {
    name: locales.scale.presets.ads,
    stops: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.scale.presets.atlassian,
    id: 'ADS',
  },
  {
    name: locales.scale.presets.adsNeutral,
    stops: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100],
    min: 8,
    max: 100,
    easing: 'LINEAR',
    family: locales.scale.presets.atlassian,
    id: 'ADS_NEUTRAL',
  },
  {
    name: locales.scale.presets.spectrum,
    stops: [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
    ],
    min: 16,
    max: 96,
    easing: 'LINEAR',
    family: locales.scale.presets.adobe,
    id: 'SPECTRUM',
  },
  {
    name: locales.scale.presets.spectrumNeutral,
    stops: [50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 0,
    max: 100,
    easing: 'LINEAR',
    family: locales.scale.presets.adobe,
    id: 'SPECTRUM_NEUTRAL',
  },
  {
    name: locales.scale.presets.carbon,
    stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.scale.presets.more,
    id: 'CARBON',
  },
  {
    name: locales.scale.presets.base,
    stops: [50, 100, 200, 300, 400, 500, 600, 700],
    min: 24,
    max: 96,
    easing: 'LINEAR',
    family: locales.scale.presets.more,
    id: 'BASE',
  },
  {
    name: locales.scale.presets.polaris,
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    min: 16,
    max: 100,
    easing: 'EASEOUT_QUAD',
    family: locales.scale.presets.more,
    id: 'POLARIS',
  },
  {
    name: locales.scale.presets.fluent,
    stops: [
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
    ],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: locales.scale.presets.more,
    id: 'FLUENT',
  },
]

export const getDefaultPreset = (locales: Translations): PresetConfiguration =>
  getPresets(locales)[1]

export let presets = getPresets(locales.get())
export let defaultPreset = getDefaultPreset(locales.get())

export const updatePresets = (newLocales: Translations) => {
  presets = getPresets(newLocales)
  defaultPreset = getDefaultPreset(newLocales)
}
