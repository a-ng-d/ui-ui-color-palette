---
name: bridge-functions
description: Pure functions for Figma Canvas operations in the bridge layer. Use when creating bridge functions in src/bridges/, implementing canvas operations called from loadUI.ts, or understanding the action map pattern.
---

# Bridge Functions

## Overview

Bridge functions are **pure functions** that interact with the Figma API. They are called from the message router (`loadUI.ts`) and perform specific Canvas operations.

## Principles

1. **Single Responsibility**: Each bridge function does one thing well
2. **Pure Functions**: No side effects, predictable outputs
3. **Type Safety**: Strong TypeScript typing
4. **Error Handling**: Always handle and communicate errors
5. **Async-Aware**: Properly handle async Figma operations

## File Organization

```
/src/bridges/
  loadUI.ts                 # Message router (entry point)
  checks/                   # Validation functions
    checkUserConsent.ts
    checkUserLicense.ts
    checkCredits.ts
    ...
  plans/                    # Subscription management
    enableTrial.ts
    payProPlan.ts
  nodes/                    # Node manipulation (create your own)
    createRectangle.ts
    createFrame.ts
    createComponent.ts
  styles/                   # Style operations
    createColorStyle.ts
    applyTextStyle.ts
  data/                     # Data operations
    savePreferences.ts
    loadPreferences.ts
    saveNodeData.ts
```

## Bridge Function Template

```typescript
// /src/bridges/nodes/createRectangle.ts

import type { RGB } from '../app/types'

export interface CreateRectangleConfig {
  x: number
  y: number
  width: number
  height: number
  color: RGB
  cornerRadius?: number
  name?: string
}

/**
 * Creates a rectangle node with the specified configuration
 * @param config - Rectangle configuration
 * @returns Created rectangle with id and name
 */
export const createRectangle = async (
  config: CreateRectangleConfig
): Promise<{ id: string; name: string }> => {
  // Validate inputs
  if (config.width <= 0 || config.height <= 0) {
    throw new Error('Width and height must be positive')
  }
  
  // Create node
  const rect = figma.createRectangle()
  
  // Configure properties
  rect.x = config.x
  rect.y = config.y
  rect.resize(config.width, config.height)
  rect.fills = [{
    type: 'SOLID',
    color: config.color
  }]
  
  if (config.cornerRadius) {
    rect.cornerRadius = config.cornerRadius
  }
  
  if (config.name) {
    rect.name = config.name
  }
  
  // Add to page
  figma.currentPage.appendChild(rect)
  
  // Return result
  return {
    id: rect.id,
    name: rect.name
  }
}
```

## Common Bridge Patterns

### 1. Node Creation Bridges

```typescript
// /src/bridges/nodes/createFrame.ts

export interface CreateFrameConfig {
  name: string
  width: number
  height: number
  x?: number
  y?: number
  children?: CreateNodeConfig[]
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  padding?: number
  gap?: number
}

export const createFrame = async (
  config: CreateFrameConfig
): Promise<FrameNode> => {
  const frame = figma.createFrame()
  
  frame.name = config.name
  frame.resize(config.width, config.height)
  
  if (config.x !== undefined) frame.x = config.x
  if (config.y !== undefined) frame.y = config.y
  
  // Auto-layout
  if (config.layoutMode) {
    frame.layoutMode = config.layoutMode
    frame.primaryAxisSizingMode = 'AUTO'
    frame.counterAxisSizingMode = 'AUTO'
    
    if (config.padding) {
      frame.paddingLeft = config.padding
      frame.paddingRight = config.padding
      frame.paddingTop = config.padding
      frame.paddingBottom = config.padding
    }
    
    if (config.gap) {
      frame.itemSpacing = config.gap
    }
  }
  
  // Add children
  if (config.children) {
    for (const childConfig of config.children) {
      const child = await createNode(childConfig)
      frame.appendChild(child)
    }
  }
  
  figma.currentPage.appendChild(frame)
  return frame
}
```

### 2. Selection Bridges

```typescript
// /src/bridges/selection/getSelection.ts

export interface SelectionInfo {
  count: number
  nodes: Array<{
    id: string
    name: string
    type: string
  }>
}

export const getSelection = (): SelectionInfo => {
  const selection = figma.currentPage.selection
  
  return {
    count: selection.length,
    nodes: selection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type
    }))
  }
}

// /src/bridges/selection/updateSelection.ts

export const updateSelection = (nodeIds: string[]): boolean => {
  const nodes: SceneNode[] = []
  
  for (const id of nodeIds) {
    const node = figma.getNodeById(id) as SceneNode
    if (node) {
      nodes.push(node)
    }
  }
  
  if (nodes.length === 0) {
    return false
  }
  
  figma.currentPage.selection = nodes
  figma.viewport.scrollAndZoomIntoView(nodes)
  
  return true
}
```

### 3. Style Bridges

