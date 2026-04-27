---
name: implement-design
description: Translates Figma spec documents into production-ready code with 1:1 visual fidelity. Use when implementing UI from Figma spec documents, when user mentions "implement design", "generate code", "implement component", "build Figma design", provides Figma URLs, or asks to build components matching Figma specs. Requires Figma MCP server connection.
metadata:
  mcp-server: figma, figma-desktop
---

# Implement Design

## Overview

This skill provides a structured workflow for translating Figma **spec documents** into production-ready code with pixel-perfect accuracy. A spec document is a Figma page that serves as the single source of truth for a feature's visual design, component usage, behavior, and content — all conveyed through the design itself and its **annotations**.

The workflow ensures consistent integration with the Figma MCP server, proper use of design tokens, correct interpretation of annotations, and 1:1 visual parity with designs.

## Prerequisites

- Figma MCP server must be connected and accessible
- User must provide a Figma URL in the format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
  - `:fileKey` is the file key
  - `1-2` is the node ID (the specific component or frame to implement)
- **OR** when using `figma-desktop` MCP: User can select a node directly in the Figma desktop app (no URL required)
- Project should have an established design system or component library (preferred)

## Figma Spec Document

### What Is a Spec Document?

A spec document is a dedicated Figma page (or top-level frame) that describes a feature's UI. It contains:

- **The visual layout** — the actual design composition showing how the UI looks
- **Component instances from the Figma library** — linked to `@unoff/ui` via embedded documentation (descriptions, props, Storybook links)
- **Annotations** — metadata attached to specific layers that provide implementation instructions not visible in the static design

### Important: Node IDs Are Not Stable

Spec documents may be **duplicated across files or branches**. When a document is duplicated, every node receives new IDs. Therefore:

- **NEVER hardcode or cache specific node IDs** from a previous session
- **Always parse the URL provided by the user** to extract the current `fileKey` and `nodeId`
- Treat every URL as a fresh entry point — re-fetch design context and metadata each time

## Annotations

Annotations are the primary mechanism for conveying implementation details that cannot be shown visually. They appear in the `get_design_context` output as `data-*-annotations` HTML attributes on the relevant elements.

### Annotation Categories

There are **three categories** of annotations. Always look for all three when processing design context output.

#### 1. Development Annotations (`data-development-annotations`)

Technical implementation specifications — describe **how** a feature should be built.

**Examples from a real spec document:**

- `data-development-annotations="Spec: Average score given by every readability score"` — explains what a computed value represents
- `data-development-annotations="Spec: Generate a document on figma with the set type scale"` — describes what a button action should do
- `data-development-annotations="Spec: Line height at each stop, (using %), converted to px in the preview"` — explains a calculation detail
- `data-development-annotations="Spec: If enabled, round values (using px only)"` — conditional behavior specification
- `data-development-annotations="Spec: Letter spacing at each stop, (using em), converted to px in the preview (read only)"` — describes a read-only computed field

#### 2. Content Annotations (`data-content-annotations`)

Describe **content that is not visible** in the static design — hidden options, dropdown menus, contextual choices, or references to related specs.

**Examples from a real spec document:**

- `data-content-annotations="Options:\n\n1.  Sync with local variables\n2.  Sync with local styles"` — lists dropdown/menu options that are not shown in the static UI
- `data-content-annotations="Additional details to adjust the type scale"` — describes the purpose of a collapsible section
- `data-content-annotations="Idem: https://www.figma.com/design/..."` — cross-references another node in the same or a different document for identical behavior

**Key behavior:** Content annotations often reveal **hidden UI states** (dropdown menus, dialog content, expandable sections). These options must be implemented even though they are not visible in the screenshot.

#### 3. Interaction Annotations (`data-interaction-annotations`)

Describe **user interaction behavior** — what happens when the user interacts with a component.

**Examples from a real spec document:**

- `data-interaction-annotations="Specs: The stops are indexed to their respective value. If moved, the ratio becomes 'Custom' because the factor is no longer related to the line height preset"` — describes a slider's dynamic behavior and its side effects on other UI elements

### How to Process Annotations

