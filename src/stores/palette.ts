import { atom, deepMap, map } from 'nanostores'
import {
  CreatorConfiguration,
  DatesConfiguration,
  ExchangeConfiguration,
  PublicationConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { getTolgee } from '../external/translation'
import { getPresets } from './presets'

export const $palette = deepMap<ExchangeConfiguration>({
  id: '',
  name: '',
  description: '',
  preset: {
    id: 'CUSTOM_10_100',
    name: 'Custom',
    stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    min: 10,
    max: 90,
    easing: 'LINEAR',
    family: 'Custom',
  },
  scale: {},
  shift: {
    chroma: 100,
    hue: 0,
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

export const $themes = atom<Array<ThemeConfiguration>>([])
export const $dates = map<DatesConfiguration>({
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
  openedAt: '',
})
export const $publicationStatus = map<PublicationConfiguration>({
  isPublished: false,
  isShared: false,
})
export const $creatorIdentity = map<CreatorConfiguration>({
  creatorId: '',
  creatorFullName: '',
  creatorAvatar: '',
})

export const initializePaletteStore = () => {
  const t = getTolgee().t
  $palette.setKey('name', t('settings.global.name.default'))
  $palette.setKey('preset', getPresets(t)[1])
}
