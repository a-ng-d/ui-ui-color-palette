# Unoff Skills

This directory contains comprehensive documentation for the plugin architecture, organized by responsibility layer. Currently targeting **Figma** — support for **Penpot**, **Framer**, and **Sketch** is coming soon.

## Key Technical Facts

- **Preact** (not React) — aliased via `preact/compat` at 3 levels (Vite, TSConfig, npm)
- **Nanostores** (not Zustand) — `atom` from `nanostores` + `@nanostores/preact`
- **PureComponent classes** (not functional) — with HOCs `WithConfig`, `WithTranslation`
- **Tolgee** (not custom i18n for UI) — dual system: `@tolgee/react` for UI + `createI18n()` for Canvas
- **Dual Vite build** — `IS_PLUGIN=true` produces IIFE `plugin.js`, default produces single HTML

## Structure

```
unoff-create-plugin/
├── canvas/              # Figma API Layer
│   ├── figma-api.md
│   └── data-storage.md
├── bridge/              # Communication Layer
│   ├── communication-pattern.md
│   └── bridge-functions.md
├── config/              # Configuration & Build Layer
│   ├── global-config.md
│   ├── feature-flags.md
│   ├── credits-system.md
│   ├── vite-build.md
│   └── code-quality.md
├── ui/                  # Preact Application Layer
│   ├── component-library.md
│   ├── component-patterns.md
│   ├── external-services.md
│   ├── state-management.md
│   ├── i18n.md
│   ├── types-system.md
│   ├── error-handling.md
│   ├── css-theming.md
│   ├── accessibility.md
│   ├── performance.md
│   └── app-bootstrap.md
└── externals/           # External Integrations
    ├── implement-design  # Figma spec → code workflow
    └── payment-systems.md
```

## Canvas Layer

**Purpose**: Direct interactions with the Figma Plugin API

### [figma-api.md](./unoff-create-plugin/canvas/figma-api.md)

- Node creation and manipulation
- Styles and variables management
- Selection and viewport operations
- Common patterns and best practices

### [document-generation.md](./unoff-create-plugin/canvas/document-generation.md)

- Composing canvas documents with `Tag`, `Paragraph`, and `Signature`
- Font loading requirements and layout patterns
- Tag variants (indicator, avatar, hyperlink)
- Full document frame composition recipe

### [data-storage.md](./unoff-create-plugin/canvas/data-storage.md)

- Plugin Data (node-level storage)
- Shared Plugin Data (cross-plugin)
- Client Storage (user preferences)
- Data migration strategies

## Bridge Layer

**Purpose**: Message-passing architecture between UI and Canvas

### [communication-pattern.md](./unoff-create-plugin/bridge/communication-pattern.md)

- Architecture overview with diagrams
- Message flow: UI ↔ Canvas via platformMessage/pluginMessage
- Message type conventions
- Request-response patterns

### [bridge-functions.md](./unoff-create-plugin/bridge/bridge-functions.md)

- Pure functions for Figma operations
- loadUI.ts action map pattern
- Bridge check functions (license, trial, consent, etc.)

## Config Layer

**Purpose**: Central configuration, feature flags, build system, and code quality

### [global-config.md](./unoff-create-plugin/config/global-config.md)

- Complete Config type definition
- All sections (limits, env, urls, plan, versions, features, lang, fees)
- Environment variables and service toggles

### [feature-flags.md](./unoff-create-plugin/config/feature-flags.md)

- featuresScheme and Feature type
- FeatureStatus runtime checks
- doSpecificMode() override function
- Adding new features step-by-step

### [credits-system.md](./unoff-create-plugin/config/credits-system.md)

- Credits atom (`$creditsCount`) and `checkCredits.ts` bridge
- Renewal logic (period, version bump to reset all users)
- Wiring features via `limitsMapping` + `feature.limit`
- `isReached($creditsCount.get())` → `isBlocked` prop pattern

### [vite-build.md](./unoff-create-plugin/config/vite-build.md)

