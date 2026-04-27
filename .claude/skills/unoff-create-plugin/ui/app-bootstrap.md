---
name: app-bootstrap
description: Full startup sequence for Canvas (fonts, i18n, loadUI) and UI (Mixpanel → Sentry → Supabase → Tolgee) sides. Use when modifying initialization order, adding a new service to the startup chain, or debugging startup failures.
---

# App Bootstrap & Initialization

## Overview

The plugin has two independent initialization sequences — one for each side of the Figma plugin sandbox:

1. **Canvas side** (`/src/index.ts`) — Runs in the Figma Plugin API sandbox (no DOM)
2. **UI side** (`/src/app/index.tsx`) — Runs in the iframe (DOM, Preact, external services)

Both sides communicate through a **platformMessage** bridge established during UI initialization.

## Canvas Side Initialization

**Entry point**: `/src/index.ts`

```typescript
import { createI18n } from './utils/i18n'
import globalConfig from './global.config'
import loadUI from './bridges/loadUI'
import checkTrialStatus from './bridges/checks/checkTrialStatus'
import fr_FR from './app/content/translations/fr-FR.json'
import en_US from './app/content/translations/en-US.json'

// 1. Pre-load fonts (async, non-blocking)
figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
figma.loadFontAsync({ family: 'Martian Mono', style: 'Medium' })
figma.loadFontAsync({ family: 'Lexend', style: 'Medium' })

// 2. Canvas-side i18n placeholder
export let tolgee: ReturnType<typeof createI18n>

// 3. Plugin run handler
figma.on('run', async () => {
  // Initialize Canvas-side i18n
  tolgee = createI18n(
    { 'fr-FR': fr_FR, 'en-US': en_US },
    globalConfig.lang
  )

  // Register selection change listener
  figma.on('selectionchange', async () => await checkTrialStatus())

  // Show UI and start message listener
  loadUI()
})
```

### Canvas Initialization Sequence

```
figma.loadFontAsync() (4 fonts, non-blocking)
    ↓
figma.on('run')
    ├── createI18n() - Canvas-side translations
    ├── figma.on('selectionchange') → checkTrialStatus()
    └── loadUI()
         ├── figma.clientStorage.getAsync('plugin_window_width/height')
         ├── figma.showUI(__html__, { width, height, title, themeColors })
         └── figma.ui.onmessage = async (msg) => { ... }
              └── Waits for LOAD_DATA from UI
```

## loadUI() — Canvas Message Handler

**File**: `/src/bridges/loadUI.ts`