1. **Read every `data-*-annotations` attribute** in the `get_design_context` output
2. **Categorize** each annotation (development, content, or interaction)
3. **Implement the behavior described** — annotations are instructions, not suggestions
4. **Do NOT render annotation text in the UI** — annotations are metadata for the developer, not content for the user
5. **Follow cross-references** — when a content annotation contains a Figma link (`https://www.figma.com/design/...`), fetch that node's design context to get the referenced spec

## External UI Library: `unoff-ui`

The Figma designs in this project use an **external component library** (`@unoff/ui`) that is **connected to a Figma library**. This connection is made through **embedded documentation in component descriptions**, not through Code Connect.

### How the Figma-to-Code Link Works

When `get_design_context` returns a component instance from the Figma library, the output includes **rich documentation** embedded in the component description. This documentation provides:

- **Component name and import path** — the exact `@unoff/ui` export to use
- **Props table** — all available props with types, defaults, and descriptions
- **Variants** — available visual variants and their prop values
- **Accessibility guidelines** — ARIA attributes, keyboard navigation, screen reader behavior
- **Storybook link** — direct URL to the component's live documentation at `https://ui.unoff.dev/`

**Example of what `get_design_context` returns for a component:**

```
Component: Button
Description: A versatile button component supporting multiple variants...
Props: variant (primary|secondary|ghost), size (sm|md|lg), disabled, loading...
Storybook: https://ui.unoff.dev/?path=/docs/components-button--docs
Accessibility: Uses native <button>, supports aria-label, keyboard focus...
```

This embedded documentation **is the primary reference** for understanding how to use each component. Always read it before consulting external sources.

### Component Mapping Rules

> For a full Figma name → npm export → Storybook URL reference table, see **[component-mapping](../ui/component-mapping.md)**.

1. **Read the component description** returned by `get_design_context` — it contains props, variants, accessibility guidelines, and Storybook links
2. **Identify the Figma component name** from the output (e.g., `Button`, `FormItem`, `Dropdown`, `SimpleSlider`, `MultipleSlider`, `SingleSelect`, `TextInput`, `ColorInput`, `Knob`, `NumberInput`, `Menu`, `Chip`, `SectionTitle`, `Icon`, etc.)
3. **Match it to the `@unoff/ui` export** — the naming is consistent between Figma and the library (see [component-mapping](../ui/component-mapping.md) for the complete list)
4. **Use the props documented in the description** to configure the component correctly
5. **Consult the Storybook link** from the description for interactive examples and edge cases — local instance at `https://ui.unoff.dev`
6. **Import directly** from `@unoff/ui`:
   ```typescript
   import { Button, FormItem, Dropdown, SimpleSlider, MultipleSlider } from '@unoff/ui'
   ```

### Available Components (non-exhaustive)

- **Layout**: Card, Panel, Section, SectionTitle, Divider, Container, Bar
- **Forms**: Button, FormItem, TextInput, NumberInput, ColorInput, Select, SingleSelect, Checkbox, Radio, Toggle, TextArea, Dropdown
- **Sliders**: SimpleSlider, MultipleSlider, Knob
- **Feedback**: Dialog, Notification, SemanticMessage, Spinner, ProgressBar
- **Navigation**: Tabs, Menu, Dropdown, Bar
- **Display**: Badge, Icon, IconChip, Chip, Tooltip, Tag

### What to Do When a Figma Component Has No `unoff-ui` Match

If a design element does not correspond to any `unoff-ui` component:
1. Build a custom component using project conventions
2. Compose it using `unoff-ui` primitives where possible (e.g., `Button` + `Icon`)
3. Apply `unoff-ui` utility classes (`texts`, `layouts`) for consistent typography and spacing

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Get Node ID

#### Option A: Parse from Figma URL

When the user provides a Figma URL, extract the file key and node ID to pass as arguments to MCP tools.

