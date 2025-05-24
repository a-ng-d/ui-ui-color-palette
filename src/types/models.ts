import { Channel, HexModel } from '@a_ng_d/figmug-ui'

export type ColorFormat<T extends 'HEX' | 'RGB'> = T extends 'HEX'
  ? HexModel
  : Channel

export interface TextColorsThemeHexModel {
  lightColor: HexModel
  darkColor: HexModel
}

export interface TextColorsThemeGLModel {
  lightColor: Array<number>
  darkColor: Array<number>
}

export interface ActionsList {
  [action: string]: () => void
}
