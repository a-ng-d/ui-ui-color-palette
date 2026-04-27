---
name: communication-pattern
description: Message-passing architecture between the UI (Preact) and Canvas (Figma API) layers via sendPluginMessage and figma.ui.postMessage. Use when wiring new actions, debugging UI-Canvas communication, or understanding the onmessage routing pattern.
---

# Communication Pattern: UI ↔ Canvas

## Overview

Figma plugins have a **two-context architecture**:
- **UI Context**: Runs in an iframe, has access to React, DOM, external APIs
- **Canvas Context**: Has access to Figma Plugin API

These contexts communicate through **message passing**.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Context                           │
│  (React App - iframe - /src/app/)                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  React Component                                      │ │
│  │                                                        │ │
│  │  import { sendPluginMessage } from 'utils'            │ │
│  │                                                        │ │
│  │  const handleAction = () => {                         │ │
│  │    sendPluginMessage({                                │ │
│  │      pluginMessage: {                                 │ │
│  │        type: 'CREATE_NODE',                           │ │
│  │        data: { ... }                                  │ │
│  │      }                                                 │ │
│  │    })                                                  │ │
│  │  }                                                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                  │
│                          │ window.postMessage               │
│                          ▼                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Canvas Context                         │
│  (Figma Plugin API - /src/bridges/)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  loadUI.ts - Message Router                          │ │
│  │                                                        │ │
│  │  figma.ui.onmessage = async (msg) => {               │ │
│  │    const actions = {                                  │ │
│  │      CREATE_NODE: async () => {                      │ │
│  │        const result = await createNode(msg.data)     │ │
│  │        figma.ui.postMessage({                        │ │
│  │          type: 'NODE_CREATED',                       │ │
│  │          data: result                                │ │
│  │        })                                             │ │
│  │      }                                                │ │
│  │    }                                                  │ │
│  │    actions[msg.type]?.()                             │ │
│  │  }                                                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                  │
│                          │ figma.ui.postMessage             │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Bridge Functions                                     │ │
│  │  - createNode()                                       │ │
│  │  - updateSelection()                                  │ │
│  │  - saveData()                                         │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        UI Context                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  React Component                                      │ │
│  │                                                        │ │
│  │  useEffect(() => {                                    │ │
│  │    const handler = (event) => {                       │ │
│  │      const msg = event.data.pluginMessage             │ │
│  │      if (msg?.type === 'NODE_CREATED') {              │ │
│  │        // Handle response                             │ │
│  │      }                                                 │ │
│  │    }                                                   │ │
│  │    window.addEventListener('message', handler)        │ │
│  │  }, [])                                                │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

### 1. UI → Canvas (Request)

**File**: `/src/app/utils/pluginMessage.ts`

```typescript
// Centralized message sender
export const sendPluginMessage = (
  payload: {
    pluginMessage: {
      type: string
      data?: any
    }
  },
  targetOrigin: string = '*'
) => {
  const event = new CustomEvent('send-plugin-message', {
    detail: payload
  })
  
  parent.postMessage(payload, targetOrigin)
  window.dispatchEvent(event)
}
```

**Usage in React Component**:

```typescript
import { sendPluginMessage } from '../utils/pluginMessage'

const MyComponent = () => {
  const handleCreateRectangle = () => {
    sendPluginMessage({
      pluginMessage: {
        type: 'CREATE_RECTANGLE',
        data: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          color: { r: 1, g: 0, b: 0 }
        }
      }
    })
  }
  
  return <button onClick={handleCreateRectangle}>Create</button>
}
```

### 2. Canvas Message Router

**File**: `/src/bridges/loadUI.ts`

```typescript
// Central message router
figma.ui.onmessage = async (msg) => {
  // Actions map: maps message types to handler functions
  const actions: { [key: string]: () => void | Promise<void> } = {
    
    // Node creation
    CREATE_RECTANGLE: async () => {
      const rect = await createRectangle(msg.data)
      figma.ui.postMessage({
        type: 'RECTANGLE_CREATED',
        data: { id: rect.id, name: rect.name }
      })
    },
    
    // Selection operations
    GET_SELECTION: () => {
      const selection = figma.currentPage.selection
      figma.ui.postMessage({
        type: 'SELECTION_LOADED',
        data: {
          count: selection.length,
          nodes: selection.map(n => ({ id: n.id, name: n.name, type: n.type }))
        }
      })
    },
    
    // Data operations
    SAVE_PREFERENCES: async () => {
      await figma.clientStorage.setAsync('preferences', msg.data)
      figma.ui.postMessage({
        type: 'PREFERENCES_SAVED',
        data: { success: true }
      })
    },
    
    // Error handling
    HANDLE_ERROR: () => {
      console.error(msg.data.error)
      figma.notify(msg.data.message, { error: true })
    }
  }
  
  // Execute action if it exists
  if (actions[msg.type]) {
    try {
      await actions[msg.type]()
    } catch (error) {
      console.error(`Error handling ${msg.type}:`, error)
      figma.ui.postMessage({
        type: 'ERROR',
        data: {
          originalType: msg.type,
          error: error.message
        }
      })
    }
  } else {
    console.warn(`Unknown message type: ${msg.type}`)
  }
}
```

