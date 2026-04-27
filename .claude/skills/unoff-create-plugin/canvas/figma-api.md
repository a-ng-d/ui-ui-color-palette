---
name: figma-api
description: Direct Figma Plugin API usage for node creation, style management, selection, and viewport operations. Use when writing Canvas-layer code that interacts with the Figma document via figma.* calls.
---

# Figma API - Canvas Manipulation

## Overview

This document covers direct interactions with the Figma Plugin API for manipulating nodes, styles, variables, and canvas operations.

## Core Concepts

The **Canvas** layer is where all Figma API calls happen. This is the "backend" of your plugin that has access to the Figma document structure.

### What runs in Canvas context:
- Node creation and manipulation
- Style management
- Variable operations
- Plugin data storage
- Client storage access
- Selection handling

### What CANNOT run in Canvas:
- React components
- DOM manipulation
- External HTTP requests (use UI context instead)

## Node Creation

### Creating Basic Shapes

```typescript
// Create a rectangle
const rect = figma.createRectangle()
rect.x = 100
rect.y = 100
rect.resize(200, 150)
rect.fills = [{
  type: 'SOLID',
  color: { r: 1, g: 0, b: 0 }
}]
figma.currentPage.appendChild(rect)

// Create a text node
const text = figma.createText()
await figma.loadFontAsync(text.fontName as FontName)
text.characters = "Hello World"
text.fontSize = 24
figma.currentPage.appendChild(text)

// Create a frame
const frame = figma.createFrame()
frame.name = "Container"
frame.resize(400, 300)
frame.appendChild(rect) // Add rect inside frame
figma.currentPage.appendChild(frame)
```

### Creating Components

```typescript
// Create a component
const component = figma.createComponent()
component.name = "Button"
component.resize(120, 40)

// Add content to component
const bg = figma.createRectangle()
bg.resize(120, 40)
bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 } }]
component.appendChild(bg)

// Create an instance
const instance = component.createInstance()
instance.x = 200
figma.currentPage.appendChild(instance)
```

## Node Manipulation

### Reading Node Properties

```typescript
// Get selection
const selection = figma.currentPage.selection

// Check node type
if (selection.length > 0) {
  const node = selection[0]
  
  console.log(node.type) // "FRAME", "RECTANGLE", "TEXT", etc.
  console.log(node.name)
  console.log(node.id)
  
  // Check specific types
  if (node.type === "TEXT") {
    console.log(node.characters)
    console.log(node.fontSize)
  }
  
  if ("fills" in node) {
    console.log(node.fills)
  }
}
```

### Modifying Properties

```typescript
// Modify fill
if ("fills" in node) {
  node.fills = [{
    type: 'SOLID',
    color: { r: 0.2, g: 0.8, b: 0.4 }
  }]
}

// Modify stroke
if ("strokes" in node) {
  node.strokes = [{
    type: 'SOLID',
    color: { r: 0, g: 0, b: 0 }
  }]
  node.strokeWeight = 2
}

// Modify corner radius
if ("cornerRadius" in node) {
  node.cornerRadius = 8
}

// Modify effects (shadows, blur)
if ("effects" in node) {
  node.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 4 },
    radius: 8,
    visible: true,
    blendMode: 'NORMAL'
  }]
}
```

### Traversing Node Tree

```typescript
// Walk through all nodes
function traverseNode(node: SceneNode) {
  console.log(node.name, node.type)
  
  if ("children" in node) {
    for (const child of node.children) {
      traverseNode(child)
    }
  }
}

// Start from current page
for (const node of figma.currentPage.children) {
  traverseNode(node)
}

// Find nodes by criteria
const allFrames = figma.currentPage.findAll(node => node.type === "FRAME")
const nodesByName = figma.currentPage.findAll(node => node.name.includes("Button"))

// Find one node
const firstFrame = figma.currentPage.findOne(node => node.type === "FRAME")
```

## Styles

### Creating and Applying Paint Styles

```typescript
// Create a color style
const paintStyle = figma.createPaintStyle()
paintStyle.name = "Primary/Blue"
paintStyle.paints = [{
  type: 'SOLID',
  color: { r: 0, g: 0.5, b: 1 }
}]

// Apply style to a node
if ("fillStyleId" in node) {
  node.fillStyleId = paintStyle.id
}

// Get all paint styles
const allPaintStyles = figma.getLocalPaintStyles()
```

