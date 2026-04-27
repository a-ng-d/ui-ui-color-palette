---
name: document-generation
description: Composing structured Figma documents using the Tag, Paragraph, and Signature canvas components from unoff-template-figma. Use when generating plugin output frames with text blocks, labels, and plugin branding on the canvas.
---

# Document Generation on Canvas

## Overview

This document covers how to compose canvas documents using the three primitive components from `src/canvas/`:

| Component     | File             | Purpose                                          |
| ------------- | ---------------- | ------------------------------------------------ |
| `Tag`         | `Tag.ts`         | Pill-shaped label — inline metadata or status    |
| `Paragraph`   | `Paragraph.ts`   | Text block with optional URL auto-linking        |
| `Signature`   | `Signature.ts`   | Plugin branding footer (tagline + logotype)      |

All three emit Figma `FrameNode`s and **must run in Canvas context** — never import them in the Preact UI layer.

---

## Shared Styles

```typescript
import { darkColor, bodyFontFamily, propertyFontFamily } from './styles'
// darkColor         = { r: 0, g: 0.129, b: 0.168 }  (dark teal)
// bodyFontFamily    = 'Lexend'
// propertyFontFamily = 'Martian Mono'
```

### Font Loading (Required)

Both font families must be loaded **before** any component is instantiated.
Always load fonts at the top of your canvas handler:

```typescript
await Promise.all([
  figma.loadFontAsync({ family: 'Lexend', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Martian Mono', style: 'Medium' }),
])
```

---

## Tag

A compact pill used for labels, status badges, and metadata.

### Constructor

```typescript
new Tag({
  name: string           // Figma node name
  content: string        // Text inside the pill
  fontSize?: number      // Default: 8
  fontFamily?: FontFamily // Default: 'Martian Mono'
  backgroundColor?: {
    rgb: { r: number; g: number; b: number }
    alpha: number
  }                      // Default: white at 50% opacity
  url?: string | null    // Default: null — makes text a clickable hyperlink
})
```

### Variants

```typescript
// Simple pill
const tag = new Tag({ name: '_status', content: 'Active' })
parent.appendChild(tag.makeNodeTag())

// Pill with colored dot indicator (gl = [r, g, b, a])
const tag = new Tag({ name: '_status', content: 'Online' })
parent.appendChild(tag.makeNodeTagwithIndicator([0, 0.8, 0.4, 1]))

// Compact version (tighter padding)
parent.appendChild(tag.makeNodeTagwithIndicator([0, 0.8, 0.4, 1], true))

// Pill with avatar image
const image = figma.createImage(bytes)
const tag = new Tag({ name: '_user', content: 'Alice' })
parent.appendChild(tag.makeNodeTagWithAvatar(image))

// Clickable hyperlink pill
const tag = new Tag({
  name: '_link',
  content: 'Visit site',
  url: 'https://example.com',
})
parent.appendChild(tag.makeNodeTag())
```

### Styling defaults

- Background: white at 50% opacity
- Border: dark stroke at 5% opacity
- Corner radius: 16px
- Padding: 4px top/bottom, 8px left/right
- Font: `Martian Mono Medium` at 8px

---

## Paragraph

A text block inside a frosted-glass frame. Use it for body copy, descriptions, or any multi-line text.

### Constructor

```typescript
new Paragraph({
  name: string           // Figma node name
  content: string        // Text content (URLs are auto-linked)
  type: 'FILL' | 'FIXED' // Layout mode (see below)
  width?: number         // Required when type === 'FIXED'
  fontSize?: number      // Default: 12
  fontFamily?: FontFamily // Default: 'Lexend'
})
```

### Layout modes

| Mode    | Behaviour                                                                   |
| ------- | --------------------------------------------------------------------------- |
| `FILL`  | Sets `layoutGrow = 1` on the inner text — expands to fill the parent width  |
| `FIXED` | Resizes the frame to the given `width`; you must supply `width`             |

Always use `FILL` when the Paragraph is placed inside a vertical auto-layout frame:

```typescript
// FILL — stretches to parent width (recommended for document rows)
const para = new Paragraph({
  name: '_description',
  content: 'Some text here. Visit https://example.com for details.',
  type: 'FILL',
})
parent.appendChild(para.node)

// FIXED — specific width (useful for side-by-side columns)
const para = new Paragraph({
  name: '_note',
  content: 'A fixed-width note.',
  type: 'FIXED',
  width: 320,
})
parent.appendChild(para.node)
```

### URL auto-linking

Any `https?://` URL found in `content` is automatically converted to an underlined hyperlink. No extra configuration needed.

### Styling defaults

- Background: white at 50% opacity
- Border: dark stroke at 5% opacity
- Corner radius: 16px
- Padding: 8px all sides
- Font: `Lexend Medium` at 12px, 130% line-height

---

## Signature

A single-use, full-width branding footer. Contains two columns:

- **Left** (`_info`): plugin tagline + plugin name as a hyperlink
- **Right** (`_logotype`): the "palette" SVG logotype at 165×57px

### Usage

```typescript
import Signature from './Signature'

const signature = new Signature()
parent.appendChild(signature.node)
```

### Template placeholders

The component ships with placeholder strings that must be replaced before use:

| Placeholder        | Replace with                           |
| ------------------ | -------------------------------------- |
| `{{ pluginName }}` | The plugin's display name              |
| `{{ pluginSlug }}` | The plugin's URL slug (e.g. `my-tool`) |

Replacements happen at the source level — edit `Signature.ts` once and the values propagate everywhere:

