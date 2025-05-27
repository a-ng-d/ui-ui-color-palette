import { TextColorsThemeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  ExchangeConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from './configurations'

export interface ScaleMessage {
  type: 'UPDATE_SCALE'
  id: string
  data: ExchangeConfiguration
  feature?: string
}

export interface ColorsMessage {
  type: 'UPDATE_COLORS'
  id: string
  data: Array<ColorConfiguration>
}

export interface ThemesMessage {
  type: 'UPDATE_THEMES'
  id: string
  data: Array<ThemeConfiguration>
}

export interface SettingsMessage {
  type: 'UPDATE_SETTINGS'
  id: string
  data: {
    name: string
    description: string
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    algorithmVersion: AlgorithmVersionConfiguration
    textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  }
}

export interface PaletteMessage {
  type: 'UPDATE_PALETTE'
  id: string
  items: Array<{
    key: string
    value: boolean | object | string
  }>
}

export interface NotificationMessage {
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  message: string
}