### Creating and Applying Text Styles

```typescript
// Create a text style
const textStyle = figma.createTextStyle()
textStyle.name = "Heading/H1"
textStyle.fontSize = 32
textStyle.fontName = { family: "Inter", style: "Bold" }
textStyle.lineHeight = { value: 40, unit: "PIXELS" }

// Apply to text node
if (node.type === "TEXT") {
  node.textStyleId = textStyle.id
}

// Get all text styles
const allTextStyles = figma.getLocalTextStyles()
```

### Creating Effect Styles

```typescript
// Create shadow style
const effectStyle = figma.createEffectStyle()
effectStyle.name = "Shadow/Medium"
effectStyle.effects = [{
  type: 'DROP_SHADOW',
  color: { r: 0, g: 0, b: 0, a: 0.25 },
  offset: { x: 0, y: 4 },
  radius: 8,
  visible: true,
  blendMode: 'NORMAL'
}]

// Apply to node
if ("effectStyleId" in node) {
  node.effectStyleId = effectStyle.id
}
```

## Variables

### Creating Variables

```typescript
// Create a variable collection
const collection = figma.variables.createVariableCollection("Design Tokens")

// Create a variable
const colorVar = figma.variables.createVariable("primary-color", collection, "COLOR")
colorVar.setValueForMode(collection.defaultModeId, {
  r: 0,
  g: 0.5,
  b: 1
})

// Create number variable
const spacingVar = figma.variables.createVariable("spacing-base", collection, "FLOAT")
spacingVar.setValueForMode(collection.defaultModeId, 8)

// Create string variable
const textVar = figma.variables.createVariable("app-name", collection, "STRING")
textVar.setValueForMode(collection.defaultModeId, "My App")

// Create boolean variable
const flagVar = figma.variables.createVariable("feature-flag", collection, "BOOLEAN")
flagVar.setValueForMode(collection.defaultModeId, true)
```

### Using Variables

```typescript
// Bind variable to fill
if ("fills" in node && node.fills !== figma.mixed) {
  const fills = JSON.parse(JSON.stringify(node.fills))
  fills[0] = figma.variables.setBoundVariableForPaint(fills[0], "color", colorVar)
  node.fills = fills
}

// Get all variables
const allVariables = figma.variables.getLocalVariables()
const allCollections = figma.variables.getLocalVariableCollections()
```

## Selection Management

### Reading Selection

```typescript
// Get current selection
const selection = figma.currentPage.selection

// Check if something is selected
if (selection.length === 0) {
  figma.notify("Please select something")
  return
}

// Get first selected node
const node = selection[0]

// Get all selected nodes
for (const node of selection) {
  console.log(node.name)
}
```

### Modifying Selection

```typescript
// Select a node
figma.currentPage.selection = [node]

// Select multiple nodes
figma.currentPage.selection = [node1, node2, node3]

// Add to selection
figma.currentPage.selection = [...figma.currentPage.selection, newNode]

// Clear selection
figma.currentPage.selection = []
```

## Viewport Operations

### Scrolling and Zooming

```typescript
// Scroll to node
figma.viewport.scrollAndZoomIntoView([node])

// Scroll to multiple nodes
figma.viewport.scrollAndZoomIntoView([node1, node2, node3])

// Get viewport bounds
const bounds = figma.viewport.bounds
console.log(bounds.x, bounds.y, bounds.width, bounds.height)

// Get zoom level
const zoom = figma.viewport.zoom
```

## Plugin Data Storage

### Storing Data on Nodes

```typescript
// Set plugin data on a node
node.setPluginData("myKey", "myValue")

// Set shared plugin data (readable by other plugins)
node.setSharedPluginData("namespace", "key", "value")

// Get plugin data
const value = node.getPluginData("myKey")

// Get all keys
const keys = node.getPluginDataKeys()

// Remove data
node.setPluginData("myKey", "")
```

### Storing Complex Data

```typescript
// Store objects as JSON
const config = {
  color: "#FF0000",
  size: 100,
  enabled: true
}

node.setPluginData("config", JSON.stringify(config))

// Retrieve and parse
const savedConfig = JSON.parse(node.getPluginData("config") || "{}")
```

