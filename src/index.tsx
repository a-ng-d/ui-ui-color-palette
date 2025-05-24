import React from 'react'
import { createRoot } from 'react-dom/client'
import features, {
  algorithmVersion,
  announcementsWorkerUrl,
  authorUrl,
  authUrl,
  authWorkerUrl,
  databaseUrl,
  documentationUrl,
  feedbackUrl,
  isbUrl,
  isProEnabled,
  isTrialEnabled,
  licenseUrl,
  mode,
  networkUrl,
  oldTrialTime,
  pageSize,
  paletteDataVersion,
  palettesDbTableName,
  palettesStorageName,
  privacyUrl,
  repositoryUrl,
  supportEmail,
  theme,
  trialFeedbackUrl,
  trialTime,
  trialVersion,
  userConsentVersion,
  vsCodeFigmaPluginUrl,
} from './config'
import { initializeAnalytics } from './config/analytics'
import { ConfigProvider } from './config/ConfigContext'
import { ThemeProvider } from './config/ThemeContext'
import App from './ui/App'

const container = document.getElementById('app'),
  root = createRoot(container)
export const isDev = import.meta.env.MODE === 'development'

initializeAnalytics()

root.render(
  <ConfigProvider
    limits={{
      pageSize: pageSize,
    }}
    env={{
      isDev: isDev,
    }}
    plan={{
      isProEnabled: isProEnabled,
      isTrialEnabled: isTrialEnabled,
      trialTime: trialTime,
      oldTrialTime: oldTrialTime,
    }}
    dbs={{
      palettesDbTableName: palettesDbTableName,
      palettesStorageName: palettesStorageName,
    }}
    urls={{
      authWorkerUrl: authWorkerUrl,
      announcementsWorkerUrl: announcementsWorkerUrl,
      databaseUrl: databaseUrl,
      authUrl: authUrl,
      documentationUrl: documentationUrl,
      repositoryUrl: repositoryUrl,
      supportEmail: supportEmail,
      feedbackUrl: feedbackUrl,
      trialFeedbackUrl: trialFeedbackUrl,
      requestsUrl: repositoryUrl,
      networkUrl: networkUrl,
      authorUrl: authorUrl,
      licenseUrl: licenseUrl,
      privacyUrl: privacyUrl,
      vsCodeFigmaPluginUrl: vsCodeFigmaPluginUrl,
      isbUrl: isbUrl,
    }}
    versions={{
      userConsentVersion: userConsentVersion,
      trialVersion: trialVersion,
      paletteDataVersion: paletteDataVersion,
      algorithmVersion: algorithmVersion,
    }}
    features={features}
  >
    <ThemeProvider
      theme={theme}
      mode={mode}
    >
      <App />
    </ThemeProvider>
  </ConfigProvider>
)

export { ConfigProvider, type ConfigContextType } from './config/ConfigContext'
export { ThemeProvider } from './config/ThemeContext'
export { default as App } from './ui/App'