```typescript
// In Signature.ts → makeNodeInfo()
content: "Your PluginName's tagline!"
// and
content: 'PluginName'
url: 'https://my-tool.com'
```

### Layout

- Horizontal auto-layout, `SPACE_BETWEEN`
- Stretches to parent width (`layoutAlign = 'STRETCH'`)
- No background fill

---

## Composing a Document Frame

The standard pattern is a vertical auto-layout frame containing:
1. One or more `Paragraph` components
2. Zero or more `Tag` rows
3. A `Signature` at the bottom

```typescript
import Paragraph from './Paragraph'
import Signature from './Signature'
import Tag from './Tag'

export const createDocument = async (data: {
  title: string
  body: string
  status: string
}) => {
  // 1. Load fonts first
  await Promise.all([
    figma.loadFontAsync({ family: 'Lexend', style: 'Medium' }),
    figma.loadFontAsync({ family: 'Martian Mono', style: 'Medium' }),
  ])

  // 2. Create the outer container
  const doc = figma.createFrame()
  doc.name = 'Document'
  doc.layoutMode = 'VERTICAL'
  doc.layoutSizingHorizontal = 'FIXED'
  doc.resize(480, 100)            // height will HUG after children are added
  doc.layoutSizingVertical = 'HUG'
  doc.paddingTop = 16
  doc.paddingLeft = 16
  doc.paddingBottom = 16
  doc.paddingRight = 16
  doc.itemSpacing = 8
  doc.cornerRadius = 16
  doc.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]

  // 3. Add a status tag row
  const tagRow = figma.createFrame()
  tagRow.name = '_tags'
  tagRow.fills = []
  tagRow.layoutMode = 'HORIZONTAL'
  tagRow.layoutSizingHorizontal = 'FILL'
  tagRow.layoutSizingVertical = 'HUG'
  tagRow.itemSpacing = 4
  tagRow.layoutAlign = 'STRETCH'

  const statusTag = new Tag({ name: '_status', content: data.status })
  tagRow.appendChild(statusTag.makeNodeTagwithIndicator([0, 0.7, 0.4, 1]))
  doc.appendChild(tagRow)

  // 4. Add a title paragraph
  doc.appendChild(
    new Paragraph({
      name: '_title',
      content: data.title,
      type: 'FILL',
      fontSize: 16,
    }).node
  )

  // 5. Add a body paragraph
  doc.appendChild(
    new Paragraph({
      name: '_body',
      content: data.body,
      type: 'FILL',
    }).node
  )

  // 6. Add the signature footer
  doc.appendChild(new Signature().node)

  // 7. Place on canvas and focus viewport
  figma.currentPage.appendChild(doc)
  figma.viewport.scrollAndZoomIntoView([doc])

  return doc
}
```

---

## Tag Row Pattern

When you need several tags side by side, wrap them in a horizontal HUG frame:

```typescript
const tagRow = figma.createFrame()
tagRow.name = '_meta'
tagRow.fills = []
tagRow.layoutMode = 'HORIZONTAL'
tagRow.layoutSizingHorizontal = 'FILL'
tagRow.layoutSizingVertical = 'HUG'
tagRow.layoutAlign = 'STRETCH'
tagRow.itemSpacing = 4

tagRow.appendChild(new Tag({ name: '_version', content: 'v1.0.0' }).makeNodeTag())
tagRow.appendChild(new Tag({ name: '_author', content: 'Alice' }).makeNodeTag())
tagRow.appendChild(
  new Tag({ name: '_status', content: 'Stable', backgroundColor: { rgb: { r: 0.9, g: 1, b: 0.9 }, alpha: 0.8 } }).makeNodeTag()
)

parent.appendChild(tagRow)
```

---

## Best Practices

```typescript
// ✅ Always load both fonts before instantiating any component
await Promise.all([
  figma.loadFontAsync({ family: 'Lexend', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Martian Mono', style: 'Medium' }),
])

// ✅ Use FILL paragraphs inside vertical auto-layout frames
// ✅ Use FIXED paragraphs when you control the width explicitly

// ✅ Append .node (FrameNode) — not the class instance itself
parent.appendChild(new Paragraph({ ... }).node)

// ✅ Append the result of makeNodeTag() / makeNodeTagwithIndicator() etc.
parent.appendChild(new Tag({ ... }).makeNodeTag())

// ❌ Do not instantiate canvas components in the Preact UI layer
// ❌ Do not skip font loading — text operations will throw

// ✅ Add the document to the page, then scroll into view
figma.currentPage.appendChild(doc)
figma.viewport.scrollAndZoomIntoView([doc])
```

---

## Component API Summary

### `Tag`

| Method                                      | Returns    | Notes                                      |
| ------------------------------------------- | ---------- | ------------------------------------------ |
| `makeNodeTag()`                             | `FrameNode`| Basic pill                                 |
| `makeNodeTagwithIndicator(gl, isCompact?)`  | `FrameNode`| Pill + colored dot; `gl` = `[r,g,b,a]`    |
| `makeNodeTagWithAvatar(image?)`             | `FrameNode`| Pill + circular avatar image               |

### `Paragraph`

| Property  | Type        | Notes                              |
| --------- | ----------- | ---------------------------------- |
| `.node`   | `FrameNode` | The outer wrapper — append this    |

### `Signature`

| Property  | Type        | Notes                              |
| --------- | ----------- | ---------------------------------- |
| `.node`   | `FrameNode` | Full-width footer — append this    |
