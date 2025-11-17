import { createRoot } from 'react-dom/client'
import React from 'react'
import mixpanel from 'mixpanel-browser'
import * as Sentry from '@sentry/react'
import App from './ui/App'
import globalConfig from './global.config'
import {
  initMixpanel,
  setEditor,
  setMixpanelEnv,
} from './external/tracking/client'
import { initSentry } from './external/monitoring'
import { initMistral } from './external/mistral'
import { initSupabase } from './external/auth'
import { ThemeProvider } from './config/ThemeContext'
import { ConfigProvider } from './config/ConfigContext'

const container = document.getElementById('app'),
  root = createRoot(container)

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY
const mistralApiKey = import.meta.env.VITE_MISTRAL_AI_API_KEY

// Mixpanel
if (globalConfig.env.isMixpanelEnabled) {
  mixpanel.init(mixpanelToken as string, {
    api_host: 'https://api-eu.mixpanel.com',
    debug: globalConfig.env.isDev,
    disable_persistence: true,
    disable_cookie: true,
    ignore_dnt: true,
    opt_out_tracking_by_default: true,
    record_sessions_percent: 50,
    record_mask_text_selector: '*',
    record_block_selector: 'img',
    record_heatmap_data: true,
  })
  mixpanel.opt_in_tracking()

  initMixpanel(mixpanel)
  setMixpanelEnv(import.meta.env.MODE as 'development' | 'production')
  setEditor(globalConfig.env.editor)
}

// Sentry
if (globalConfig.env.isSentryEnabled && !globalConfig.env.isDev) {
  Sentry.init({
    dsn: sentryDsn as string,
    environment: 'production',
    initialScope: {
      tags: {
        platform: globalConfig.env.platform,
        version: globalConfig.versions.pluginVersion,
      },
    },
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        autoInject: false,
      }),
    ],
    attachStacktrace: true,
    normalizeDepth: 15,
    maxValueLength: 5000,
    maxBreadcrumbs: 150,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    release: globalConfig.versions.pluginVersion,
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

// Supabase
if (globalConfig.env.isSupabaseEnabled)
  initSupabase(globalConfig.urls.databaseUrl, supabaseAnonKey)

// Mistral AI
if (globalConfig.env.isMistralAiEnabled) initMistral(mistralApiKey)

// Bridge Canvas <> UI
window.addEventListener(
  'message',
  (event: MessageEvent) => {
    const pluginEvent = new CustomEvent('platformMessage', {
      detail: event.data,
    })
    window.dispatchEvent(pluginEvent)
  },
  false
)
window.addEventListener('pluginMessage', ((event: MessageEvent) => {
  if (event instanceof CustomEvent && window.parent !== window) {
    const { message, targetOrigin } = event.detail
    parent.postMessage(message, targetOrigin)
  }
}) as EventListener)

// Render
root.render(
  <ConfigProvider
    limits={globalConfig.limits}
    env={globalConfig.env}
    plan={globalConfig.plan}
    dbs={globalConfig.dbs}
    urls={globalConfig.urls}
    versions={globalConfig.versions}
    features={globalConfig.features}
    locales={globalConfig.locales}
    lang={globalConfig.lang}
    fees={globalConfig.fees}
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
