import { Feature } from '@a_ng_d/figmug-utils'
import { AlgorithmVersionConfiguration } from '@a_ng_d/utils-ui-color-palette'

export interface Config {
  limits: {
    pageSize: number
  }
  env: {
    isDev: boolean
    platform: 'figma' | 'penpot'
    editor: 'figma' | 'figjam' | 'dev' | 'penpot'
    ui: 'figma-ui3' | 'penpot'
    colorMode: 'figma-dark' | 'figma-light' | 'penpot-dark' | 'penpot-light'
  }
  plan: {
    isProEnabled: boolean
    isTrialEnabled: boolean
    trialTime: number
    oldTrialTime: number
  }
  dbs: {
    palettesDbTableName: string
    palettesStorageName: string
  }
  urls: {
    authWorkerUrl: string
    announcementsWorkerUrl: string
    databaseUrl: string
    authUrl: string
    documentationUrl: string
    repositoryUrl: string
    supportEmail: string
    feedbackUrl: string
    trialFeedbackUrl: string
    requestsUrl: string
    networkUrl: string
    authorUrl: string
    licenseUrl: string
    privacyUrl: string
    vsCodeFigmaPluginUrl: string
    isbUrl: string
  }
  versions: {
    userConsentVersion: string
    trialVersion: string
    algorithmVersion: AlgorithmVersionConfiguration
    paletteDataVersion: string
  }
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'>>
}