```typescript
// /src/bridges/styles/createColorStyle.ts

export interface ColorStyleConfig {
  name: string
  color: RGB
  description?: string
}

export const createColorStyle = (
  config: ColorStyleConfig
): { id: string; name: string } => {
  const style = figma.createPaintStyle()
  
  style.name = config.name
  style.paints = [{
    type: 'SOLID',
    color: config.color
  }]
  
  if (config.description) {
    style.description = config.description
  }
  
  return {
    id: style.id,
    name: style.name
  }
}

// /src/bridges/styles/applyColorStyle.ts

export const applyColorStyle = (
  nodeId: string,
  styleId: string,
  type: 'fill' | 'stroke'
): boolean => {
  const node = figma.getNodeById(nodeId)
  
  if (!node) {
    throw new Error(`Node ${nodeId} not found`)
  }
  
  if (type === 'fill' && 'fillStyleId' in node) {
    node.fillStyleId = styleId
    return true
  }
  
  if (type === 'stroke' && 'strokeStyleId' in node) {
    node.strokeStyleId = styleId
    return true
  }
  
  return false
}
```

### 4. Data Storage Bridges

```typescript
// /src/bridges/data/savePreferences.ts

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
  recentColors: string[]
}

export const savePreferences = async (
  prefs: UserPreferences
): Promise<boolean> => {
  try {
    await figma.clientStorage.setAsync('preferences', prefs)
    return true
  } catch (error) {
    console.error('Failed to save preferences:', error)
    return false
  }
}

// /src/bridges/data/loadPreferences.ts

export const loadPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const prefs = await figma.clientStorage.getAsync('preferences')
    return prefs || null
  } catch (error) {
    console.error('Failed to load preferences:', error)
    return null
  }
}

// /src/bridges/data/saveNodeData.ts

export const saveNodeData = (
  nodeId: string,
  key: string,
  value: any
): boolean => {
  const node = figma.getNodeById(nodeId)
  
  if (!node) {
    return false
  }
  
  const serialized = typeof value === 'string' 
    ? value 
    : JSON.stringify(value)
  
  node.setPluginData(key, serialized)
  return true
}
```

### 5. Validation Bridges (Checks)

```typescript
// /src/bridges/checks/checkUserLicense.ts

export interface LicenseStatus {
  isValid: boolean
  tier: 'free' | 'pro' | 'enterprise'
  expiresAt?: number
}

export const checkUserLicense = async (): Promise<LicenseStatus> => {
  // Check license from clientStorage
  const license = await figma.clientStorage.getAsync('license')
  
  if (!license) {
    return {
      isValid: false,
      tier: 'free'
    }
  }
  
  // Validate expiration
  if (license.expiresAt && license.expiresAt < Date.now()) {
    return {
      isValid: false,
      tier: 'free'
    }
  }
  
  return {
    isValid: true,
    tier: license.tier,
    expiresAt: license.expiresAt
  }
}

// /src/bridges/checks/checkUserConsent.ts

export interface ConsentStatus {
  analytics: boolean
  marketing: boolean
  lastUpdated: number
}

export const checkUserConsent = async (): Promise<ConsentStatus | null> => {
  const consent = await figma.clientStorage.getAsync('consent')
  return consent || null
}
```

### 6. Batch Operations

```typescript
// /src/bridges/batch/batchUpdateNodes.ts

export interface NodeUpdate {
  nodeId: string
  properties: {
    name?: string
    visible?: boolean
    locked?: boolean
  }
}

export const batchUpdateNodes = (
  updates: NodeUpdate[]
): { success: number; failed: number } => {
  let success = 0
  let failed = 0
  
  for (const update of updates) {
    const node = figma.getNodeById(update.nodeId)
    
    if (!node) {
      failed++
      continue
    }
    
    try {
      if (update.properties.name !== undefined) {
        node.name = update.properties.name
      }
      if (update.properties.visible !== undefined) {
        node.visible = update.properties.visible
      }
      if (update.properties.locked !== undefined) {
        node.locked = update.properties.locked
      }
      success++
    } catch (error) {
      failed++
    }
  }
  
  return { success, failed }
}
```

## Integration with loadUI.ts