```typescript
const loadUI = async () => {
  // Restore saved window size or use defaults
  const windowSize = {
    width: (await figma.clientStorage.getAsync('plugin_window_width'))
      ?? globalConfig.limits.width,
    height: (await figma.clientStorage.getAsync('plugin_window_height'))
      ?? globalConfig.limits.height,
  }

  // Show the UI iframe
  figma.showUI(__html__, {
    width: windowSize.width,
    height: windowSize.height,
    title: '{{ pluginName }}',
    themeColors: true,
  })

  // Register Canvas-side message handler
  figma.ui.onmessage = async (msg) => {
    const path = msg

    const actions: { [key: string]: () => void } = {
      LOAD_DATA: async () => {
        // Send user authentication data
        figma.ui.postMessage({
          type: 'CHECK_USER_AUTHENTICATION',
          data: {
            id: figma.currentUser?.id,
            fullName: figma.currentUser?.name,
            avatar: figma.currentUser?.photoUrl,
            accessToken: await figma.clientStorage.getAsync('supabase_access_token'),
            refreshToken: await figma.clientStorage.getAsync('supabase_refresh_token'),
          },
        })

        // Trigger announcements check
        figma.ui.postMessage({ type: 'CHECK_ANNOUNCEMENTS_VERSION' })

        // Sequential check chain
        checkUserConsent(path.data.userConsent)
          .then(() => checkEditor())
          .then(() => checkTrialStatus())
          .then(() => checkCredits())
          .then(() => checkUserLicense())
          .then(() => checkUserPreferences())
      },

      RESIZE_UI: async () => {
        await figma.clientStorage.setAsync('plugin_window_width', path.data.width)
        await figma.clientStorage.setAsync('plugin_window_height', path.data.height)
        figma.ui.resize(path.data.width, path.data.height)
      },

      CHECK_ANNOUNCEMENTS_STATUS: () =>
        checkAnnouncementsStatus(path.data.version),

      UPDATE_LANGUAGE: async () => {
        await figma.clientStorage.setAsync('user_language', path.data.lang)
        tolgee.changeLanguage(path.data.lang)
      },

      SET_ITEMS: () => {
        path.items.forEach(async (item: { key: string; value: unknown }) => {
          if (typeof item.value === 'object')
            figma.clientStorage.setAsync(item.key, JSON.stringify(item.value))
          else if (item.value === 'true' || item.value === 'false')
            figma.clientStorage.setAsync(item.key, item.value === 'true')
          else
            figma.clientStorage.setAsync(item.key, item.value as string)
        })
      },

      GET_ITEMS: async () =>
        path.items.map(async (item: string) => {
          const value = await figma.clientStorage.getAsync(item)
          if (value && typeof value === 'string')
            figma.ui.postMessage({
              type: `GET_ITEM_${item.toUpperCase()}`,
              data: { value },
            })
        }),

      DELETE_ITEMS: () =>
        path.items.forEach(async (item: string) =>
          figma.clientStorage.setAsync(item, '')
        ),

      OPEN_IN_BROWSER: () => figma.openExternal(path.data.url),

      // Trial / Pro plan handlers
      GET_TRIAL: async () => figma.ui.postMessage({ type: 'GET_TRIAL' }),
      ENABLE_TRIAL: async () => {
        enableTrial(path.data.trialTime, path.data.trialVersion)
          .then(() => checkTrialStatus())
      },
      GET_PRO: async () => figma.ui.postMessage({
        type: 'GET_PRICING',
        data: { plans: ['PLAN_A', 'PLAN_B', 'ACTIVATE'] },
      }),
      GO_TO_CHECKOUT: async () => payProPlan(),
      ENABLE_PRO_PLAN: async () =>
        figma.ui.postMessage({ type: 'ENABLE_PRO_PLAN' }),
      LEAVE_PRO_PLAN: async () => {
        figma.ui.postMessage({ type: 'LEAVE_PRO_PLAN' })
        checkTrialStatus()
      },
      WELCOME_TO_PRO: async () =>
        figma.ui.postMessage({ type: 'WELCOME_TO_PRO' }),

      SIGN_OUT: () => figma.ui.postMessage({
        type: 'SIGN_OUT',
        data: { connectionStatus: 'UNCONNECTED', fullName: '', avatar: '', id: undefined },
      }),

      DEFAULT: () => null,
    }

    try {
      return actions[path.type]?.()
    } catch {
      return actions['DEFAULT']?.()
    }
  }
}
```

### LOAD_DATA Check Chain

When the UI sends `LOAD_DATA`, the Canvas executes this sequential check chain:

```
LOAD_DATA received
    ├── POST: CHECK_USER_AUTHENTICATION (user id, name, avatar, tokens)
    ├── POST: CHECK_ANNOUNCEMENTS_VERSION
    └── Sequential chain:
        checkUserConsent()
            → checkEditor()
                → checkTrialStatus()
                    → checkCredits()
                        → checkUserLicense()
                            → checkUserPreferences()
```

Each check function reads from `figma.clientStorage` and posts a message back to the UI with the result. The UI's `handleMessage` updates state accordingly.

## UI Side Initialization

**Entry point**: `/src/app/index.tsx`

```typescript
import { createRoot } from 'react-dom/client'
import mixpanel from 'mixpanel-figma'
import { TolgeeProvider } from '@tolgee/react'
import * as Sentry from '@sentry/react'
import globalConfig from '../global.config'
import App from './ui/App'
import { initTolgee } from './external/translation'
import { initMixpanel, setEditor, setMixpanelEnv } from './external/tracking/client'
import { initSentry } from './external/monitoring'
import { initSupabase } from './external/auth'
import { ThemeProvider } from './config/ThemeContext'
import { ConfigProvider } from './config/ConfigContext'

const container = document.getElementById('app')
const root = createRoot(container)
```

### UI Initialization Sequence

```
1. Mixpanel Init (if enabled)
    ↓
2. Sentry Init (if enabled, not dev)
    ↓
3. Supabase Init (if enabled)
    ↓
4. Tolgee Init (always)
    ↓
5. Bridge Setup
    ↓
6. Render
```

