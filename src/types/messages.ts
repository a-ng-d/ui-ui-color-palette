import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  ExchangeConfiguration,
  TaxonomyBinding,
  TaxonomySchema,
  TextColorsThemeConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'

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

export interface SystemSchemaMessage {
  type: 'UPDATE_SYSTEM_SCHEMA'
  id: string
  data: TaxonomySchema
}

export interface SystemBindingsMessage {
  type: 'UPDATE_SYSTEM_BINDINGS'
  id: string
  data: Array<TaxonomyBinding>
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
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  message: string
  timer?: number
}

export interface PluginMessageData {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}