```typescript
// /src/bridges/loadUI.ts

import { createRectangle } from './nodes/createRectangle'
import { createFrame } from './nodes/createFrame'
import { getSelection, updateSelection } from './selection'
import { savePreferences, loadPreferences } from './data'
import { createColorStyle, applyColorStyle } from './styles'
import { checkUserLicense } from './checks/checkUserLicense'

figma.ui.onmessage = async (msg) => {
  const actions: { [key: string]: () => void | Promise<void> } = {
    
    // Node operations
    CREATE_RECTANGLE: async () => {
      try {
        const result = await createRectangle(msg.data)
        figma.ui.postMessage({
          type: 'RECTANGLE_CREATED',
          data: result
        })
      } catch (error) {
        figma.ui.postMessage({
          type: 'ERROR',
          data: { error: error.message }
        })
      }
    },
    
    CREATE_FRAME: async () => {
      const frame = await createFrame(msg.data)
      figma.ui.postMessage({
        type: 'FRAME_CREATED',
        data: { id: frame.id, name: frame.name }
      })
    },
    
    // Selection operations
    GET_SELECTION: () => {
      const selection = getSelection()
      figma.ui.postMessage({
        type: 'SELECTION_LOADED',
        data: selection
      })
    },
    
    UPDATE_SELECTION: () => {
      const success = updateSelection(msg.data.nodeIds)
      figma.ui.postMessage({
        type: 'SELECTION_UPDATED',
        data: { success }
      })
    },
    
    // Data operations
    SAVE_PREFERENCES: async () => {
      const success = await savePreferences(msg.data)
      figma.ui.postMessage({
        type: 'PREFERENCES_SAVED',
        data: { success }
      })
    },
    
    LOAD_PREFERENCES: async () => {
      const prefs = await loadPreferences()
      figma.ui.postMessage({
        type: 'PREFERENCES_LOADED',
        data: prefs
      })
    },
    
    // Style operations
    CREATE_COLOR_STYLE: () => {
      const style = createColorStyle(msg.data)
      figma.ui.postMessage({
        type: 'COLOR_STYLE_CREATED',
        data: style
      })
    },
    
    APPLY_COLOR_STYLE: () => {
      const success = applyColorStyle(
        msg.data.nodeId,
        msg.data.styleId,
        msg.data.type
      )
      figma.ui.postMessage({
        type: 'COLOR_STYLE_APPLIED',
        data: { success }
      })
    },
    
    // Validation
    CHECK_LICENSE: async () => {
      const license = await checkUserLicense()
      figma.ui.postMessage({
        type: 'LICENSE_CHECKED',
        data: license
      })
    }
  }
  
  if (actions[msg.type]) {
    await actions[msg.type]()
  }
}
```

## Best Practices

### 1. Type Safety

```typescript
// ✅ Strong typing with interfaces
export interface Config {
  name: string
  size: number
}

export const createNode = (config: Config): SceneNode => {
  // Implementation
}

// ❌ Weak typing
export const createNode = (config: any): any => {
  // Implementation
}
```

### 2. Input Validation

```typescript
// ✅ Validate before processing
export const resizeNode = (nodeId: string, width: number, height: number) => {
  if (width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive')
  }
  
  const node = figma.getNodeById(nodeId)
  if (!node) {
    throw new Error(`Node ${nodeId} not found`)
  }
  
  if (!('resize' in node)) {
    throw new Error(`Node ${nodeId} cannot be resized`)
  }
  
  node.resize(width, height)
}
```

### 3. Error Handling

```typescript
// ✅ Catch and communicate errors
export const createText = async (text: string): Promise<TextNode> => {
  try {
    const node = figma.createText()
    await figma.loadFontAsync(node.fontName as FontName)
    node.characters = text
    return node
  } catch (error) {
    console.error('Failed to create text:', error)
    throw new Error(`Text creation failed: ${error.message}`)
  }
}
```

### 4. Return Useful Data

```typescript
// ✅ Return structured data
export const createCard = async (): Promise<{
  id: string
  name: string
  childIds: string[]
}> => {
  const card = figma.createFrame()
  const title = figma.createText()
  const body = figma.createText()
  
  card.appendChild(title)
  card.appendChild(body)
  
  return {
    id: card.id,
    name: card.name,
    childIds: [title.id, body.id]
  }
}

// ❌ Return void when data is useful
export const createCard = async (): Promise<void> => {
  // Creates card but returns nothing
}
```

### 5. Keep Functions Pure

```typescript
// ✅ Pure function - no side effects
export const calculateBounds = (nodes: SceneNode[]): Rectangle => {
  // Pure calculation
  return { x: 0, y: 0, width: 100, height: 100 }
}

// ❌ Impure - modifies global state
let lastCreated: string | null = null
export const createNode = (): SceneNode => {
  const node = figma.createRectangle()
  lastCreated = node.id // Side effect
  return node
}
```

### 6. Document with JSDoc

```typescript
/**
 * Creates a styled button component
 * 
 * @param label - Button text
 * @param variant - Button style variant
 * @param width - Button width in pixels (default: 120)
 * @returns Created button component with instance
 * 
 * @example
 * const button = await createButton('Submit', 'primary', 150)
 * console.log(button.component.id)
 */
export const createButton = async (
  label: string,
  variant: 'primary' | 'secondary',
  width: number = 120
): Promise<{ component: ComponentNode; instance: InstanceNode }> => {
  // Implementation
}
```

## Testing Bridge Functions

```typescript
// Mock Figma API for testing
const mockFigma = {
  createRectangle: () => ({
    id: 'test-id',
    name: 'Rectangle',
    x: 0,
    y: 0,
    resize: jest.fn(),
    fills: []
  }),
  currentPage: {
    appendChild: jest.fn()
  }
}

// Test
describe('createRectangle', () => {
  it('creates rectangle with correct properties', async () => {
    global.figma = mockFigma
    
    const result = await createRectangle({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      color: { r: 1, g: 0, b: 0 }
    })
    
    expect(result.id).toBe('test-id')
    expect(mockFigma.createRectangle().resize).toHaveBeenCalledWith(100, 50)
  })
})
```
