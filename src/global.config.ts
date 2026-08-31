import { Feature } from '@unoff/utils'
import { Config } from './types/config'
import { Service } from './types/app'
import { doSpecificMode } from './stores/features'

declare const __PLATFORM__: 'figma' | 'penpot' | 'sketch' | 'framer'
declare const __COLOR_MODE__: 'dark' | 'light'
declare const __EDITOR__:
  | 'figma'
  | 'dev'
  | 'figjam'
  | 'buzz'
  | 'penpot'
  | 'framer'

const isDev = import.meta.env.MODE === 'development'
declare const __APP_VERSION__: string

const isUiOverrideEnabled = import.meta.env.VITE_UI_OVERRIDE_ENABLED === 'true'

const isEmbed =
  typeof window !== 'undefined' &&
  ['1', 'true'].includes(
    (
      new URLSearchParams(window.location.search).get('embed') ?? ''
    ).toLowerCase()
  )

interface SpecConfig {
  [platform: string]: {
    [colorMode: string]: {
      [editor: string]: {
        env: {
          platform: 'figma' | 'penpot' | 'sketch' | 'framer'
          editor:
            | 'figma'
            | 'dev'
            | 'figjam'
            | 'buzz'
            | 'penpot'
            | 'sketch'
            | 'framer'
          ui: 'figma' | 'penpot' | 'sketch' | 'framer'
          colorMode:
            | 'figma-light'
            | 'figma-dark'
            | 'penpot-light'
            | 'penpot-dark'
            | 'sketch-light'
            | 'sketch-dark'
            | 'framer-light'
            | 'framer-dark'
        }
        features: Array<Feature<Service>>
      }
    }
  }
}

const proFeatures = [
  'CREATE_PALETTE',
  'LOCAL_PALETTES',
  'DOCUMENT_CREATE',
  'SYNC_LOCAL_STYLES',
  'SYNC_LOCAL_VARIABLES',
  'SYNC_LOCAL_TOKENS',
  'USER_PREFERENCES_SYNC_DEEP_STYLES',
  'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
  'USER_PREFERENCES_SYNC_DEEP_TOKENS',
  'PREVIEW_SCORES_WCAG_INTERVAL',
  'PREVIEW_SCORES_APCA_INTERVAL',
  'PREVIEW_FILTER_PASS',
  'PREVIEW_FILTER_FAIL',
  'DOCUMENT_PALETTE',
  'DOCUMENT_PALETTE_PROPERTIES',
  'DOCUMENT_SHEET',
  'DOCUMENT_PUSH_UPDATES',
  'PRESETS_MATERIAL',
  'PRESETS_MATERIAL_3',
  'PRESETS_TAILWIND',
  'PRESETS_ANT',
  'PRESETS_RADIX',
  'PRESETS_UNTITLED_UI',
  'PRESETS_BOOTSTRAP',
  'PRESETS_OPEN_COLOR',
  'PRESETS_SPECTRUM',
  'PRESETS_SPECTRUM_NEUTRAL',
  'PRESETS_ADS',
  'PRESETS_ADS_NEUTRAL',
  'PRESETS_CARBON',
  'PRESETS_BASE',
  'PRESETS_FLUENT',
  'PRESETS_POLARIS',
  'PRESETS_CUSTOM_ADD',
  'COLORS_ADD',
  'THEMES_ADD',
  'EXPORT_TOKENS_DTCG',
  'EXPORT_TOKENS_NATIVE',
  'EXPORT_TOKENS_STYLE_DICTIONARY_V3',
  'EXPORT_TOKENS_UNIVERSAL',
  'EXPORT_STYLESHEET_SCSS',
  'EXPORT_STYLESHEET_LESS',
  'EXPORT_TAILWIND_V3',
  'EXPORT_TAILWIND_V4',
  'EXPORT_APPLE_SWIFTUI',
  'EXPORT_APPLE_UIKIT',
  'EXPORT_ANDROID_COMPOSE',
  'EXPORT_ANDROID_XML',
  'EXPORT_CSV',
  'REPORT',
  'HELP_EMAIL',
]