### Step 1: Mixpanel

```typescript
if (globalConfig.env.isMixpanelEnabled && mixpanelToken !== undefined) {
  mixpanel.init(mixpanelToken, {
    api_host: 'https://api-eu.mixpanel.com',  // EU data residency
    debug: globalConfig.env.isDev,
    disable_persistence: true,                  // No localStorage
    disable_cookie: true,                       // Cookie-less tracking
    opt_out_tracking_by_default: true,          // Requires opt-in
  })
  mixpanel.opt_in_tracking()
  setMixpanelEnv(import.meta.env.MODE)
  initMixpanel(mixpanel)
  setEditor(globalConfig.env.editor)
}
```

### Step 2: Sentry

```typescript
if (globalConfig.env.isSentryEnabled && !globalConfig.env.isDev && sentryDsn !== undefined) {
  Sentry.init({
    dsn: sentryDsn,
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
      Sentry.feedbackIntegration({ colorScheme: 'system', autoInject: false }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    release: globalConfig.versions.pluginVersion,
  })
  initSentry(Sentry)
} else {
  // Dev logger fallback
  (window as any).Sentry = {
    captureException: (error: Error) => console.error(error),
    captureMessage: (message: string) => console.info(message),
  }
}
```

### Step 3: Supabase

```typescript
if (globalConfig.env.isSupabaseEnabled && supabaseAnonKey !== undefined)
  initSupabase(globalConfig.urls.databaseUrl, supabaseAnonKey)
```

### Step 4: Tolgee

```typescript
const tolgee = initTolgee(tolgeeUrl, tolgeeApiKey, globalConfig.lang, {
  'en-US': en_US,
  'fr-FR': fr_FR,
})
```

### Step 5: Bridge Setup (platformMessage)

This is the critical bridge that connects Canvas messages to the UI:

```typescript
// Canvas → UI: Convert raw postMessage to CustomEvent
window.addEventListener(
  'message',
  (event: MessageEvent) => {
    const pluginEvent = new CustomEvent('platformMessage', {
      detail: event.data.pluginMessage,
    })
    window.dispatchEvent(pluginEvent)
  },
  false
)

// UI → Canvas: Convert CustomEvent to parent.postMessage
window.addEventListener('pluginMessage', ((event: MessageEvent) => {
  if (event instanceof CustomEvent && window.parent !== window) {
    const { message, targetOrigin } = event.detail
    parent.postMessage(message, targetOrigin)
  }
}) as EventListener)
```

This creates a bidirectional bridge:
- **Inbound** (Canvas → UI): `figma.ui.postMessage(data)` → `window 'message'` → `CustomEvent('platformMessage')` → `App.handleMessage()`
- **Outbound** (UI → Canvas): `sendPluginMessage(data)` → `CustomEvent('pluginMessage')` → `parent.postMessage(data)` → `figma.ui.onmessage`

### Step 6: Render

```typescript
tolgee?.run().then(() => {
  root.render(
    <TolgeeProvider tolgee={tolgee} fallback="Loading...">
      <ConfigProvider
        limits={globalConfig.limits}
        env={globalConfig.env}
        information={globalConfig.information}
        plan={globalConfig.plan}
        dbs={globalConfig.dbs}
        urls={globalConfig.urls}
        versions={globalConfig.versions}
        features={globalConfig.features}
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
    </TolgeeProvider>
  )
})
```

Provider nesting order (outermost → innermost):
1. **TolgeeProvider** — Translation context
2. **ConfigProvider** — Global config context
3. **ThemeProvider** — Theme/mode context
4. **App** — Root component

## App.tsx componentDidMount

After render, `App.tsx`'s `componentDidMount` triggers the data loading:

```typescript
componentDidMount = () => {
  // Subscribe to nanostores
  this.subsscribeSuggestedLanguage = $isSuggestedLanguageDisplayed.subscribe(...)
  this.subscribeUserConsent = $userConsent.subscribe(...)
  this.subscribeCreditCount = $creditsCount.subscribe(...)

  // Set initial consent state
  this.setState({ userConsent: $userConsent.get() })

  // Setup Supabase auth state listener
  if (getSupabase() !== null && this.props.config.env.isSupabaseEnabled)
    getSupabase()?.auth.onAuthStateChange(...)

  // Listen for Canvas messages
  window.addEventListener('platformMessage', this.handleMessage as EventListener)
  window.addEventListener('resize', this.handleResize)
}
```

