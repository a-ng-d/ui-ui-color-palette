---
name: unoff-create-plugin
description: "Master index for the unoff Figma plugin skill library. Use when building, debugging, or extending a Figma plugin with Preact UI, Canvas bridge, @unoff/ui components, Supabase, Tolgee, Sentry, Mixpanel, Vite build, TypeScript, credits, feature flags, payments, or design implementation. Covers all layers: Canvas, Bridge, UI, Config, and Externals."
---

# Unoff Plugin Skills

## Overview

This collection covers every layer of the **unoff Figma plugin** architecture. Each sub-skill is a self-contained reference document providing patterns, templates, and decisions rules for a specific concern.

**How to use these skills**: when a task falls within a domain below, load the corresponding file with `read_file` to get the full reference before writing or reviewing code.

---

## Bridge

Inter-layer communication between the Preact UI and the Figma Canvas via `sendPluginMessage` / `figma.ui.postMessage`.

| Skill                                                                | When to load                                                                                                                                              |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [bridge/bridge-functions.md](./bridge/bridge-functions.md)           | Creating or reviewing bridge functions in `src/bridges/`, implementing canvas operations called from `loadUI.ts`, or understanding the action map pattern |
| [bridge/communication-pattern.md](./bridge/communication-pattern.md) | Wiring new actions, debugging UI↔Canvas communication, or understanding the `onmessage` routing pattern                                                   |

---

## Canvas

Direct Figma Plugin API usage and data persistence on the canvas side.

| Skill                                                                    | When to load                                                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [canvas/figma-api.md](./canvas/figma-api.md)                             | Writing Canvas-layer code that interacts with the Figma document via `figma.*` calls: node creation, style management, selection, viewport |
| [canvas/data-storage.md](./canvas/data-storage.md)                       | Persisting metadata on nodes (Plugin Data), syncing across plugins (Shared Plugin Data), or storing user preferences (Client Storage)      |
| [canvas/document-generation.md](./canvas/document-generation.md)         | Generating structured plugin output on the canvas using `Tag`, `Paragraph`, and `Signature` components from `src/canvas/`                  |

---

## Config

Build pipeline, runtime configuration, code quality, and system-level concerns.

| Skill                                                  | When to load                                                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [config/global-config.md](./config/global-config.md)   | Adding new config values, understanding what is available via `ConfigContext`, or wiring environment variables               |
| [config/feature-flags.md](./config/feature-flags.md)   | Adding new features, gating features by plan or editor type, or overriding feature state for testing                         |
| [config/credits-system.md](./config/credits-system.md) | Adding feature usage limits, wiring a feature to a credit gate, or implementing the `isReached → isBlocked` pattern          |
| [config/vite-build.md](./config/vite-build.md)         | Modifying the build pipeline, adding Vite plugins, managing environment variables, or understanding dual-bundle architecture |
| [config/code-quality.md](./config/code-quality.md)     | Configuring linting rules, writing Vitest tests for Canvas or UI layers, or setting up CI/CD quality gates                   |

---

## Externals

Third-party integrations and design-to-code workflows.

| Skill                                                            | When to load                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [externals/implement-design.md](./externals/implement-design.md) | Implementing UI from a Figma spec document, generating production code from a Figma URL, or building components with 1:1 visual fidelity |
| [externals/payment-systems.md](./externals/payment-systems.md)   | Choosing a monetization model, integrating Figma built-in payments, or implementing Lemon Squeezy license key flows                      |

---

## UI

All concerns for the Preact UI layer: components, styling, state, services, and runtime behaviour.

| Skill                                                  | When to load                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [ui/component-library.md](./ui/component-library.md)   | Building UI, choosing the right `@unoff/ui` component, or understanding the `FeatureStatus` / `isBlocked` permission pattern            |
| [ui/component-mapping.md](./ui/component-mapping.md)   | Looking up which npm component matches a Figma component, navigating Storybook, or translating a Figma spec into code imports           |
| [ui/component-patterns.md](./ui/component-patterns.md) | Writing new UI components, composing `WithConfig` / `WithTranslation` HOCs, or handling Canvas→UI messages in a component               |
| [ui/css-theming.md](./ui/css-theming.md)               | Styling components, handling light/dark mode via `data-theme` / `data-mode`, managing z-index layers, or resizing the plugin window     |
| [ui/state-management.md](./ui/state-management.md)     | Adding shared Nanostore atoms, managing user preferences across sessions, or syncing state between Canvas and UI                        |
| [ui/app-bootstrap.md](./ui/app-bootstrap.md)           | Modifying initialization order, adding a new service to the startup chain (Canvas or UI side), or debugging startup failures            |
| [ui/external-services.md](./ui/external-services.md)   | Integrating or configuring Supabase, Sentry, Mixpanel, Tolgee, or the Notion CMS Cloudflare Worker                                      |
| [ui/i18n.md](./ui/i18n.md)                             | Adding translations, supporting new languages, or wiring language detection with Tolgee / `createI18n()`                                |
| [ui/error-handling.md](./ui/error-handling.md)         | Handling errors in bridge functions, external service calls, or surfacing errors to the user via `POST_MESSAGE` / Sentry                |
| [ui/accessibility.md](./ui/accessibility.md)           | Building modal dialogs, toasts, or interactive components; reviewing a11y compliance; or understanding focus trapping / portal layering |
| [ui/performance.md](./ui/performance.md)               | Optimizing render cycles, reducing bundle size, or improving startup time                                                               |
| [ui/types-system.md](./ui/types-system.md)             | Adding new types, extending `BaseProps`, defining union types for state machines, or adding new contexts, modals, events, or languages  |

---

## Architecture Quick Reference

```
src/
├── index.ts              # Canvas entry — action map, bridge dispatch
├── global.config.ts      # Central config (see config/global-config)
├── bridges/              # Canvas operations (see bridge/)
│   └── loadUI.ts         # Message router
├── app/
│   ├── components/       # Preact UI components (see ui/)
│   ├── stores/           # Nanostore atoms (see ui/state-management)
│   ├── services/         # External service singletons (see ui/external-services)
│   └── types/            # TypeScript definitions (see ui/types-system)
└── ui.tsx                # UI entry — providers, bootstrap (see ui/app-bootstrap)
```

**Canvas side** → `src/index.ts` + `src/bridges/`  
**UI side** → `src/ui.tsx` + `src/app/`  
**Shared** → `src/global.config.ts` + `src/app/types/`
