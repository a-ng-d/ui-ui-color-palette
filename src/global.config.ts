import { Feature } from '@a_ng_d/figmug-utils'
import { Config } from './types/config'
import { doSpecificMode } from './stores/features'
import { locales } from './content/locales'

declare const __PLATFORM__: 'figma' | 'penpot'
declare const __COLOR_MODE__: 'dark' | 'light'
declare const __EDITOR__: 'figma' | 'dev' | 'penpot'

const isDev = import.meta.env.MODE === 'development'

interface SpecConfig {
  [platform: string]: {
    [colorMode: string]: {
      [editor: string]: {
        env: {
          platform: 'figma' | 'penpot' | 'sketch'
          editor: 'figma' | 'dev' | 'penpot' | 'sketch'
          ui: 'figma-ui3' | 'penpot' | 'sketch'
          colorMode:
            | 'figma-dark'
            | 'figma-light'
            | 'penpot-dark'
            | 'penpot-light'
            | 'sketch-dark'
            | 'sketch-light'
        }
        features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'>>
      }
    }
  }
}

const specConfig: SpecConfig = {
  figma: {
    dark: {
      figma: {
        env: {
          platform: 'figma',
          editor: 'figma',
          ui: 'figma-ui3',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_FILE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma-ui3',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_FILE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
    light: {
      figma: {
        env: {
          platform: 'figma',
          editor: 'figma',
          ui: 'figma-ui3',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_FILE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma-ui3',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_FILE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
  },
  penpot: {
    dark: {
      penpot: {
        env: {
          platform: 'penpot',
          editor: 'penpot',
          ui: 'penpot',
          colorMode: 'penpot-dark',
        },
        features: doSpecificMode(
          [
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'BACKSTAGE_AUTHENTICATION',
            'PUBLICATION',
            'PUBLISH_PALETTE',
            'REMOTE_PALETTES',
            'LOCAL_PALETTES_FILE',
          ],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
    light: {
      penpot: {
        env: {
          platform: 'penpot',
          editor: 'penpot',
          ui: 'penpot',
          colorMode: 'penpot-light',
        },
        features: doSpecificMode(
          [
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'BACKSTAGE_AUTHENTICATION',
            'PUBLICATION',
            'PUBLISH_PALETTE',
            'REMOTE_PALETTES',
            'LOCAL_PALETTES_FILE',
          ],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
  },
  sketch: {
    dark: {
      sketch: {
        env: {
          platform: 'sketch',
          editor: 'sketch',
          ui: 'sketch',
          colorMode: 'sketch-dark',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_PAGE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
    light: {
      sketch: {
        env: {
          platform: 'sketch',
          editor: 'sketch',
          ui: 'sketch',
          colorMode: 'sketch-light',
        },
        features: doSpecificMode(
          ['LOCAL_PALETTES_PAGE'],
          [
            'LOCAL_PALETTES',
            'SYNC_LOCAL_STYLES',
            'SYNC_LOCAL_VARIABLES',
            'USER_PREFERENCES_SYNC_DEEP_STYLES',
            'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
            'PREVIEW_LOCK_SOURCE_COLORS',
            'SOURCE',
            'PRESETS_MATERIAL_3',
            'PRESETS_TAILWIND',
            'PRESETS_ADS',
            'PRESETS_ADS_NEUTRAL',
            'PRESETS_CARBON',
            'PRESETS_BASE',
            'PRESETS_POLARIS',
            'PRESETS_CUSTOM_ADD',
            'SCALE_CHROMA',
            'SCALE_HELPER_DISTRIBUTION',
            'THEMES',
            'THEMES_NAME',
            'THEMES_PARAMS',
            'THEMES_DESCRIPTION',
            'COLORS',
            'COLORS_HUE_SHIFTING',
            'COLORS_CHROMA_SHIFTING',
            'COLORS_ALPHA',
            'COLORS_BACKGROUND_COLOR',
            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
            'EXPORT_TAILWIND',
            'EXPORT_APPLE_SWIFTUI',
            'EXPORT_APPLE_UIKIT',
            'EXPORT_ANDROID_COMPOSE',
            'EXPORT_ANDROID_XML',
            'EXPORT_CSV',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
            'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
          ],
          ['SCALE_CONTRAST_RATIO']
        ),
      },
    },
  },
}

const globalConfig: Config = {
  limits: {
    pageSize: 20,
  },
  env: {
    ...specConfig[__PLATFORM__][__COLOR_MODE__][__EDITOR__].env,
    isDev,
    isSupabaseEnabled: true,
    isMixpanelEnabled: true,
    isSentryEnabled: true,
    announcementsDbId: import.meta.env.VITE_NOTION_ANNOUNCEMENTS_ID as string,
    onboardingDbId: import.meta.env.VITE_NOTION_ONBOARDING_ID as string,
    pluginId: '123456789',
  },
  plan: {
    isProEnabled: true,
    isTrialEnabled: true,
    trialTime: 72,
  },
  dbs: {
    palettesDbTableName: 'sandbox.palettes',
    palettesStorageName: 'palette.screenshots',
  },
  urls: {
    authWorkerUrl: 'http://localhost:8787',
    announcementsWorkerUrl: 'http://localhost:8888',
    databaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    authUrl: 'http://localhost:3000',
    storeApiUrl: import.meta.env.VITE_LEMONSQUEEZY_URL as string,
    platformUrl: window.location.origin,
    uiUrl: 'http://localhost:4400',
    documentationUrl: 'https://uicp.ylb.lt/docs',
    repositoryUrl: 'https://uicp.ylb.lt/repository',
    communityUrl: 'https://uicp.ylb.lt/community',
    supportEmail: 'https://uicp.ylb.lt/contact',
    feedbackUrl:
      'https://angd.notion.site/ebd/13df8c62fd868018989de53f17ad6df3',
    trialFeedbackUrl: 'https://uicp.ylb.lt/feedback-trial',
    requestsUrl: 'https://uicp.ylb.lt/ideas',
    networkUrl: 'https://uicp.ylb.lt/network',
    authorUrl: 'https://uicp.ylb.lt/author',
    licenseUrl: 'https://uicp.ylb.lt/license',
    privacyUrl: 'https://uicp.ylb.lt/privacy',
    vsCodeFigmaPluginUrl:
      'https://marketplace.visualstudio.com/items?itemName=figma.figma-vscode-extension',
    isbUrl: 'https://isb.ylb.lt/website',
    uicpUrl: 'https://uicp.ylb.lt/website',
    storeUrl: isDev
      ? 'https://uicp.ylb.lt/store-dev'
      : 'https://uicp.ylb.lt/store',
    storeManagementUrl: isDev
      ? 'https://uicp.ylb.lt/store-management-dev'
      : 'https://uicp.ylb.lt/store-management',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.04',
    algorithmVersion: 'v3',
    paletteVersion: '2025.06',
  },
  features: specConfig[__PLATFORM__][__COLOR_MODE__][__EDITOR__].features,
  locales: locales.get(),
}

export default globalConfig
