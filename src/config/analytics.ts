import * as Sentry from '@sentry/react'
import mixpanel from 'mixpanel-figma'
import { isDev } from '../config'

interface AnalyticsConfig {
  sentry?: {
    dsn: string
    colorScheme?: 'light' | 'dark' | 'system'
  }
  mixpanel?: {
    token: string
  }
}

export const initializeAnalytics = (config?: AnalyticsConfig) => {
  if (config?.mixpanel?.token)
    mixpanel.init(config.mixpanel.token, {
      debug: isDev,
      disable_persistence: true,
      disable_cookie: true,
      opt_out_tracking_by_default: !config.mixpanel.token,
    })

  if (config?.sentry?.dsn)
    Sentry.init({
      dsn: config.sentry.dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
          colorScheme: config.sentry.colorScheme ?? 'system',
          autoInject: false,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
}