### 3. Canvas → UI (Response)

**Sending from Canvas**:

```typescript
// In any bridge function or loadUI.ts
figma.ui.postMessage({
  type: 'NODE_CREATED',
  data: {
    id: node.id,
    name: node.name,
    success: true
  }
})
```

**Receiving in UI**:

```typescript
import { useEffect, useState } from 'react'

const MyComponent = () => {
  const [status, setStatus] = useState<string>('idle')
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage
      
      if (!msg) return
      
      // Handle different message types
      switch (msg.type) {
        case 'NODE_CREATED':
          console.log('Node created:', msg.data.id)
          setStatus('success')
          break
          
        case 'SELECTION_LOADED':
          console.log(`${msg.data.count} nodes selected`)
          break
          
        case 'ERROR':
          console.error('Error:', msg.data.error)
          setStatus('error')
          break
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  
  return <div>Status: {status}</div>
}
```

## Message Type Conventions

### Naming Convention

- **UI → Canvas**: `VERB_NOUN` (action to perform)
  - `CREATE_RECTANGLE`
  - `UPDATE_SELECTION`
  - `DELETE_NODES`
  - `LOAD_PREFERENCES`

- **Canvas → UI**: `NOUN_PAST_TENSE` (result of action)
  - `RECTANGLE_CREATED`
  - `SELECTION_UPDATED`
  - `NODES_DELETED`
  - `PREFERENCES_LOADED`

### Message Structure

```typescript
// Request (UI → Canvas)
{
  type: string          // Action identifier
  data?: any           // Optional payload
}

// Response (Canvas → UI)
{
  type: string          // Result identifier
  data?: any           // Result payload
  error?: string       // Error message if failed
}
```

## Common Communication Patterns

### 1. Request-Response Pattern

```typescript
// UI: Request
sendPluginMessage({
  pluginMessage: {
    type: 'GET_NODE_DATA',
    data: { nodeId: '123:456' }
  }
})

// Canvas: Process and respond
GET_NODE_DATA: async () => {
  const node = figma.getNodeById(msg.data.nodeId)
  figma.ui.postMessage({
    type: 'NODE_DATA_LOADED',
    data: node ? {
      id: node.id,
      name: node.name,
      type: node.type
    } : null
  })
}

// UI: Handle response
if (msg.type === 'NODE_DATA_LOADED') {
  setNodeData(msg.data)
}
```

### 2. Fire-and-Forget Pattern

```typescript
// UI: Send notification (no response needed)
sendPluginMessage({
  pluginMessage: {
    type: 'TRACK_EVENT',
    data: { event: 'button_clicked', timestamp: Date.now() }
  }
})

// Canvas: Just process
TRACK_EVENT: () => {
  console.log('Event tracked:', msg.data.event)
  // No response needed
}
```

### 3. Streaming Pattern (Multiple Responses)

```typescript
// UI: Start batch operation
sendPluginMessage({
  pluginMessage: {
    type: 'EXPORT_NODES',
    data: { nodeIds: ['1', '2', '3', '4', '5'] }
  }
})

// Canvas: Send progress updates
EXPORT_NODES: async () => {
  const nodes = msg.data.nodeIds
  
  for (let i = 0; i < nodes.length; i++) {
    await exportNode(nodes[i])
    
    // Send progress
    figma.ui.postMessage({
      type: 'EXPORT_PROGRESS',
      data: {
        current: i + 1,
        total: nodes.length,
        percentage: Math.round(((i + 1) / nodes.length) * 100)
      }
    })
  }
  
  // Send completion
  figma.ui.postMessage({
    type: 'EXPORT_COMPLETE',
    data: { success: true }
  })
}

// UI: Handle progress updates
if (msg.type === 'EXPORT_PROGRESS') {
  setProgress(msg.data.percentage)
}
if (msg.type === 'EXPORT_COMPLETE') {
  setStatus('done')
}
```

### 4. Bidirectional Pattern

```typescript
// Canvas: Notify UI of selection change
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'SELECTION_CHANGED',
    data: {
      count: figma.currentPage.selection.length
    }
  })
})

// UI: Respond to selection change
if (msg.type === 'SELECTION_CHANGED') {
  if (msg.data.count > 0) {
    // Request details about selection
    sendPluginMessage({
      pluginMessage: {
        type: 'GET_SELECTION_DETAILS'
      }
    })
  }
}
```

## TypeScript Types

### Define Message Types