- Dual build system (IIFE Canvas + single-file UI)
- Vite plugins (preact, singlefile, Sentry, custom CSS filter)
- Three-layer Preact aliasing
- manifest.json configuration
- ESLint and Prettier settings

### [code-quality.md](./unoff-create-plugin/config/code-quality.md)

- TypeScript strict mode, ESLint, Prettier
- Recommended Vitest setup
- Test examples for each layer
- CI/CD integration guidance

## UI Layer

**Purpose**: Preact application, components, and external services

### [component-library.md](./unoff-create-plugin/ui/component-library.md)

- @unoff/ui and @unoff/utils
- FeatureStatus permission system
- Button, Input, Dropdown, Menu, SemanticMessage components
- CSS layouts and typography

### [component-patterns.md](./unoff-create-plugin/ui/component-patterns.md)

- PureComponent class pattern
- WithConfig and WithTranslation HOCs
- HOC composition order
- BaseProps spread pattern
- platformMessage event handling
- createPortal for modals/toasts

### [external-services.md](./unoff-create-plugin/ui/external-services.md)

- Supabase authentication
- Sentry error monitoring (with replay)
- Mixpanel analytics (EU, cookie-less)
- Notion CMS (announcements, onboarding)
- Service singleton pattern

### [state-management.md](./unoff-create-plugin/ui/state-management.md)

- Component state (PureComponent class)
- Context API (ConfigContext, ThemeContext via HOC)
- Nanostores atoms ($prefix, subscribe, dual update)
- Figma Client Storage sync

### [i18n.md](./unoff-create-plugin/ui/i18n.md)

- Tolgee for UI (TolgeeProvider, useTranslate, WithTranslation)
- createI18n for Canvas (ICU format, pluralization)
- Language detection and suggestion flow

### [types-system.md](./unoff-create-plugin/ui/types-system.md)

- All type files (app, config, events, messages, translations, user)
- BaseProps interface
- Union types for state machines
- RecursiveKeyOf for translation keys
- Adding new contexts, modals, events, languages

### [error-handling.md](./unoff-create-plugin/ui/error-handling.md)

- Action map + try/catch pattern (Canvas and UI)
- Promise .catch() chains for external services
- Sentry production vs dev logger fallback
- POST_MESSAGE user notifications
- NotificationMessage type

### [css-theming.md](./unoff-create-plugin/ui/css-theming.md)

- ThemeContext (data-theme + data-mode attributes)
- unoff-ui CSS modules (layouts, texts)
- Platform-scoped background colors
- CSS custom properties (sizing, color tokens)
- Responsive layout (documentWidth breakpoints)
- Z-index architecture (ui/modal/toast)
- Plugin window resizing

### [accessibility.md](./unoff-create-plugin/ui/accessibility.md)

