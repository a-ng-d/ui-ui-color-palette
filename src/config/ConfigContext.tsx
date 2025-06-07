import { Feature } from '@a_ng_d/figmug-utils'
import React, { createContext, ReactNode, useContext } from 'react'

export interface ConfigContextType {
  limits: {
    pageSize: number
  }
  env: {
    isDev: boolean
    platform: 'figma' | 'penpot'
    editor: 'figma' | 'figjam' | 'dev' | 'penpot'
    supabaseAnonKey: string
    announcementsDbId: string
    onboardingDbId: string
  }
  plan: {
    isProEnabled: boolean
    isTrialEnabled: boolean
    trialTime: number
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
    networkUrl: string
    documentationUrl: string
    repositoryUrl: string
    supportEmail: string
    feedbackUrl: string
    trialFeedbackUrl: string
    requestsUrl: string
    isbUrl: string
    licenseUrl: string
    privacyUrl: string
    vsCodeFigmaPluginUrl: string
    authorUrl: string
  }
  versions: {
    userConsentVersion: string
    trialVersion: string
    algorithmVersion: 'v1' | 'v2' | 'v3'
    paletteDataVersion: string
  }
  features: Array<Feature<'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'>>
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
)

interface ConfigProviderProps extends ConfigContextType {
  children: ReactNode
}

export const ConfigProvider = ({
  children,
  limits,
  env,
  plan,
  dbs,
  urls,
  versions,
  features,
}: ConfigProviderProps) => {
  return (
    <ConfigContext.Provider
      value={{ limits, env, plan, dbs, urls, versions, features }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context)
    throw new Error('useConfig must be used within a ConfigProvider')
  return context
}
