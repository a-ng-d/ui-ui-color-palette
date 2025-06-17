import {
  ColorSpaceConfiguration,
  EasingConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { Editor } from './app'

export interface EditorEvent {
  editor: Editor
}

export interface TrialEvent {
  date: number
  trialTime: number
}

export interface PublicationEvent {
  feature:
    | 'PUBLISH_PALETTE'
    | 'UNPUBLISH_PALETTE'
    | 'PUSH_PALETTE'
    | 'PULL_PALETTE'
    | 'REUSE_PALETTE'
    | 'SYNC_PALETTE'
    | 'REVERT_PALETTE'
    | 'DETACH_PALETTE'
    | 'ADD_PALETTE'
    | 'SHARE_PALETTE'
}

export interface ImportEvent {
  feature: 'IMPORT_COOLORS' | 'IMPORT_REALTIME_COLORS' | 'IMPORT_COLOUR_LOVERS'
}

export interface ScaleEvent {
  feature:
    | 'SWITCH_MATERIAL'
    | 'SWITCH_MATERIAL_3'
    | 'SWITCH_TAILWIND'
    | 'SWITCH_ANT'
    | 'SWITCH_ADS'
    | 'SWITCH_ADS_NEUTRAL'
    | 'SWITCH_CARBON'
    | 'SWITCH_BASE'
    | 'SWITCH_POLARIS'
    | 'SWITCH_CUSTOM'
    | 'SWITCH_CUSTOM_1_10'
    | 'SWITCH_CUSTOM_10_100'
    | 'SWITCH_CUSTOM_100_1000'
    | 'OPEN_KEYBOARD_SHORTCUTS'
    | 'CONTRAST_MODE_ON'
    | 'CONTRAST_MODE_OFF'
    | EasingConfiguration
}

export interface PreviewEvent {
  feature:
    | 'LOCK_SOURCE_COLORS'
    | 'UPDATE_COLOR_SPACE'
    | 'UPDATE_VISION_SIMULATION_MODE'
}

export interface SourceColorEvent {
  feature:
    | 'RENAME_COLOR'
    | 'REMOVE_COLOR'
    | 'ADD_COLOR'
    | 'UPDATE_HEX'
    | 'UPDATE_LCH'
    | 'SHIFT_HUE'
    | 'SHIFT_CHROMA'
    | 'RESET_HUE'
    | 'RESET_CHROMA'
    | 'DESCRIBE_COLOR'
    | 'SWITCH_ALPHA_MODE'
    | 'UPDATE_BACKGROUND_COLOR'
    | 'REORDER_COLOR'
}

export interface ColorThemeEvent {
  feature:
    | 'RENAME_THEME'
    | 'REMOVE_THEME'
    | 'ADD_THEME'
    | 'ADD_THEME_FROM_DROPDOWN'
    | 'UPDATE_BACKGROUND'
    | 'DESCRIBE_THEME'
    | 'REORDER_THEME'
}

export interface ExportEvent {
  feature:
    | 'TOKENS_DTCG'
    | 'TOKENS_GLOBAL'
    | 'TOKENS_AMZN_STYLE_DICTIONARY'
    | 'TOKENS_TOKENS_STUDIO'
    | 'CSS'
    | 'TAILWIND'
    | 'APPLE_SWIFTUI'
    | 'APPLE_UIKIT'
    | 'ANDROID_COMPOSE'
    | 'ANDROID_XML'
    | 'CSV'
  colorSpace?: ColorSpaceConfiguration
}

export interface SettingEvent {
  feature:
    | 'RENAME_PALETTE'
    | 'DESCRIBE_PALETTE'
    | 'UPDATE_VIEW'
    | 'UPDATE_COLOR_SPACE'
    | 'UPDATE_VISION_SIMULATION_MODE'
    | 'UPDATE_ALGORITHM'
    | 'UPDATE_TEXT_COLORS_THEME'
}

export interface ActionEvent {
  feature:
    | 'CREATE_PALETTE'
    | 'SYNC_STYLES'
    | 'SYNC_VARIABLES'
    | 'GENERATE_PALETTE'
    | 'GENERATE_PALETTE_WITH_PROPERTIES'
    | 'GENERATE_SHEET'
    | 'SWITCH_PALETTE'
    | 'SWITCH_PALETTE_WITH_PROPERTIES'
    | 'SWITCH_SHEET'
    | 'UPDATE_DOCUMENT'
  colors?: number
  stops?: number
}
