import { Feature } from '@a_ng_d/figmug-utils'
import { doSpecificMode } from './stores/features'
import { Config } from './types/config'

declare const __PLATFORM__: 'figma' | 'penpot'
declare const __COLOR_MODE__: 'dark' | 'light'
declare const __EDITOR__: 'figma' | 'dev' | 'penpot'

const isDev = import.meta.env.MODE === 'development'

interface SpecConfig {
  [platform: string]: {
    [colorMode: string]: {
      [editor: string]: {
        env: {
          platform: 'figma' | 'penpot'
          editor: 'figma' | 'dev' | 'penpot'
          ui: 'figma-ui3' | 'penpot'
          colorMode:
            | 'figma-dark'
            | 'figma-light'
            | 'penpot-dark'
            | 'penpot-light'
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
        features: doSpecificMode([], [], []),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma-ui3',
          colorMode: 'figma-dark',
        },
        features: doSpecificMode([], [], []),
      },
    },
    light: {
      figma: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma-ui3',
          colorMode: 'figma-light',
        },
        features: doSpecificMode([], [], []),
      },
      dev: {
        env: {
          platform: 'figma',
          editor: 'dev',
          ui: 'figma-ui3',
          colorMode: 'figma-light',
        },
        features: doSpecificMode([], [], []),
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
        features: doSpecificMode([], [], []),
      },
    },
    light: {
      penpot: {
        env: {
          platform: 'penpot',
          editor: 'penpot',
          ui: 'penpot',
          colorMode: 'penpot-dark',
        },
        features: doSpecificMode([], [], []),
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
  },
  plan: {
    isProEnabled: false,
    isTrialEnabled: false,
    trialTime: 72,
    oldTrialTime: 72,
  },
  dbs: {
    palettesDbTableName: isDev ? 'sandbox.palettes' : 'palettes',
    palettesStorageName: isDev ? 'palette.screenshots' : 'palette.screenshots',
  },
  urls: {
    authWorkerUrl: isDev
      ? 'http://localhost:8787'
      : (import.meta.env.VITE_AUTH_WORKER_URL as string),
    announcementsWorkerUrl: isDev
      ? 'http://localhost:8888'
      : (import.meta.env.VITE_ANNOUNCEMENTS_WORKER_URL as string),
    databaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    authUrl: isDev
      ? 'http://localhost:3000'
      : (import.meta.env.VITE_AUTH_URL as string),
    documentationUrl: 'https://uicp.ylb.lt/docs',
    repositoryUrl: 'https://uicp.ylb.lt/repository',
    supportEmail: 'https://uicp.ylb.lt/contact',
    feedbackUrl: 'https://uicp.ylb.lt/feedback',
    trialFeedbackUrl: 'https://uicp.ylb.lt/feedback-trial',
    requestsUrl: 'https://uicp.ylb.lt/ideas',
    networkUrl: 'https://uicp.ylb.lt/network',
    authorUrl: 'https://uicp.ylb.lt/author',
    licenseUrl: 'https://uicp.ylb.lt/license',
    privacyUrl: 'https://uicp.ylb.lt/privacy',
    vsCodeFigmaPluginUrl:
      'https://marketplace.visualstudio.com/items?itemName=figma.figma-vscode-extension',
    isbUrl: 'https://isb.ylb.lt/run',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.03',
    algorithmVersion: 'v3',
    paletteDataVersion: '2025.03',
  },
  features: specConfig[__PLATFORM__][__COLOR_MODE__][__EDITOR__].features,
}

export default globalConfig