- `inert` attribute for modal focus trapping
- Portal layering (#app, #modal, #toast)
- Feature component (DOM removal, not hiding)
- unoff-ui component accessibility
- Keyboard interaction patterns
- Internationalization as accessibility
- Notification and consent accessibility

### [performance.md](./unoff-create-plugin/ui/performance.md)

- PureComponent render optimization
- Feature component (DOM removal vs hiding)
- Conditional service initialization
- Service singleton pattern
- Build optimizations (viteSingleFile, CSS stripping, IIFE)
- Sentry replay sampling
- Constructor-time computations
- Sequential LOAD_DATA chain

### [app-bootstrap.md](./unoff-create-plugin/ui/app-bootstrap.md)

- Canvas-side initialization (fonts, i18n, loadUI)
- UI-side initialization (Mixpanel → Sentry → Supabase → Tolgee)
- Provider nesting order
- LOAD_DATA sequential check chain
- Full startup sequence diagram

## Externals Layer

**Purpose**: Integration workflows and external system configuration

### [./unoff-create-plugin/externals/implement-design](./unoff-create-plugin/externals/implement-design)

- Figma spec document → code workflow
- Annotations, MCP server integration, unoff-ui component mapping

### [./unoff-create-plugin/externals/payment-systems.md](./unoff-create-plugin/externals/payment-systems.md)

- Figma built-in payments (`figma.payments` API, all interstitial types)
- Lemon Squeezy license key system (activate / validate / deactivate)
- Comparison table and decision guide
- **⚠️ Must choose one before shipping**

## Quick Navigation

| Need to...                  | Go to                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Create Figma nodes          | [./unoff-create-plugin/canvas/figma-api.md](./unoff-create-plugin/canvas/figma-api.md)                         |
| Generate canvas documents   | [./unoff-create-plugin/canvas/document-generation.md](./unoff-create-plugin/canvas/document-generation.md)     |
| Store data in Figma         | [./unoff-create-plugin/canvas/data-storage.md](./unoff-create-plugin/canvas/data-storage.md)                   |
| Communicate UI ↔ Canvas     | [./unoff-create-plugin/bridge/communication-pattern.md](./unoff-create-plugin/bridge/communication-pattern.md) |
| Understand bridge functions | [./unoff-create-plugin/bridge/bridge-functions.md](./unoff-create-plugin/bridge/bridge-functions.md)           |
| Configure the plugin        | [./unoff-create-plugin/config/global-config.md](./unoff-create-plugin/config/global-config.md)                 |
| Add feature flags           | [./unoff-create-plugin/config/feature-flags.md](./unoff-create-plugin/config/feature-flags.md)                 |
| Understand the build        | [./unoff-create-plugin/config/vite-build.md](./unoff-create-plugin/config/vite-build.md)                       |
| Set up tests / quality      | [./unoff-create-plugin/config/code-quality.md](./unoff-create-plugin/config/code-quality.md)                   |
| Use UI components           | [./unoff-create-plugin/ui/component-library.md](./unoff-create-plugin/ui/component-library.md)                 |
| Write Preact components     | [./unoff-create-plugin/ui/component-patterns.md](./unoff-create-plugin/ui/component-patterns.md)               |
| Integrate services          | [./unoff-create-plugin/ui/external-services.md](./unoff-create-plugin/ui/external-services.md)                 |
| Manage state                | [./unoff-create-plugin/ui/state-management.md](./unoff-create-plugin/ui/state-management.md)                   |
| Add translations            | [./unoff-create-plugin/ui/i18n.md](./unoff-create-plugin/ui/i18n.md)                                           |
| Understand types            | [./unoff-create-plugin/ui/types-system.md](./unoff-create-plugin/ui/types-system.md)                           |
| Handle errors               | [./unoff-create-plugin/ui/error-handling.md](./unoff-create-plugin/ui/error-handling.md)                       |
| Style & theme               | [./unoff-create-plugin/ui/css-theming.md](./unoff-create-plugin/ui/css-theming.md)                             |
| Accessibility               | [./unoff-create-plugin/ui/accessibility.md](./unoff-create-plugin/ui/accessibility.md)                         |
| Optimize performance        | [./unoff-create-plugin/ui/performance.md](./unoff-create-plugin/ui/performance.md)                             |
| Understand startup          | [./unoff-create-plugin/ui/app-bootstrap.md](./unoff-create-plugin/ui/app-bootstrap.md)                         |
| Set up payments             | [./unoff-create-plugin/externals/payment-systems.md](./unoff-create-plugin/externals/payment-systems.md)       |
| Set up credits quota        | [./unoff-create-plugin/config/credits-system.md](./unoff-create-plugin/config/credits-system.md)               |

## Documentation Standards

Each document follows this structure:

1. **Overview** - What the document covers
2. **When to Use** - Use cases and scenarios
3. **Core Concepts** - Key principles and diagrams
4. **Implementation Patterns** - Code examples from actual source
5. **Best Practices** - ✅ Recommended approaches
6. **What to Avoid** - ❌ Anti-patterns

## AI Agent Compatibility

This documentation is optimized for AI coding assistants:

- **Claude** (VS Code, Cursor, Windsurf, Warp)
- **GitHub Copilot**
- **Other AI agents**

The structured format, source-verified examples, and explicit patterns make it easy for AI agents to understand and apply these patterns correctly.