```typescript
// /src/app/types/messages.ts

// UI → Canvas messages
export type UIMessage =
  | { type: 'CREATE_RECTANGLE'; data: RectangleConfig }
  | { type: 'UPDATE_NODE'; data: { nodeId: string; props: any } }
  | { type: 'DELETE_NODES'; data: { nodeIds: string[] } }
  | { type: 'LOAD_PREFERENCES' }
  | { type: 'SAVE_PREFERENCES'; data: UserPreferences }

// Canvas → UI messages
export type CanvasMessage =
  | { type: 'RECTANGLE_CREATED'; data: { id: string; name: string } }
  | { type: 'NODE_UPDATED'; data: { success: boolean } }
  | { type: 'NODES_DELETED'; data: { count: number } }
  | { type: 'PREFERENCES_LOADED'; data: UserPreferences }
  | { type: 'PREFERENCES_SAVED'; data: { success: boolean } }
  | { type: 'ERROR'; data: { error: string; originalType?: string } }

// Helper types
export interface RectangleConfig {
  x: number
  y: number
  width: number
  height: number
  color: RGB
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
}
```

### Type-Safe Message Handling

```typescript
// In loadUI.ts
import type { UIMessage } from '../app/types/messages'

figma.ui.onmessage = async (msg: UIMessage) => {
  // TypeScript knows the structure based on type
  switch (msg.type) {
    case 'CREATE_RECTANGLE':
      // msg.data is typed as RectangleConfig
      const rect = await createRectangle(msg.data)
      break
      
    case 'LOAD_PREFERENCES':
      // No data property expected
      const prefs = await loadPreferences()
      break
  }
}
```

## Error Handling

### Canvas-Side Error Handling

```typescript
// In loadUI.ts
figma.ui.onmessage = async (msg) => {
  const actions: { [key: string]: () => void } = {
    CREATE_NODE: async () => {
      try {
        const node = await createNode(msg.data)
        figma.ui.postMessage({
          type: 'NODE_CREATED',
          data: { id: node.id }
        })
      } catch (error) {
        // Send error to UI
        figma.ui.postMessage({
          type: 'ERROR',
          data: {
            originalType: msg.type,
            error: error.message,
            stack: error.stack
          }
        })
        
        // Also show notification
        figma.notify(error.message, { error: true })
      }
    }
  }
  
  if (actions[msg.type]) {
    await actions[msg.type]()
  }
}
```

### UI-Side Error Handling

```typescript
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage
      
      if (msg?.type === 'ERROR') {
        setError(msg.data.error)
        console.error('Plugin error:', msg.data)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  
  if (error) {
    return <div className="error">{error}</div>
  }
  
  return <div>...</div>
}
```

## Best Practices

### 1. Use Type-Safe Messages

```typescript
// ✅ Define clear message types
type CreateNodeMessage = {
  type: 'CREATE_NODE'
  data: { nodeType: 'RECTANGLE' | 'TEXT'; config: any }
}

// ❌ Avoid loose typing
type Message = {
  type: string
  data: any
}
```

### 2. Centralize Message Handling

```typescript
// ✅ Single source of truth for message routing
// All messages go through loadUI.ts

// ❌ Don't scatter message handlers
// Avoid listening to messages in multiple bridge files
```

### 3. Always Acknowledge Actions

```typescript
// ✅ Send response for every action
CREATE_NODE: async () => {
  const node = await createNode(msg.data)
  figma.ui.postMessage({
    type: 'NODE_CREATED',
    data: { id: node.id }
  })
}

// ❌ Don't leave UI hanging
CREATE_NODE: async () => {
  await createNode(msg.data)
  // No response sent!
}
```

### 4. Handle Edge Cases

```typescript
// ✅ Validate data before processing
CREATE_NODE: async () => {
  if (!msg.data?.config) {
    figma.ui.postMessage({
      type: 'ERROR',
      data: { error: 'Missing configuration' }
    })
    return
  }
  // Process...
}
```

### 5. Use Descriptive Names

```typescript
// ✅ Clear, action-oriented names
sendPluginMessage({
  pluginMessage: {
    type: 'EXPORT_SELECTED_NODES_AS_PNG'
  }
})

// ❌ Vague names
sendPluginMessage({
  pluginMessage: {
    type: 'DO_THING'
  }
})
```

## Debugging

### Log All Messages

```typescript
// In loadUI.ts
figma.ui.onmessage = async (msg) => {
  console.log('📨 Received:', msg.type, msg.data)
  
  // ... handle message
  
  console.log('✅ Processed:', msg.type)
}

// In UI
const handleMessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage
  console.log('📬 UI received:', msg?.type, msg?.data)
}
```

### Track Message Flow

```typescript
// Add unique request IDs
sendPluginMessage({
  pluginMessage: {
    type: 'CREATE_NODE',
    requestId: uid(),
    data: { ... }
  }
})

// Echo back in response
figma.ui.postMessage({
  type: 'NODE_CREATED',
  requestId: msg.requestId,
  data: { ... }
})
```
