import React from 'react'
import { createRoot } from 'react-dom/client'
import { initializeAnalytics } from './config/analytics'
import { ConfigProvider } from './config/ConfigContext'
import { ThemeProvider } from './config/ThemeContext'
import App from './ui/App'
import globalConfig from './global.config'

const container = document.getElementById('app'),
  root = createRoot(container)

initializeAnalytics()

root.render(
  <ConfigProvider
    limits={{
      pageSize: globalConfig.limits.pageSize,
    }}
    env={{
      isDev: globalConfig.env.isDev,
      platform: globalConfig.env.platform,
      editor: globalConfig.env.editor,
    }}
    plan={{
      isProEnabled: globalConfig.plan.isProEnabled,
      isTrialEnabled: globalConfig.plan.isTrialEnabled,
      trialTime: globalConfig.plan.trialTime,
      oldTrialTime: globalConfig.plan.oldTrialTime,
    }}
    dbs={{
      palettesDbTableName: globalConfig.dbs.palettesDbTableName,
      palettesStorageName: globalConfig.dbs.palettesStorageName,
    }}
    urls={{
      authWorkerUrl: globalConfig.urls.authWorkerUrl,
      announcementsWorkerUrl: globalConfig.urls.announcementsWorkerUrl,
      databaseUrl: globalConfig.urls.databaseUrl,
      authUrl: globalConfig.urls.authUrl,
      documentationUrl: globalConfig.urls.documentationUrl,
      repositoryUrl: globalConfig.urls.repositoryUrl,
      supportEmail: globalConfig.urls.supportEmail,
      feedbackUrl: globalConfig.urls.feedbackUrl,
      trialFeedbackUrl: globalConfig.urls.trialFeedbackUrl,
      requestsUrl: globalConfig.urls.requestsUrl,
      networkUrl: globalConfig.urls.networkUrl,
      authorUrl: globalConfig.urls.authorUrl,
      licenseUrl: globalConfig.urls.licenseUrl,
      privacyUrl: globalConfig.urls.privacyUrl,
      vsCodeFigmaPluginUrl: globalConfig.urls.vsCodeFigmaPluginUrl,
      isbUrl: globalConfig.urls.isbUrl,
    }}
    versions={{
      userConsentVersion: globalConfig.versions.userConsentVersion,
      trialVersion: globalConfig.versions.trialVersion,
      algorithmVersion: globalConfig.versions.algorithmVersion,
      paletteDataVersion: globalConfig.versions.paletteDataVersion,
    }}
    features={globalConfig.features}
  >
    <ThemeProvider
      theme={globalConfig.env.ui}
      mode={globalConfig.env.colorMode}
    >
      <App />
    </ThemeProvider>
  </ConfigProvider>
)

export { ConfigProvider, type ConfigContextType } from './config/ConfigContext'
export { ThemeProvider } from './config/ThemeContext'
export { default as App } from './ui/App'
