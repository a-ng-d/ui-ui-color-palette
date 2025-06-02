import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  HexModel,
} from '@a_ng_d/utils-ui-color-palette'
import { Channel } from 'diagnostics_channel'
import {
  ColorConfiguration,
  PresetConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
} from './configurations'

export interface PaletteData {
  name: string
  description: string
  themes: Array<PaletteDataThemeItem>
  collectionId?: string
  version: string
  type: 'palette'
}

export interface PaletteDataThemeItem {
  id: string
  name: string
  description: string
  colors: Array<PaletteDataColorItem>
  modeId?: string
  type: 'default theme' | 'custom theme'
}

export interface PaletteDataColorItem {
  id: string
  name: string
  description: string
  shades: Array<PaletteDataShadeItem>
  type: 'color'
}

export interface PaletteDataShadeItem {
  name: string
  description: string
  hex: HexModel
  rgb: Channel
  gl: Channel
  lch: Channel
  oklch: Channel
  lab: Channel
  oklab: Channel
  hsl: Channel
  hsluv: Channel
  alpha?: number
  backgroundColor?: Channel
  mixedColor?: Channel
  styleId: string
  isClosestToRef?: boolean
  isSourceColorLocked?: boolean
  isTransparent?: boolean
  type: 'source color' | 'color shade'
}

export interface ColourLovers {
  id: number
  apiUrl: string
  badgeUrl: string
  colors: Array<HexModel>
  dateCreated: Date | string
  description: string
  imageUrl: string
  numComments: number
  numHearts: number
  numViews: number
  numVotes: number
  rank: number
  title: string
  url: string
  userName: string
}

export interface ExternalPalettes {
  palette_id: string
  name: string
  description: string
  preset: PresetConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: boolean
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  color_space: ColorSpaceConfiguration
  algorithm_version: AlgorithmVersionConfiguration
  is_shared: boolean
  creator_id: string
  creator_avatar: string
  creator_full_name: string
  created_at: Date | string
  updated_at: Date | string
  published_at: Date | string
}