const specConfig: SpecConfig = {
  figma: {
    light: {
      figma: {
        env: {
          platform: 'figma',
          editor: 'figma',
          ui: 'figma',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      figjam: {
        env: {
          platform: 'figma',
          editor: 'figjam',
          ui: 'figma',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      buzz: {
        env: {
          platform: 'figma',
          editor: 'buzz',
          ui: 'figma',
          colorMode: 'figma-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
    },
    dark: {
      figma: {
        env: {
          platform: 'figma',
          editor: 'figma',
          ui: 'figma',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      figjam: {
        env: {
          platform: 'figma',
          editor: 'figjam',
          ui: 'figma',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
      buzz: {
        env: {
          platform: 'figma',
          editor: 'buzz',
          ui: 'figma',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_FILE'], proFeatures, []),
      },
    },
  },
  penpot: {
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
          proFeatures,
          []
        ),
      },
    },
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
          proFeatures,
          []
        ),
      },
    },
  },
  sketch: {
    light: {
      sketch: {
        env: {
          platform: 'sketch',
          editor: 'sketch',
          ui: 'sketch',
          colorMode: 'sketch-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_PAGE'], proFeatures, []),
      },
    },
    dark: {
      sketch: {
        env: {
          platform: 'sketch',
          editor: 'sketch',
          ui: 'sketch',
          colorMode: 'sketch-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_PAGE'], proFeatures, []),
      },
    },
  },
  framer: {
    light: {
      framer: {
        env: {
          platform: 'framer',
          editor: 'framer',
          ui: 'framer',
          colorMode: 'framer-light',
        },
        features: doSpecificMode(['LOCAL_PALETTES_PAGE'], proFeatures, []),
      },
    },
    dark: {
      framer: {
        env: {
          platform: 'framer',
          editor: 'framer',
          ui: 'framer',
          colorMode: 'framer-dark',
        },
        features: doSpecificMode(['LOCAL_PALETTES_PAGE'], proFeatures, []),
      },
    },
  },
}

type SpecTarget = SpecConfig[string][string][string]

const resolveSpecTarget = (): SpecTarget => {
  const buildTarget = specConfig[__PLATFORM__][__COLOR_MODE__][__EDITOR__]

  if (!isUiOverrideEnabled || typeof window === 'undefined') return buildTarget

  const params = new URLSearchParams(window.location.search)
  const platformParam = params.get('platform')
  const colorModeParam = params.get('mode')
  const editorParam = params.get('editor')

  if (!platformParam && !colorModeParam && !editorParam) return buildTarget

  const platformGroup = specConfig[platformParam ?? __PLATFORM__]
  if (!platformGroup) return buildTarget

  const colorModeGroup =
    (colorModeParam && platformGroup[colorModeParam]) ||
    platformGroup[__COLOR_MODE__] ||
    Object.values(platformGroup)[0]
  if (!colorModeGroup) return buildTarget

  const target =
    (editorParam && colorModeGroup[editorParam]) ||
    Object.values(colorModeGroup)[0]

  return target ?? buildTarget
}

const specTarget = resolveSpecTarget()

const globalConfig: Config = {
  limits: {
    pageSize: 20,
    width: 640,
    height: 640,
    minWidth: 240,
    minHeight: 420,
    sourceColors: 5,
    customStops: 6,
    colorThemes: 2,
    localPalettes: 3,
  },
  env: {
    ...specTarget.env,
    isDev,
    isEmbed,
    isSupabaseEnabled: import.meta.env.VITE_SUPABASE_ENABLED === 'true',
    isMixpanelEnabled: import.meta.env.VITE_MIXPANEL_ENABLED === 'true',
    isSentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
    isMistralAiEnabled: import.meta.env.VITE_MISTRAL_AI_ENABLED === 'true',
    isNotionEnabled: import.meta.env.VITE_NOTION_ENABLED === 'true',
    isPolarEnabled: import.meta.env.VITE_POLAR_ENABLED === 'true',
    announcementsDbId: import.meta.env.VITE_NOTION_ANNOUNCEMENTS_ID as string,
    onboardingDbId: import.meta.env.VITE_NOTION_ONBOARDING_ID as string,
    pluginId: '123456789',
  },
  plan: {
    isProEnabled: import.meta.env.VITE_PRO_ENABLED === 'true',
    isTrialEnabled: import.meta.env.VITE_TRIAL_ENABLED === 'true',
    isCreditsEnabled: import.meta.env.VITE_CREDITS_ENABLED === 'true',
    trialTime: 72,
    creditsLimit: 500,
    creditsRenewalPeriodDays: 7,
    creditsRenewalPeriodHours: 168,
    storeProWeekId: '20d1df96-8052-47de-bf62-36b412c35885',
    storeProMonthId: '5f0502a5-9708-459d-b002-495e2860c23a',
    storeProYearId: '66a55061-29ff-4c52-8ce0-0661ab12890e',
    storeProLifetimeId: 'ae8ecdd5-badd-42d1-98fc-91f6ffdc77a6',
  },
  dbs: {
    palettesDbViewName: import.meta.env.VITE_DBS_PALETTES_VIEW as string,
    palettesDbTableName: import.meta.env.VITE_DBS_PALETTES_TABLE as string,
    starredPalettesDbTableName: import.meta.env
      .VITE_DBS_STARRED_PALETTES_TABLE as string,
  },
  urls: {
    authWorkerUrl: import.meta.env.VITE_AUTH_WORKER_URL as string,
    announcementsWorkerUrl: import.meta.env
      .VITE_ANNOUNCEMENTS_WORKER_URL as string,
    corsWorkerUrl: import.meta.env.VITE_CORS_WORKER_URL as string,
    databaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    authUrl: import.meta.env.VITE_AUTH_URL as string,
    storeApiUrl: import.meta.env.VITE_LEMONSQUEEZY_URL as string,
    platformUrl: window.location.origin,
    uiUrl: import.meta.env.VITE_UI_URL as string,
    documentationUrl: 'https://uicp.ylb.lt/docs',
    repositoryUrl: 'https://uicp.ylb.lt/repository',
    communityUrl: 'https://uicp.ylb.lt/community',
    supportEmail: 'https://uicp.ylb.lt/support',
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
    storeUrl: 'https://uicp.ylb.lt/store',
    storeManagementUrl: 'https://uicp.ylb.lt/store-management',
    storeUltimateRequestUrl: 'https://uicp.ylb.lt/ultimate-request',
    howToUseUrl: 'https://uicp.ylb.lt/how-to-use-figma',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.04',
    algorithmVersion: 'v3',
    paletteVersion: '2026.08',
    pluginVersion: __APP_VERSION__,
    creditsVersion: '2026.05',
  },
  features: specTarget.features,
  lang: 'en-US',
  fees: {
    colourLoversImport: 25,
    coolorsImport: 25,
    realtimeColorsImport: 25,
    imageColorsExtract: 50,
    harmonyCreate: 50,
    aiColorsGenerate: 50,
    paletteCreate: 100,
    paletteGenerate: 200,
    paletteWithPropsGenerate: 200,
    sheetGenerate: 200,
    paletteUpdates: 100,
    localStylesSync: 300,
    localVariablesSync: 300,
    localTokensSync: 300,
  },
}

const limitsMapping: { [key: string]: keyof typeof globalConfig.limits } = {
  COLORS_ADD: 'sourceColors',
  THEMES_ADD: 'colorThemes',
  PRESETS_CUSTOM_ADD: 'customStops',
  LOCAL_PALETTES: 'localPalettes',
}

globalConfig.features.forEach((feature) => {
  const limitKey = limitsMapping[feature.name]
  if (limitKey && globalConfig.limits[limitKey] !== undefined)
    feature.limit = globalConfig.limits[limitKey]
})

export default globalConfig
