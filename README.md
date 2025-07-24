# UI for UI Color Palette

A unified UI component library for color palette functionality across multiple design platforms. This project serves as a common UI foundation that adapts to different platforms (Figma, Penpot, Sketch) while maintaining a consistent experience.

## Project Description

This project implements a color palette plugin that works across different design platforms. It uses a shared UI codebase with platform-specific adaptations to ensure consistent functionality across:

- Figma (light/dark modes)
- Penpot (light/dark modes)
- Sketch (light/dark modes)
- Development environments

The architecture is built around a modular approach with shared core components and platform-specific bridges to handle the unique requirements of each design tool.

## Dependencies

### External Packages

The project relies on several external packages and modules:

- **@a_ng_d/figmug-ui**: UI components library
- **@a_ng_d/figmug-utils**: Utility functions
- **@a_ng_d/utils-ui-color-palette**: Color palette specific utilities
- **@supabase/supabase-js**: Backend database integration
- **chroma-js**: Color manipulation library
- **JSZip**: File compression for exports
- **Mixpanel**: Analytics tracking
- **Preact**: Lightweight React alternative

### Workspace Packages

The project includes several workspace packages:

- **announcements-yelbolt-worker**: Worker service for announcements
- **auth-yelbolt-worker**: Worker service for authentication
- **auth-yelbolt**: Authentication service including UI components
  - **ideas-spark-booth**: Ideas platform module
  - **ui-color-palette**: Color palette UI module

## Development Setup

### Prerequisites

- Node.js (latest LTS version recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/a-ng-d/ui-ui-color-palette.git
cd ui-ui-color-palette
```

2. Install dependencies:
```bash
npm install
```

3. Install workspace packages:
```bash
npm run install:packages
```

### Available Commands

#### Package Management

```bash
# Install dependencies for all workspaces
npm run install:packages

# Update submodules
npm run update:packages

# Update Figmug UI and utils
npm run update:figmug

# Update color palette utils
npm run update:uicp
```

#### Starting Services

```bash
# Start announcements worker (port 8888)
npm run start:announcements

# Start authentication service
npm run start:auth

# Start all package services
npm run start:packages
```

#### Platform Development

```bash
# Figma - Dark Mode (Figma editor)
npm run start:figma:dark:figma

# Figma - Light Mode (Figma editor)
npm run start:figma:light:figma

# Figma - Dark Mode (Development editor)
npm run start:figma:dark:dev

# Figma - Light Mode (Development editor)
npm run start:figma:light:dev

# Penpot - Dark Mode (Penpot editor)
npm run start:penpot:dark:penpot

# Penpot - Light Mode (Penpot editor)
npm run start:penpot:light:penpot

# Sketch - Dark Mode (Sketch editor)
npm run start:sketch:dark:sketch

# Sketch - Light Mode (Sketch editor)
npm run start:sketch:light:sketch
```

#### Code Quality

```bash
# Type checking
npm run typecheck
npm run typecheck:watch

# Linting
npm run lint
npm run lint:watch

# Formatting
npm run format
```

## Project Structure

- `/src`: Main source code
  - `/bridges`: Platform-specific bridge code
  - `/config`: Configuration context
  - `/content`: Localization and media assets
  - `/external`: External service integrations
  - `/stores`: State management
  - `/types`: TypeScript type definitions
  - `/ui`: UI components and modules
  - `/utils`: Utility functions

## License

MIT © Aurélien Grimaud