**URL format:** `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

**Extract:**

- **File key:** `:fileKey` (the segment after `/design/`)
- **Node ID:** `1-2` (the value of the `node-id` query parameter)

**Note:** When using the local desktop MCP (`figma-desktop`), `fileKey` is not passed as a parameter to tool calls. The server automatically uses the currently open file, so only `nodeId` is needed.

**Example:**

- URL: `https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15`
- File key: `kL9xQn2VwM8pYrTb4ZcHjF`
- Node ID: `42-15`

#### Option B: Use Current Selection from Figma Desktop App (figma-desktop MCP only)

When using the `figma-desktop` MCP and the user has NOT provided a URL, the tools automatically use the currently selected node from the open Figma file in the desktop app.

**Note:** Selection-based prompting only works with the `figma-desktop` MCP server. The remote server requires a link to a frame or layer to extract context. The user must have the Figma desktop app open with a node selected.

### Step 2: Get the Spec Document Structure

Start by understanding the overall structure of the spec document.

1. Run `get_metadata(fileKey=":fileKey", nodeId="1-2")` to get the hierarchical node map
2. Identify the main sections (e.g., `Bar`, `Scale`, `Details`, `Actions`) and their child node IDs
3. Run `get_screenshot(fileKey=":fileKey", nodeId="1-2")` for a full visual overview

This gives you a mental model of the feature before diving into implementation details.

### Step 3: Fetch Design Context for Each Section

For each section identified in the metadata, run `get_design_context`:

```
get_design_context(fileKey=":fileKey", nodeId=":sectionNodeId")
```

This provides:

- Layout properties (Auto Layout, constraints, sizing)
- Typography specifications
- Color values and design tokens
- **Component instances with embedded documentation** (props, variants, accessibility, Storybook links)
- **Annotations** (`data-development-annotations`, `data-content-annotations`, `data-interaction-annotations`)
- Spacing and padding values

**Process each section's output:**

1. **Read all component descriptions** — they tell you exactly which `@unoff/ui` components to use and how to configure them
2. **Extract all annotations** — collect every `data-*-annotations` attribute and catalog them by category
3. **Note any cross-references** — content annotations may link to other nodes; fetch those too

**If the response is too large or truncated:**

1. Use the metadata from Step 2 to identify smaller subsections
2. Fetch individual child nodes with `get_design_context(fileKey=":fileKey", nodeId=":childNodeId")`

### Step 4: Download Required Assets

Download any assets (images, icons, SVGs) returned by the Figma MCP server.

**IMPORTANT:** Follow these asset rules:

- If the Figma MCP server returns a `localhost` source for an image or SVG, use that source directly
- DO NOT import or add new icon packages — all assets should come from the Figma payload
- DO NOT use or create placeholders if a `localhost` source is provided
- Assets are served through the Figma MCP server's built-in assets endpoint

### Step 5: Translate to Project Conventions

Translate the Figma output into this project's framework, styles, and conventions.

**Key principles:**

- Treat the Figma MCP output (typically React + Tailwind) as a representation of design and behavior, not as final code style
- **Use the component documentation from `get_design_context`** — read the embedded descriptions, props, and Storybook links to correctly configure each `@unoff/ui` component
- **Map Figma component instances to `@unoff/ui` imports** — the Figma library is connected to this package via embedded documentation
- Replace Tailwind utility classes with `unoff-ui` utility classes (`texts`, `layouts`) or the project's design tokens
- Reuse existing `unoff-ui` components instead of duplicating functionality
- Use the project's color system, typography scale, and spacing tokens consistently
- Respect existing routing, state management, and data-fetch patterns
- When unsure about a component's API, **follow the Storybook link from the component description** or visit https://ui.unoff.dev/

### Step 6: Implement Annotation-Driven Behavior

After building the visual UI, implement all behavior specified by annotations:

1. **Development annotations** → implement the technical specs (computed values, conditional logic, data transformations)
2. **Content annotations** → implement hidden content (dropdown options, menu items, expandable sections, dialog content)
3. **Interaction annotations** → implement user interaction behavior (state changes on drag, side effects between components, dynamic UI updates)

**Critical rules:**

- Annotations describe behavior that is **not visible in the screenshot** — they are the only source for this information
- Every annotation MUST be implemented — they are not optional or advisory
- When a content annotation lists options (e.g., "Options: 1. Sync with local variables 2. Sync with local styles"), those are the actual items to render in the dropdown/menu/select
- When an interaction annotation describes a state change (e.g., "If moved, the ratio becomes 'Custom'"), implement that exact reactive behavior

### Step 7: Achieve 1:1 Visual Parity

Strive for pixel-perfect visual parity with the Figma design.

**Guidelines:**

- Prioritize Figma fidelity to match designs exactly
- Avoid hardcoded values — use design tokens from Figma where available
- When conflicts arise between design system tokens and Figma specs, prefer design system tokens but adjust spacing or sizes minimally to match visuals
- Follow WCAG requirements for accessibility
- Add component documentation as needed

### Step 8: Validate Against Figma

Before marking complete, validate the final UI against the Figma screenshot.

**Validation checklist:**

- [ ] Layout matches (spacing, alignment, sizing)
- [ ] Typography matches (font, size, weight, line height)
- [ ] Colors match exactly
- [ ] All `@unoff/ui` components are correctly imported (not recreated)
- [ ] Component props match the documentation from `get_design_context`
- [ ] All development annotations are implemented
- [ ] All content annotations are implemented (hidden options, dropdown items, etc.)
- [ ] All interaction annotations are implemented (state changes, reactive behavior)
- [ ] Interactive states work as designed (hover, active, disabled)
- [ ] Responsive behavior follows Figma constraints
- [ ] Assets render correctly
- [ ] Accessibility standards met

## Implementation Rules

### Component Organization

- Place UI components in the project's designated design system directory
- Follow the project's component naming conventions
- Avoid inline styles unless truly necessary for dynamic values

### Design System Integration

- **ALWAYS check `@unoff/ui` first** — Figma library components are documented directly in `get_design_context` output
- **Read the embedded component documentation** (props, variants, accessibility) before consulting external sources
- Follow the Storybook links from component descriptions for interactive examples
- Map Figma design tokens to project design tokens
- When a matching component exists in `unoff-ui`, use it directly rather than creating a new one
- Document any new custom components that don't exist in `unoff-ui`

### Annotation Processing

- **Annotations are implementation requirements**, not comments or suggestions
- Parse all three categories: `data-development-annotations`, `data-content-annotations`, `data-interaction-annotations`
- Content annotations may contain **cross-references** to other Figma nodes — always follow these links
- Never render annotation text in the UI
- When annotations conflict with the visual design, annotations take precedence for behavior (visual design takes precedence for appearance)

### Code Quality

- Avoid hardcoded values — extract to constants or design tokens
- Keep components composable and reusable
- Add TypeScript types for component props
- Include JSDoc comments for exported components

## Examples

### Example 1: Implementing a Feature from a Spec Document

User says: "Implement this feature: https://figma.com/design/RDBmy7x5HfkZHpafVqHNWQ/MyPlugin?node-id=3353-235509"

**Actions:**

1. Parse URL to extract fileKey=`RDBmy7x5HfkZHpafVqHNWQ` and nodeId=`3353-235509`
2. Convert `-` to `:` in nodeId → `3353:235509`
3. Run `get_metadata(fileKey="RDBmy7x5HfkZHpafVqHNWQ", nodeId="3353:235509")` to understand the page structure
4. Run `get_screenshot(fileKey="RDBmy7x5HfkZHpafVqHNWQ", nodeId="3353:235509")` for visual reference
5. Identify main sections from metadata (e.g., Bar, Scale settings, Details panel, Actions bar)
6. For each section, run `get_design_context` to fetch components and annotations
7. Read component descriptions — use the documented props and Storybook links to configure `@unoff/ui` imports
8. Extract all annotations:
   - Development: technical specs for computed values, conditional logic
   - Content: hidden dropdown options, expandable section content
   - Interaction: reactive behavior between components
9. Build the feature:
   - Import `@unoff/ui` components (`Button`, `FormItem`, `Dropdown`, `SimpleSlider`, `MultipleSlider`, etc.)
   - Implement visual layout matching the screenshot
   - Implement annotation-driven behavior (hidden options, computed values, state relationships)
10. Validate against screenshot and annotation checklist

**Result:** Complete feature matching the Figma spec — visual design from the screenshot, behavior from the annotations, components from `@unoff/ui`.

### Example 2: Handling a Spec with Cross-References

User says: "Build this panel: https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Dashboard?node-id=10-5"

**Actions:**

1. Parse URL and fetch metadata + screenshot
2. Fetch design context for the panel
3. Find a content annotation with a cross-reference: `data-content-annotations="Idem: https://www.figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Dashboard?node-id=20-8"`
4. Parse the referenced URL and fetch its design context too
5. Apply the referenced spec — "Idem" means the behavior is identical to the referenced node
6. Implement both the visual design and the cross-referenced behavior
7. Validate against both the current node and the referenced node

**Result:** Panel correctly implements behavior defined in a different part of the spec document.

## Best Practices

### Always Start with Metadata

For spec documents, start with `get_metadata` to understand the full structure before fetching individual sections. This prevents missing annotations or components buried in child nodes.

### Read Component Documentation First

The `get_design_context` output contains rich component documentation. Read it thoroughly — it tells you exactly which props to use, which variants are available, and how to handle accessibility. This is more reliable than guessing from the visual design alone.

### Process All Annotations

Annotations are easy to miss in large outputs. Systematically search for `data-development-annotations`, `data-content-annotations`, and `data-interaction-annotations` in every `get_design_context` response.

### Follow Cross-References

Content annotations may contain Figma links to related specs. Always fetch and process these — they often contain critical implementation details not present in the current node.

### Incremental Validation

Validate frequently during implementation, not just at the end. This catches issues early.

### Document Deviations

If you must deviate from the Figma design (e.g., for accessibility or technical constraints), document why in code comments.

### Reuse Over Recreation

Always check `@unoff/ui` and the component descriptions from `get_design_context` before creating new components. The Figma library components are documented directly in the MCP output — if a component exists in the design, it almost certainly exists in the library. Consistency across the codebase is more important than exact Figma replication.

### Design System First

When in doubt, prefer `unoff-ui` components and the project's design system patterns over literal Figma translation.

## Common Issues and Solutions

### Issue: Figma output is truncated

**Cause:** The design is too complex or has too many nested layers to return in a single response.
**Solution:** Use `get_metadata` to get the node structure, then fetch specific sections individually with `get_design_context`.

### Issue: Design doesn't match after implementation

**Cause:** Visual discrepancies between the implemented code and the original Figma design.
**Solution:** Compare side-by-side with the screenshot from Step 2. Check spacing, colors, and typography values in the design context data.

### Issue: Missing hidden UI (dropdowns, menus, dialogs)

**Cause:** Content annotations describe UI elements not visible in the static screenshot.
**Solution:** Search the `get_design_context` output for `data-content-annotations`. These annotations list dropdown options, menu items, dialog content, and expandable section content that must be implemented even though they're not shown in the screenshot.

### Issue: Component props are wrong

**Cause:** The component was configured based on visual appearance rather than the embedded documentation.
**Solution:** Re-read the component description from `get_design_context`. It contains the exact props, variants, and types. Follow the Storybook link for interactive examples.

### Issue: Reactive behavior is missing

**Cause:** Interaction annotations were not processed.
**Solution:** Search for `data-interaction-annotations` in the design context output. These describe state changes, side effects between components, and dynamic UI updates that must be implemented.

### Issue: Assets not loading

**Cause:** The Figma MCP server's assets endpoint is not accessible or the URLs are being modified.
**Solution:** Verify the Figma MCP server's assets endpoint is accessible. The server serves assets at `localhost` URLs. Use these directly without modification.

### Issue: Design token values differ from Figma

**Cause:** The project's design system tokens have different values than those specified in the Figma design.
**Solution:** When project tokens differ from Figma values, prefer project tokens for consistency but adjust spacing/sizing to maintain visual fidelity.

### Issue: Cross-referenced spec is in a different file

**Cause:** A content annotation contains a Figma link to a node in a different file.
**Solution:** Parse the `fileKey` from the cross-reference URL and use it in `get_design_context` calls. The referenced file may require separate metadata fetching.

## Understanding Design Implementation

The Figma spec document workflow establishes a reliable process for translating designs to code:

**For designers:** Spec documents are the single source of truth — annotations ensure that behavior, content, and interaction details are conveyed precisely without ambiguity.
**For developers:** A structured approach that eliminates guesswork — component documentation and annotations provide all the implementation details needed without back-and-forth.
**For teams:** Consistent, high-quality implementations that maintain design system integrity through `@unoff/ui` reuse and annotation-driven behavior.

By following this workflow, you ensure that every Figma spec document is implemented with the same level of care and attention to detail — from visual fidelity to behavioral accuracy.

## Additional Resources

- [unoff-ui Storybook](https://ui.unoff.dev/) — Component documentation, props, variants, and interactive examples
- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP Server Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Figma Variables and Design Tokens](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)