## Client Storage

### Persistent Storage

```typescript
// Save data (persists across plugin runs)
await figma.clientStorage.setAsync("userPreferences", {
  theme: "dark",
  language: "fr-FR",
  lastUsed: Date.now()
})

// Retrieve data
const preferences = await figma.clientStorage.getAsync("userPreferences")

// Delete data
await figma.clientStorage.deleteAsync("userPreferences")

// Get all keys
const keys = await figma.clientStorage.keysAsync()
```

## Working with Text

### Font Loading

```typescript
// Always load fonts before modifying text
const textNode = figma.createText()

// Load default font
await figma.loadFontAsync({ family: "Inter", style: "Regular" })

// Set text
textNode.characters = "Hello World"

// Load different font
await figma.loadFontAsync({ family: "Roboto", style: "Bold" })
textNode.fontName = { family: "Roboto", style: "Bold" }
```

### Text Styling

```typescript
// Get available fonts
const availableFonts = await figma.listAvailableFontsAsync()

// Set text properties
textNode.fontSize = 24
textNode.fontName = { family: "Inter", style: "Bold" }
textNode.textAlignHorizontal = "CENTER"
textNode.textAlignVertical = "CENTER"
textNode.letterSpacing = { value: 0, unit: "PIXELS" }
textNode.lineHeight = { value: 150, unit: "PERCENT" }
```

## Best Practices

### Performance

```typescript
// ✅ Batch operations
figma.skipInvisibleInstanceChildren = true // Skip hidden nodes

// ✅ Use findOne when you only need one result
const node = figma.currentPage.findOne(n => n.name === "Target")

// ❌ Avoid unnecessary traversals
// Don't traverse entire tree if you can use findAll with specific criteria
```

### Error Handling

```typescript
// ✅ Always check node existence
const node = figma.getNodeById(nodeId)
if (!node) {
  figma.notify("Node not found")
  return
}

// ✅ Check node type before accessing type-specific properties
if (node.type === "TEXT") {
  console.log(node.characters)
}

// ✅ Use type guards
if ("fills" in node) {
  console.log(node.fills)
}
```

### Async Operations

```typescript
// ✅ Always await async Figma operations
await figma.loadFontAsync(fontName)
await figma.clientStorage.setAsync(key, value)

// ✅ Handle async in message handlers
figma.ui.onmessage = async (msg) => {
  if (msg.type === "LOAD_FONTS") {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    figma.ui.postMessage({ type: "FONTS_LOADED" })
  }
}
```

## Common Patterns

### Creating a Card Component

```typescript
export const createCard = async (config: {
  title: string
  description: string
  width: number
  height: number
}) => {
  // Create container frame
  const card = figma.createFrame()
  card.name = "Card"
  card.resize(config.width, config.height)
  card.cornerRadius = 12
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 2 },
    radius: 8,
    visible: true,
    blendMode: 'NORMAL'
  }]
  
  // Add title
  await figma.loadFontAsync({ family: "Inter", style: "Bold" })
  const title = figma.createText()
  title.name = "Title"
  title.characters = config.title
  title.fontSize = 20
  title.fontName = { family: "Inter", style: "Bold" }
  title.x = 16
  title.y = 16
  card.appendChild(title)
  
  // Add description
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })
  const description = figma.createText()
  description.name = "Description"
  description.characters = config.description
  description.fontSize = 14
  description.fontName = { family: "Inter", style: "Regular" }
  description.x = 16
  description.y = 48
  description.resize(config.width - 32, description.height)
  card.appendChild(description)
  
  figma.currentPage.appendChild(card)
  return card
}
```

### Batch Color Updates

```typescript
export const updateColors = (nodes: SceneNode[], newColor: RGB) => {
  for (const node of nodes) {
    if ("fills" in node && node.fills !== figma.mixed) {
      const fills = JSON.parse(JSON.stringify(node.fills))
      if (fills[0]?.type === 'SOLID') {
        fills[0].color = newColor
        node.fills = fills
      }
    }
  }
}
```

## Resources

- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Figma Plugin API Reference](https://www.figma.com/plugin-docs/api/api-reference/)
- [Figma Community Plugins](https://www.figma.com/community/plugins)
