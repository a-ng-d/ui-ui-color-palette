import { createRoot } from 'react-dom/client'
import React from 'react'
import mixpanel from 'mixpanel-figma'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/react'
import App from './ui/App'
import globalConfig from './global.config'
import { ThemeProvider } from './config/ThemeContext'
import { ConfigProvider } from './config/ConfigContext'

const container = document.getElementById('app'),
  root = createRoot(container)

if (globalConfig.env.isMixpanelEnabled)
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN as string, {
    debug: globalConfig.env.isDev,
    disable_persistence: true,
    disable_cookie: true,
    opt_out_tracking_by_default: true,
  })

if (globalConfig.env.isMixpanelEnabled && !globalConfig.env.isDev)
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_AUTH_TOKEN as string,
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        autoInject: false,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 0.5,
  })
else if (globalConfig.env.isDev) {
  const devLogger = {
    captureException: (error: Error) => {
      console.group('🐛 Dev Error Logger')
      console.error(error)
      console.groupEnd()
    },
    captureMessage: (message: string) => {
      console.group('📝 Dev Message Logger')
      console.info(message)
      console.groupEnd()
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).Sentry = devLogger
}

let supabase: SupabaseClient
if (globalConfig.env.isSupabaseEnabled)
  supabase = createClient(
    globalConfig.urls.databaseUrl,
    import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY
  )

export { supabase }

root.render(
  <ConfigProvider
    limits={{
      pageSize: globalConfig.limits.pageSize,
    }}
    env={{
      platform: globalConfig.env.platform,
      ui: globalConfig.env.ui,
      colorMode: globalConfig.env.colorMode,
      editor: globalConfig.env.editor,
      isDev: globalConfig.env.isDev,
      isSupabaseEnabled: globalConfig.env.isSupabaseEnabled,
      isMixpanelEnabled: globalConfig.env.isMixpanelEnabled,
      isSentryEnabled: globalConfig.env.isSentryEnabled,
      announcementsDbId: globalConfig.env.announcementsDbId,
      onboardingDbId: globalConfig.env.onboardingDbId,
      pluginId: globalConfig.env.pluginId,
    }}
    plan={{
      isProEnabled: globalConfig.plan.isProEnabled,
      isTrialEnabled: globalConfig.plan.isTrialEnabled,
      trialTime: globalConfig.plan.trialTime,
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
      storeApiUrl: globalConfig.urls.storeApiUrl,
      platformUrl: globalConfig.urls.platformUrl,
      uiUrl: globalConfig.urls.uiUrl,
      documentationUrl: globalConfig.urls.documentationUrl,
      repositoryUrl: globalConfig.urls.repositoryUrl,
      supportEmail: globalConfig.urls.supportEmail,
      communityUrl: globalConfig.urls.communityUrl,
      feedbackUrl: globalConfig.urls.feedbackUrl,
      trialFeedbackUrl: globalConfig.urls.trialFeedbackUrl,
      requestsUrl: globalConfig.urls.requestsUrl,
      networkUrl: globalConfig.urls.networkUrl,
      authorUrl: globalConfig.urls.authorUrl,
      licenseUrl: globalConfig.urls.licenseUrl,
      privacyUrl: globalConfig.urls.privacyUrl,
      vsCodeFigmaPluginUrl: globalConfig.urls.vsCodeFigmaPluginUrl,
      isbUrl: globalConfig.urls.isbUrl,
      storeUrl: globalConfig.urls.storeUrl,
      storeManagementUrl: globalConfig.urls.storeManagementUrl,
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
