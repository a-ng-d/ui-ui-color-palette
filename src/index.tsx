import { createRoot } from 'react-dom/client'
import React from 'react'
import mixpanel from 'mixpanel-browser'
import * as Sentry from '@sentry/react'
import App from './ui/App'
import globalConfig from './global.config'
import { initMixpanel, setMixpanelEnv } from './external/tracking/client'
import { initSentry } from './external/monitoring/client'
import { initSupabase } from './external/auth/client'
import { ThemeProvider } from './config/ThemeContext'
import { ConfigProvider } from './config/ConfigContext'

const container = document.getElementById('app'),
  root = createRoot(container)

if (globalConfig.env.isMixpanelEnabled) {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN as string, {
    api_host: 'https://api-eu.mixpanel.com',
    debug: globalConfig.env.isDev,
    disable_persistence: true,
    disable_cookie: true,
    ignore_dnt: true,
    opt_out_tracking_by_default: true,
  })
  mixpanel.opt_in_tracking()

  initMixpanel(mixpanel)
  setMixpanelEnv(import.meta.env.MODE as 'development' | 'production')
}

if (globalConfig.env.isSentryEnabled && !globalConfig.env.isDev) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        autoInject: false,
      }),
    ],
    tracesSampleRate: 0.5,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 0.1,
    debug: true,
    attachStacktrace: true,
    maxValueLength: 1000,
    normalizeDepth: 10,
    maxBreadcrumbs: 100,

    release: import.meta.env.VITE_APP_VERSION,
  })

  initSentry(Sentry)
} else {
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

if (globalConfig.env.isSupabaseEnabled)
  initSupabase(
    globalConfig.urls.databaseUrl,
    import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY
  )

window.addEventListener(
  'message',
  (event: MessageEvent) => {
    const pluginEvent = new CustomEvent('pluginMessage', {
      detail: event.data,
    })
    window.dispatchEvent(pluginEvent)
  },
  false
)

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
      palettesDbViewName: globalConfig.dbs.palettesDbViewName,
      palettesDbTableName: globalConfig.dbs.palettesDbTableName,
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
      uicpUrl: globalConfig.urls.uicpUrl,
      storeUrl: globalConfig.urls.storeUrl,
      storeManagementUrl: globalConfig.urls.storeManagementUrl,
    }}
    versions={{
      userConsentVersion: globalConfig.versions.userConsentVersion,
      trialVersion: globalConfig.versions.trialVersion,
      algorithmVersion: globalConfig.versions.algorithmVersion,
      paletteVersion: globalConfig.versions.paletteVersion,
      pluginVersion: globalConfig.versions.pluginVersion,
    }}
    features={globalConfig.features}
    locales={globalConfig.locales}
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