The UI then sends `LOAD_DATA` to the Canvas (triggered by the first platformMessage or explicitly), which starts the LOAD_DATA check chain. As each check completes, the Canvas posts messages back, and `handleMessage` updates state, eventually setting `isLoaded: true` and rendering the full UI.

## Full Startup Sequence Diagram

```
┌─────── Canvas ──────────┐    ┌──────── UI ────────────────┐
│                         │    │                             │
│ loadFontAsync() ×4      │    │                             │
│ figma.on('run')         │    │                             │
│   createI18n()          │    │                             │
│   loadUI()              │    │                             │
│     figma.showUI()  ────┼───►│ iframe loads                │
│     onmessage setup     │    │ Mixpanel.init()             │
│                         │    │ Sentry.init()               │
│                         │    │ Supabase.init()             │
│                         │    │ Tolgee.init()               │
│                         │    │ Bridge setup                │
│                         │    │ tolgee.run().then(render())  │
│                         │    │ App.componentDidMount()     │
│                         │    │   subscribe nanostores      │
│                         │    │   auth state listener       │
│                         │    │   addEventListener(platform)│
│                  ◄──────┼────│   LOAD_DATA ───────────►    │
│ LOAD_DATA handler       │    │                             │
│   POST: AUTH_DATA  ─────┼───►│ handleMessage(AUTH_DATA)    │
│   POST: ANNOUNCEMENTS ──┼───►│ handleMessage(ANNOUNCE.)   │
│   checkUserConsent() ───┼───►│ handleMessage(CONSENT)     │
│   checkEditor() ────────┼───►│ handleMessage(EDITOR)      │
│   checkTrialStatus() ───┼───►│ handleMessage(TRIAL)       │
│   checkCredits() ───────┼───►│ handleMessage(CREDITS)     │
│   checkUserLicense() ───┼───►│ handleMessage(LICENSE)     │
│   checkUserPreferences()┼───►│ handleMessage(PREFS)       │
│                         │    │   setState({isLoaded: true})│
│                         │    │   Full UI renders           │
└─────────────────────────┘    └─────────────────────────────┘
```

## HTML Structure

**File**: `/index.html`

```html
<div id="app"></div>    <!-- Main app root (Preact renders here) -->
<div id="modal"></div>   <!-- Portal target for modals -->
<div id="toast"></div>   <!-- Portal target for notifications -->
```

## Vite Build Configuration

The plugin uses a dual build:

- **Canvas** (`src/index.ts`): Built as IIFE (Immediately Invoked Function Expression) for the Figma sandbox
- **UI** (`src/app/index.tsx`): Built as a single HTML file via `viteSingleFile()` for the iframe

Both builds share `globalConfig` but run in completely separate JavaScript contexts.

## Best Practices

### 1. Guard External Service Init

```typescript
// ✅ Check enabled flag AND env variable existence
if (globalConfig.env.isMixpanelEnabled && mixpanelToken !== undefined) {
  mixpanel.init(mixpanelToken, { ... })
}

// ❌ Init without checking
mixpanel.init(mixpanelToken, { ... })  // Crashes if token undefined
```

### 2. Sequential Check Chain Ordering

The LOAD_DATA checks must be sequential because later checks depend on earlier ones:
- `checkEditor()` sets the editor, which affects feature availability
- `checkTrialStatus()` depends on subscription state
- `checkUserPreferences()` must come last (triggers `isLoaded: true`)

### 3. Always Clean Up in componentWillUnmount

```typescript
componentWillUnmount = () => {
  if (this.subsscribeSuggestedLanguage) this.subsscribeSuggestedLanguage()
  if (this.subscribeUserConsent) this.subscribeUserConsent()
  if (this.subscribeCreditCount) this.subscribeCreditCount()
  window.removeEventListener('platformMessage', this.handleMessage as EventListener)
  window.removeEventListener('resize', this.handleResize)
}
```

### 4. Loading State

The app shows a spinner until `isLoaded` is `true`. This only happens after `checkUserPreferences()` completes (with a 2-second delay):

```typescript
const checkUserPreferences = () => {
  setTimeout(() => this.setState({ isLoaded: true }), 2000)
  // ...
}
```

Don't render data-dependent UI before `isLoaded` is `true`.
