import { AlgorithmVersionConfiguration } from '@yelbolt/engine-ui-color-palette'
import { Feature } from '@unoff/utils'
import { Language } from './translations'
import { Editor, Service } from './app'

export interface Config {
  limits: {
    pageSize: number
    width: number
    height: number
    minWidth: number
    minHeight: number
    localPalettes?: number
    sourceColors?: number
    customStops?: number
    colorThemes?: number
  }
  env: {
    isDev: boolean
    platform: 'figma' | 'penpot' | 'sketch' | 'framer'
    editor: Editor
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
    isSupabaseEnabled: boolean
    isMixpanelEnabled: boolean
    isSentryEnabled: boolean
    isMistralAiEnabled: boolean
    isNotionEnabled: boolean
    isPolarEnabled: boolean
    announcementsDbId: string
    onboardingDbId: string
    readonly pluginId: string
  }
  plan: {
    isProEnabled: boolean
    isTrialEnabled: boolean
    isCreditsEnabled: boolean
    trialTime: number
    creditsLimit: number
    creditsRenewalPeriodDays: number
    creditsRenewalPeriodHours?: number
    storeProWeekId: string
    storeProMonthId: string
    storeProYearId: string
    storeProLifetimeId: string
  }
  dbs: {
    palettesDbViewName: string
    palettesDbTableName: string
    starredPalettesDbTableName: string
  }
  urls: {
    authWorkerUrl: string
    announcementsWorkerUrl: string
    corsWorkerUrl: string
    databaseUrl: string
    authUrl: string
    storeApiUrl: string
    platformUrl: string
    uiUrl: string
    documentationUrl: string
    repositoryUrl: string
    supportEmail: string
    communityUrl: string
    feedbackUrl: string
    trialFeedbackUrl: string
    requestsUrl: string
    networkUrl: string
    authorUrl: string
    licenseUrl: string
    privacyUrl: string
    vsCodeFigmaPluginUrl: string
    isbUrl: string
    uicpUrl: string
    storeUrl: string
    storeManagementUrl: string
    storeUltimateRequestUrl: string
    howToUseUrl: string
  }
  versions: {
    readonly userConsentVersion: string
    readonly trialVersion: string
    readonly algorithmVersion: AlgorithmVersionConfiguration
    readonly paletteVersion: string
    readonly pluginVersion: string
    readonly creditsVersion: string
  }
  features: Array<Feature<Service>>
  lang: Language
  fees: {
    colourLoversImport: number
    coolorsImport: number
    realtimeColorsImport: number
    imageColorsExtract: number
    harmonyCreate: number
    aiColorsGenerate: number
    paletteCreate: number
    paletteGenerate: number
    paletteWithPropsGenerate: number
    sheetGenerate: number
    paletteUpdates: number
    localStylesSync: number
    localVariablesSync: number
    localTokensSync: number
  }
}
