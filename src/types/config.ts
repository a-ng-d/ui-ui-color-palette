import { AlgorithmVersionConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { Feature } from '@a_ng_d/figmug-utils'
import { Language, Translations } from './translations'

export interface Config {
  limits: {
    pageSize: number
  }
  env: {
    isDev: boolean
    platform: 'figma' | 'penpot' | 'sketch' | 'framer'
    editor: 'figma' | 'figjam' | 'dev' | 'penpot' | 'sketch' | 'framer'
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
    announcementsDbId: string
    onboardingDbId: string
    readonly pluginId: string
  }
  plan: {
    isProEnabled: boolean
    isTrialEnabled: boolean
    trialTime: number
    creditsLimit: number
    creditsRenewalPeriodDays: number
    creditsRenewalPeriodHours?: number
  }
  dbs: {
    palettesDbViewName: string
    palettesDbTableName: string
    starredPalettesDbTableName: string
  }
  urls: {
    authWorkerUrl: string
    announcementsWorkerUrl: string
    databaseUrl: string
    authUrl: string
    storeApiUrl: string
    aiApiUrl: string
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
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'SEE'>>
  locales: Translations
  lang: Language
}
