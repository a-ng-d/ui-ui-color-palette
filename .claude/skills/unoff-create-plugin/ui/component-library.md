---
name: component-library
description: Reference for @unoff/ui components (Bar, Button, Input, Dropdown, Menu, ActionsList, SegmentedControl, SemanticMessage, etc.) and @unoff/utils (FeatureStatus, doClassnames). Use when building UI, choosing the right component, or understanding the FeatureStatus permission and isBlocked pattern.
---

# UI Component Library (@unoff/ui)

## Overview

The plugin uses `@unoff/ui` as its primary UI component library. This library provides pre-built, styled, and accessible components specifically designed for Figma plugins.

**Companion library**: `@unoff/utils` provides utility functions and TypeScript types.

**Local source**: The full library source (components, types, styles) is available locally in `node_modules/@unoff/ui/`. Consult the `.d.ts` type definitions there to verify prop names, types, and signatures when the documentation or Storybook is insufficient.

## Installation

```bash
npm install @unoff/ui @unoff/utils
```

## Core Imports

```typescript
// Utilities
import { doClassnames, FeatureStatus } from '@unoff/utils'

// Components
import {
  ActionsList,
  Bar,
  Button,
  Card,
  Chip,
  Consent,
  ConsentConfiguration,
  Dialog,
  Dropdown,
  Feature,
  FormItem,
  Icon,
  IconChip,
  Input,
  Layout,
  List,
  Menu,
  Notification,
  Section,
  SectionTitle,
  SegmentedControl,
  SemanticMessage,
  SimpleItem,
  SimpleSlider,
  SortableList,
  Tabs,
  Tooltip,
  layouts,
  texts,
} from '@unoff/ui'
```

## FeatureStatus - Permission Management

### Purpose

`FeatureStatus` manages feature access based on user subscription level, editor type, and service context.

### Implementation Pattern

```typescript
import { FeatureStatus } from '@unoff/utils'
import type { PlanStatus, ConfigContextType, Service, Editor } from '../types'

class MyComponent extends React.Component {
  // Define features as a static method
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    EXPORT_PNG: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_PNG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    
    BATCH_EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'BATCH_EXPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    
    ADVANCED_SETTINGS: new FeatureStatus({
      features: config.features,
      featureName: 'ADVANCED_SETTINGS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })
  
  render() {
    const features = MyComponent.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
    
    return (
      <div>
        {/* Use feature checks */}
        {features.EXPORT_PNG.isActive() && (
          <Button label="Export" />
        )}
      </div>
    )
  }
}
```

### FeatureStatus Methods

```typescript
const feature = new FeatureStatus({ ... })

// Check if feature is active (enabled for user's plan)
feature.isActive(): boolean

// Check if feature is blocked (user needs upgrade)
feature.isBlocked(): boolean

// Check if usage limit is reached
feature.isReached(currentCount: number): boolean

// Check if feature has "new" badge
feature.isNew(): boolean
```

## Components

### Button

```typescript
<Button
  type="primary" | "secondary" | "tertiary"
  label="Click me"
  feature="FEATURE_NAME"
  isBlocked={features.MY_FEATURE.isBlocked()}
  isNew={features.MY_FEATURE.isNew()}
  isDisabled={false}
  isLoading={false}
  warning={{
    label: "This action cannot be undone",
    pin: "TOP" | "BOTTOM",
    type: "SINGLE_LINE" | "MULTI_LINE"
  }}
  action={(e) => {
    // Handle click
  }}
  onUnblock={() => {
    // Handle when user clicks blocked feature
    sendPluginMessage({ pluginMessage: { type: this.props.config.plan.isTrialEnabled && this.props.trialStatus !== 'EXPIRED' ? 'GET_TRIAL' : 'GET_PRO' } }, '*')
  }}
/>
```

**Props**:
- `type`: Visual style variant
- `label`: Button text
- `feature`: Feature name for tracking/analytics
- `isBlocked`: Show upgrade UI if true
- `isNew`: Show "new" badge
- `isDisabled`: Disable interaction
- `isLoading`: Show loading spinner
- `warning`: Show warning tooltip
- `action`: Click handler
- `onUnblock`: Called when user clicks blocked button

### Input

```typescript
<Input
  id="unique-input-id"
  type="TEXT" | "NUMBER" | "PASSWORD"
  placeholder="Enter value..."
  value={this.state.value}
  charactersLimit={64}
  min={0}
  max={100}
  step={1}
  helper={{
    label: "Helper text explaining the input",
    pin: "TOP" | "BOTTOM"
  }}
  isBlocked={features.FEATURE.isBlocked()}
  isNew={features.FEATURE.isNew()}
  feature="FEATURE_NAME"
  onBlur={(e) => {
    // Handle blur
  }}
  onChange={(e) => {
    // Handle change
  }}
  onValid={(e) => {
    // Handle valid input submission
  }}
/>
```

**Props**:
- `id`: Unique identifier
- `type`: Input type
- `placeholder`: Placeholder text
- `value`: Controlled value
- `charactersLimit`: Max character count
- `min/max/step`: For number inputs
- `helper`: Tooltip help text
- `isBlocked/isNew/feature`: Feature control
- `onBlur/onChange/onValid`: Event handlers

### Dropdown

```typescript
<Dropdown
  id="my-dropdown"
  options={[
    {
      label: "Option 1",
      value: "option1",
      type: "OPTION",
      isActive: this.state.selected === "option1",
      isBlocked: features.OPTION1.isReached(count),
      isNew: features.OPTION1.isNew(),
      action: (e) => this.handleSelect("option1")
    },
    {
      type: "SEPARATOR"
    },
    {
      label: "Option 2",
      value: "option2",
      type: "OPTION",
      isActive: this.state.selected === "option2",
      action: (e) => this.handleSelect("option2")
    }
  ]}
  selected={this.state.selected}
  alignment="LEFT" | "RIGHT" | "FILL"
  pin="NONE" | "TOP" | "BOTTOM"
  helper={{
    label: "Choose an option",
    pin: "TOP",
    type: "SINGLE_LINE" | "MULTI_LINE"
  }}
  preview={{
    image: imageUrl,
    text: "Preview description",
    pin: "TOP" | "BOTTOM"
  }}
  warning={{
    label: "Warning message",
    pin: "TOP" | "BOTTOM",
    type: "SINGLE_LINE" | "MULTI_LINE"
  }}
  shouldReflow={{
    isEnabled: true,
    icon: "adjust"
  }}
  isDisabled={false}
  isBlocked={features.FEATURE.isBlocked()}
  isNew={features.FEATURE.isNew()}
  canBeSearched={true}
  searchLabel="Search…"
  noResultsLabel="No results"
  onUnblock={() => {
    sendPluginMessage({ pluginMessage: { type: this.props.config.plan.isTrialEnabled && this.props.trialStatus !== 'EXPIRED' ? 'GET_TRIAL' : 'GET_PRO' } }, '*')
  }}
/>
```

**Option Types**:
- `OPTION`: Selectable item
- `SEPARATOR`: Visual divider
- `TITLE`: Section header

**Search props** (new):
- `canBeSearched`: Enable a search input above the list
- `searchLabel`: Placeholder text for the search input
- `noResultsLabel`: Message shown when no option matches

### Menu

```typescript
<Menu
  id="actions-menu"
  type="ICON" | "PRIMARY"
  label="Actions"
  icon="settings"
  customIcon={<MyIcon />}
  options={[
    {
      label: "Export",
      value: "export",
      feature: "EXPORT",
      type: "OPTION",
      isActive: features.EXPORT.isActive(),
      isBlocked: features.EXPORT.isReached(count),
      isNew: features.EXPORT.isNew(),
      action: (e) => this.handleExport()
    },
    {
      label: "Import",
      value: "import",
      feature: "IMPORT",
      type: "OPTION",
      isActive: features.IMPORT.isActive(),
      action: (e) => this.handleImport()
    }
  ]}
  selected={this.state.selected}
  alignment="TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"
  state="DEFAULT" | "LOADING" | "DISABLED"
  helper={{
    label: "Open actions menu",
    pin: "TOP",
    isSingleLine: true
  }}
  warning={{
    label: "Warning message",
    pin: "BOTTOM",
    type: "MULTI_LINE" | "SINGLE_LINE"
  }}
  isBlocked={features.FEATURE.isBlocked()}
  isNew={features.FEATURE.isNew()}
  canBeSearched={true}
  searchLabel="Search…"
  noResultsLabel="No results"
/>
```

**Props**:
- `type`: Visual style — `"ICON"` (icon-only button) | `"PRIMARY"` (labeled button)
- `label`: Menu trigger text
- `icon`: Icon name
- `customIcon`: Custom React element as icon
- `options`: Menu items (same structure as Dropdown)
- `selected`: ID of the currently selected option
- `alignment`: Menu position relative to trigger
- `state`: Menu state
- `helper`: Tooltip on the trigger button
- `warning`: Warning tooltip on the trigger button
- `isBlocked` / `isNew`: Feature control

**Search props** (new):
- `canBeSearched`: Enable a search input above the option list
- `searchLabel`: Placeholder text for the search input
- `noResultsLabel`: Message shown when no option matches

### ActionsList

Low-level component that renders the floating option list used internally by `Dropdown` and `Menu`. Use it directly only when you need a fully custom trigger or a standalone floating list.

```typescript
<ActionsList
  options={[
    {
      label: "Option 1",
      value: "option1",
      type: "OPTION",
      isActive: this.state.selected === "option1",
      action: () => this.handleSelect("option1")
    },
    { type: "SEPARATOR" },
    {
      label: "Group",
      value: "group",
      type: "GROUP",
      children: [
        {
          label: "Sub-option",
          value: "sub",
          type: "OPTION",
          action: () => this.handleSelect("sub")
        }
      ]
    }
  ]}
  selected={this.state.selected}
  direction="LEFT" | "RIGHT"
  shouldScroll={true}
  containerId="plugin-container"
  preview={{
    image: imageUrl,
    text: "Preview text",
    pin: "TOP" | "BOTTOM"
  }}
  canBeSearched={true}
  searchLabel="Search…"
  noResultsLabel="No results"
  onCancellation={() => this.closeMenu()}
  menuRef={this.menuRef}
  subMenuRef={this.subMenuRef}
/>
```

**Props**:
- `options`: Array of `DropdownOption` — same type as `Dropdown` / `Menu`
- `selected`: ID of the currently highlighted/selected option
- `direction`: Direction submenu expands — `"RIGHT"` (default) | `"LEFT"`
- `shouldScroll`: Enable scrolling within the list
- `containerId`: ID of the scroll/portal container
- `preview`: Image tooltip shown on hover
- `canBeSearched`: Enable search input above the list
- `searchLabel`: Placeholder text for the search input
- `noResultsLabel`: Message shown when no option matches
- `onCancellation`: Called when the list is dismissed (Escape, click-outside)
- `menuRef` / `subMenuRef`: Refs to the `<ul>` elements for imperative control

### Icon

```typescript
<Icon
  type="PICTO" | "SYMBOL"
  iconName="warning" | "success" | "info" | "error" | "settings" | ...
  error={false}
  customColor="#FF0000"
/>
```

**Icon Types**:
- `PICTO`: Pictogram style icons
- `SYMBOL`: Symbol/glyph icons

### Tooltip

```typescript
<div
  style={{ position: 'relative' }}
  onMouseEnter={() => this.setState({ showTooltip: true })}
  onMouseLeave={() => this.setState({ showTooltip: false })}
>
  <Icon type="PICTO" iconName="info" />
  {this.state.showTooltip && (
    <Tooltip 
      pin="TOP" | "BOTTOM" | "LEFT" | "RIGHT"
      type="SINGLE_LINE" | "MULTI_LINE"
    >
      This is helpful information
    </Tooltip>
  )}
</div>
```

### Bar (Layout Container)

```typescript
<Bar
  leftPartSlot={
    <div className={layouts['snackbar--medium']}>
      {/* Left content */}
      <span className={texts['type']}>Title</span>
    </div>
  }
  rightPartSlot={
    <div className={layouts['snackbar--right']}>
      {/* Right content */}
      <Button type="primary" label="Action" />
    </div>
  }
  padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
  shouldReflow={true}
  border={['TOP']} | {['BOTTOM']} | {['TOP', 'BOTTOM']}
/>
```

**Use Cases**:
- Header bars
- Footer bars
- Action bars
- Status bars

### Feature Wrapper

```typescript
<Feature isActive={features.PRO_FEATURE.isActive()}>
  <Button label="Pro Feature" />
  <Input placeholder="Pro input" />
</Feature>
```

**Purpose**: Conditionally render children based on feature status.

### Dialog (Modal)

```typescript
<Dialog
  title="My Dialog Title"
  pin="RIGHT"
  isLoading={false}
  isMessage={false}
  tag="Feature"
  indicator="1 of 3"
  actions={{
    primary: {
      label: "Confirm",
      state: "DEFAULT" | "LOADING" | "DISABLED",
      isAutofocus: true,
      action: (e: MouseEvent) => { /* handle confirm */ },
    },
    secondary: {
      label: "Learn More",
      action: () => { /* handle secondary action */ },
    },
  }}
  onClose={(e: MouseEvent) => { /* handle close */ }}
>
  {/* Children content */}
  <p>Dialog body content</p>
</Dialog>
```

**Props**:
- `title`: Dialog header text
- `pin`: Position — `"RIGHT"` slides from right
- `isLoading`: Show loading spinner instead of content
- `isMessage`: Display as a centered message dialog
- `tag`: Optional tag badge next to title
- `indicator`: Pagination indicator (e.g., `"1 of 3"`)
- `actions`: Primary and optional secondary action buttons
  - `primary.state`: `"DEFAULT"` | `"LOADING"` | `"DISABLED"`
  - `primary.isAutofocus`: Auto-focus the button
- `onClose`: Close handler
- `children`: Body content (JSX)

**Use Cases**: Modals, side panels, announcements, forms, confirmations.

### Layout

```typescript
<Layout
  id="my-layout"
  column={[
    {
      node: <Tabs tabs={tabs} active={active} action={navHandler} />,
      typeModifier: "FIXED",
      fixedWidth: "148px",
    },
    {
      node: <div>Main content</div>,
      typeModifier: "BLANK",
    },
  ]}
  isFullHeight
  isFullWidth
/>
```

**Props**:
- `id`: Unique identifier
- `column`: Array of column definitions
  - `node`: React node to render
  - `typeModifier`: `"FIXED"` (fixed width) | `"BLANK"` (fills remaining space)
  - `fixedWidth`: Width string when `typeModifier` is `"FIXED"` (e.g., `"148px"`)
- `isFullHeight`: Stretch to full height
- `isFullWidth`: Stretch to full width

**Use Cases**: Multi-column layouts, sidebar + content, split views.

### Section

> **⚠️ CRITICAL**: `Section` does **NOT** accept JSX children. Use the `body` and `title` props.

```typescript
<Section
  title={
    <SimpleItem
      leftPartSlot={<SectionTitle label="My Section" />}
      isListItem={false}
      alignment="CENTER"
    />
  }
  body={[
    {
      node: <span className={texts.type}>Content item 1</span>,
      spacingModifier: "LARGE",
    },
    {
      node: <FormItem id="input" label="Name" shouldFill>
               <Input id="input" type="TEXT" value="" />
             </FormItem>,
    },
  ]}
  border={['BOTTOM']}
/>
```

**Props**:
- `title`: React node — typically a `SimpleItem` wrapping a `SectionTitle`
- `body`: Array of `{ node: ReactNode, spacingModifier?: "LARGE" }`
- `border`: `['TOP']` | `['BOTTOM']` | `['TOP', 'BOTTOM']`

### SectionTitle

```typescript
<SectionTitle label="Section Label" />
```

**Props**:
- `label`: Section heading text

**Usage**: Always wrapped inside a `SimpleItem` as `leftPartSlot`, used as the `title` prop of `Section`.

### SimpleItem

```typescript
<SimpleItem
  id="optional-id"
  leftPartSlot={<span className={texts.type}>Item label</span>}
  rightPartSlot={<Button type="icon" icon="trash" action={handleDelete} />}
  isListItem                       // renders as <li> inside a <List>
  isInteractive={false}            // adds hover/click styles
  isTransparent={false}            // removes background
  alignment="DEFAULT"              // 'DEFAULT' | 'CENTER' | 'BASELINE'
  action={handleClick}             // makes the whole row clickable
/>
```

**Props**:
- `leftPartSlot`: Required — main content (text, icon, etc.)
- `rightPartSlot`: Optional — trailing actions or meta
- `isListItem`: `true` renders as `<li>` — **always set this when inside a `<List>`** (default `true`)
- `isInteractive`: Adds hover highlight — set when the row itself is clickable
- `isTransparent`: Removes background fill
- `alignment`: Vertical alignment — `"DEFAULT"` | `"CENTER"` | `"BASELINE"`
- `action`: Row-level click/keyboard handler

**Typical usage inside a list**:
```typescript
<List>
  {items.map((item, index) => (
    <SimpleItem
      key={index}
      isListItem
      leftPartSlot={<span className={texts.type}>{item.label}</span>}
      rightPartSlot={
        <Button type="icon" icon="trash" action={handleDelete(index)} />
      }
    />
  ))}
</List>
```

**Usage as a section title row** (not a list item):
```typescript
<SimpleItem
  leftPartSlot={<SectionTitle label="My Section" />}
  isListItem={false}
  alignment="CENTER"
/>

### Tabs

```typescript
<Tabs
  tabs={[
    { id: 'TAB_A', label: 'Tab A', isUpdated: false },
    { id: 'TAB_B', label: 'Tab B', isUpdated: true },
  ]}
  active="TAB_A"
  direction="HORIZONTAL" | "VERTICAL"
  isFlex={true}
  maxVisibleTabs={3}
  action={(e: Event) => {
    const tabId = (e.currentTarget as HTMLElement).dataset.feature
    // Handle tab change
  }}
/>
```

**Props**:
- `tabs`: Array of tab items with `id`, `label`, and optional `isUpdated`
- `active`: Currently active tab `id`
- `direction`: `"HORIZONTAL"` (default) | `"VERTICAL"`
- `isFlex`: Whether tabs use flex layout
- `maxVisibleTabs`: Max tabs visible before overflow
- `action`: Tab click handler — reads tab ID from `e.currentTarget.dataset.feature`

**Use Cases**: Navigation between contexts, sub-navigation within a layout.

### FormItem

```typescript
<FormItem
  label="Field Label"
  id="field-id"
  shouldFill
  isMultiLine={false}
>
  <Input type="TEXT" id="field-id" value="" />
</FormItem>
```

**Props**:
- `label`: Form field label
- `id`: Matching ID for the inner input
- `shouldFill`: Expand to fill available width
- `isMultiLine`: Set true for textarea-style fields
- `children`: Input or other form control

### Card

```typescript
<Card
  src={imageUrl}
  title="Card Title"
  subtitle="Subtitle text"
  richText={<span className={texts.type}>Rich HTML content</span>}
  actions={<Button type="primary" label="Action" action={handleClick} />}
  shouldFill
  action={() => { /* card click handler */ }}
/>
```

**Props**:
- `src`: Image URL for the card header
- `title`: Card title
- `subtitle`: Card subtitle
- `richText`: React node for rich content body
- `actions`: React node for action buttons
- `shouldFill`: Expand to fill available space
- `action`: Click handler for the entire card

### Chip

```typescript
<Chip>Label text</Chip>
```

**Props**:
- `children`: Chip text content

### IconChip

```typescript
<IconChip
  iconType="PICTO"
  iconName="info" | "warning"
  text="Tooltip text or JSX"
  pin="TOP" | "BOTTOM"
  type="MULTI_LINE" | "SINGLE_LINE"
/>
```

**Props**:
- `iconType`: `"PICTO"` | `"SYMBOL"`
- `iconName`: Icon identifier
- `text`: Tooltip content (string or JSX)
- `pin`: Tooltip position
- `type`: Single or multi-line tooltip

### SemanticMessage

```typescript
<SemanticMessage
  type="INFO" | "WARNING" | "SUCCESS" | "ERROR"
  message="Message text"
  actionsSlot={
    <>
      <Button type="secondary" label="Accept" action={handleAccept} />
      <Button type="icon" icon="close" action={handleDismiss} />
    </>
  }
  isAnchored={true}
/>
```

**Props**:
- `type`: Message severity — `"INFO"` | `"WARNING"` | `"SUCCESS"` | `"ERROR"`
- `message`: Message text
- `actionsSlot`: Optional React node for action buttons
- `isAnchored`: Pin message to bottom of the view

**Use Cases**: Inline warnings, info banners, language suggestions.

### Notification

```typescript
<Notification
  type="INFO" | "SUCCESS" | "WARNING" | "ERROR"
  message="Notification text"
  timer={3000}
  onClose={handleClose}
/>
```

**Props**:
- `type`: Notification severity
- `message`: Notification text
- `timer`: Auto-dismiss delay in milliseconds
- `onClose`: Close handler

**Use Cases**: Toast notifications for Canvas → UI feedback (success, error messages).

### List vs SortableList

Choose based on whether items need to be reordered:

| Use case | Component |
|---|---|
| Read-only or action-only list | `<List>` |
| Drag-and-drop reordering | `<SortableList>` |

#### List

```typescript
<List
  padding="0 var(--size-pos-xxsmall)"
  isFullWidth
  isFullHeight={false}
>
  {items.map((item, index) => (
    <SimpleItem
      key={index}
      isListItem
      leftPartSlot={<span className={texts.type}>{item.label}</span>}
      rightPartSlot={
        <Button type="icon" icon="trash" action={handleDelete(index)} />
      }
    />
  ))}
</List>
```

**Props**:
- `padding`: CSS padding value
- `isFullWidth`: Stretch to full width
- `isFullHeight`: Stretch to full height
- `children`: Any React nodes (typically `SimpleItem` or `Section`)

#### SortableList

Use when items must be reorderable via drag-and-drop. Items must each have a unique `id` field.

```typescript
<SortableList
  data={items}                         // Array<{ id: string; [key: string]: any }>
  primarySlot={items.map((item) => (   // One node per item, same order as data
    <span className={texts.type}>{item.label}</span>
  ))}
  actionsSlot={items.map((item) => (   // Optional action per item
    <Button type="icon" icon="settings" action={() => handleEdit(item.id)} />
  ))}
  emptySlot={
    <SemanticMessage type="NEUTRAL" message="No items yet." />
  }
  helpers={{ remove: 'Remove item', more: 'More options' }}
  isScrollable
  canBeEmpty
  onChangeSortableList={(reordered) => setItems(reordered)}
  onRemoveItem={(e) => {
    const index = Number((e.currentTarget as HTMLElement).dataset.index)
    setItems(items.filter((_, i) => i !== index))
  }}
  onRefoldOptions={() => { /* close open option panels */ }}
/>
```

**Key props**:
- `data`: Source array — each item **must** have an `id: string` field
- `primarySlot`: Array of nodes rendered as the main content (index-aligned with `data`)
- `actionsSlot`: Optional array of action nodes per item
- `emptySlot`: Content shown when the list is empty
- `isScrollable`: Enable scroll overflow
- `canBeEmpty`: Allow the list to have zero items (default `true`)
- `onChangeSortableList`: Called with the reordered array after a drop
- `onRemoveItem`: Called when the built-in remove button is clicked
- `onRefoldOptions`: Called to collapse any open secondary panels

### Consent

```typescript
<Consent
  welcomeMessage="We use cookies for analytics..."
  vendorsMessage="Manage your preferences"
  privacyPolicy={{
    label: "Privacy Policy",
    action: () => { /* open privacy policy */ },
  }}
  moreDetailsLabel="Customize"
  lessDetailsLabel="Back"
  consentActions={{
    consent: {
      label: "Accept All",
      action: (vendors: Array<ConsentConfiguration>) => { /* handle */ },
    },
    deny: {
      label: "Deny All",
      action: (vendors: Array<ConsentConfiguration>) => { /* handle */ },
    },
    save: {
      label: "Save Preferences",
      action: (vendors: Array<ConsentConfiguration>) => { /* handle */ },
    },
  }}
  validVendor={{
    name: "Functional",
    id: "functional",
    icon: "",
    description: "Required for basic functionality",
    isConsented: true,
  }}
  vendorsList={userConsentArray}
  canBeClosed
  closeLabel="Close"
  onClose={() => { /* handle close */ }}
/>
```

**Props**:
- `welcomeMessage`: Welcome/intro text
- `vendorsMessage`: Vendor section header
- `privacyPolicy`: Link with `label` and `action`
- `moreDetailsLabel` / `lessDetailsLabel`: Toggle labels
- `consentActions`: Consent/deny/save buttons — each `action` receives `Array<ConsentConfiguration>`
- `validVendor`: Always-on functional vendor
- `vendorsList`: Array of `ConsentConfiguration` items (from stores)
- `canBeClosed` / `closeLabel` / `onClose`: Close behavior

**Type**: `ConsentConfiguration` is also exported as a TypeScript type for typing consent handler signatures.

### SimpleSlider

> **⚠️ CRITICAL**: The component is called `SimpleSlider`, NOT `Slider`. The `onChange` has a non-standard signature.

```typescript
<SimpleSlider
  id="opacity-slider"
  min="0"
  max="100"
  value="50"
  feature="OPACITY"
  isBlocked={false}
  isNew={false}
  onChange={(feature: string, state: string, value: number) => {
    this.setState({ opacity: value })
  }}
/>
```

**Props**:
- `id`: Unique identifier
- `min` / `max` / `value`: Range values (as strings)
- `feature`: Feature name for tracking
- `isBlocked` / `isNew`: Feature control
- `onChange`: Non-standard signature `(feature: string, state: string, value: number) => void`

### SegmentedControl

Icon-based tab switcher. Each segment shows an icon (or a letter) with a tooltip helper. Use instead of `Tabs` when the options are purely icon-driven and compact layout is needed.

```typescript
<SegmentedControl
  items={[
    {
      id: "GRID",
      icon: { type: "PICTO", name: "grid" },
      helper: { label: "Grid view", pin: "BOTTOM" },
      isDisabled: false,
    },
    {
      id: "LIST",
      icon: { type: "PICTO", name: "list" },
      helper: { label: "List view", pin: "BOTTOM" },
    },
  ]}
  active={this.state.view}
  preview={{
    image: previewImageUrl,
    text: "Preview description",
    pin: "BOTTOM"
  }}
  warning={{
    label: "This option is unavailable",
    pin: "BOTTOM",
    type: "MULTI_LINE" | "SINGLE_LINE"
  }}
  isBlocked={features.FEATURE.isBlocked()}
  isNew={features.FEATURE.isNew()}
  action={(e) => {
    const id = (e.currentTarget as HTMLElement).dataset.feature
    this.setState({ view: id })
  }}
  onUnblock={() => {
    sendPluginMessage({ pluginMessage: { type: this.props.config.plan.isTrialEnabled && this.props.trialStatus !== 'EXPIRED' ? 'GET_TRIAL' : 'GET_PRO' } }, '*')
  }}
/>
```

**Props**:
- `items`: Array of segment definitions
  - `id`: Unique segment identifier (also used as `data-feature` on the DOM element)
  - `icon.type`: `"PICTO"` | `"LETTER"`
  - `icon.name`: Icon identifier from `IconList`
  - `helper`: Tooltip — `label` required, `pin` optional
  - `isDisabled`: Disable this segment
- `active`: ID of the currently active segment
- `preview`: Image + text tooltip shown on hover
- `warning`: Warning tooltip shown over the control
- `isBlocked` / `isNew`: Feature control
- `action`: Click/keyboard handler — read the active ID from `e.currentTarget.dataset.feature`
- `onUnblock`: Called when user clicks a blocked control

**Reading the active segment in `action`**:
```typescript
action={(e) => {
  const id = (e.currentTarget as HTMLElement).dataset.feature
  this.setState({ view: id })
}}
```

## CSS Classes

### Layouts

```typescript
import { layouts } from '@unoff/ui'
```

Two layout families are available: **snackbar** (horizontal row) and **stackbar** (vertical column). Both share the same modifier suffixes.

#### snackbar — horizontal flex row

Use inside `Bar.leftPartSlot` or anywhere you need to arrange items in a row.

```typescript
// Base row
<div className={layouts.snackbar}>…</div>

// Gap variants
<div className={layouts['snackbar--large']}>…</div>   // large gap
<div className={layouts['snackbar--medium']}>…</div>  // medium gap
<div className={layouts['snackbar--tight']}>…</div>   // tight gap (toolbar buttons)

// Alignment
<div className={layouts['snackbar--start']}>…</div>
<div className={layouts['snackbar--centered']}>…</div>
<div className={layouts['snackbar--end']}>…</div>
<div className={layouts['snackbar--baseline']}>…</div>

// Filling & wrapping
<div className={layouts['snackbar--fill']}>…</div>    // children fill remaining space
<div className={layouts['snackbar--wrap']}>…</div>    // wraps when overflowing

// Justification
<div className={layouts['snackbar--left']}>…</div>
<div className={layouts['snackbar--center']}>…</div>
<div className={layouts['snackbar--right']}>…</div>
```

**Practical guide**:
- **Toolbar with icon buttons** → `snackbar--tight`
- **Bar with a label + action** → `snackbar--medium`
- **Responsive wrapping row** → `snackbar--wrap`

#### stackbar — vertical flex column

Use when you need to stack elements vertically.

```typescript
// Base column
<div className={layouts.stackbar}>…</div>

// Gap variants
<div className={layouts['stackbar--large']}>…</div>
<div className={layouts['stackbar--medium']}>…</div>
<div className={layouts['stackbar--tight']}>…</div>

// Alignment & justification (same modifiers as snackbar)
<div className={layouts['stackbar--centered']}>…</div>
<div className={layouts['stackbar--fill']}>…</div>
<div className={layouts['stackbar--right']}>…</div>
// etc.
```

#### centered

Centers content both horizontally and vertically (absolute positioning).

```typescript
<div className={layouts.centered}>…</div>
```

### Typography

```typescript
import { texts } from '@unoff/ui'
```

#### Size & weight

```typescript
<span className={texts.type}>Default body text</span>
<span className={texts['type--small']}>Small text</span>
<span className={texts['type--medium']}>Medium text</span>
<span className={texts['type--large']}>Large text</span>
<span className={texts['type--xlarge']}>Extra-large text</span>
<span className={texts['type--bold']}>Bold text</span>
<span className={texts['type--truncated']}>Truncated with ellipsis…</span>
```

#### Color / semantic

```typescript
<span className={texts['type--secondary']}>Muted / secondary</span>
<span className={texts['type--tertiary']}>Very muted / tertiary</span>
<span className={texts['type--success']}>Success / green</span>
<span className={texts['type--warning']}>Warning / amber</span>
<span className={texts['type--alert']}>Alert / red</span>
<span className={texts['type--inverse']}>Inverse (for dark backgrounds)</span>
```

#### Label

```typescript
<span className={texts.label}>Form label style</span>
```

### Combining Classes

```typescript
import { doClassnames } from '@unoff/utils'

<div className={doClassnames([
  layouts['snackbar--medium'],
  texts['type'],
  this.state.isActive && 'active-class',
  'custom-class'
])}>
  Content
</div>
```

**doClassnames** filters out falsy values, making conditional classes easy.

## Complete Component Example

```typescript
import React from 'react'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { Button, Input, Dropdown, Bar, layouts, texts } from '@unoff/ui'
import { sendPluginMessage } from '../utils/pluginMessage'

interface Props {
  planStatus: PlanStatus
  config: ConfigContextType
  service: Service
  editor: Editor
  t: (key: string) => string
}

interface State {
  name: string
  exportFormat: string
  isLoading: boolean
}

export default class ExportPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      name: '',
      exportFormat: 'PNG',
      isLoading: false
    }
  }
  
  // Define features
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    EXPORT_PNG: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_PNG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_SVG: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_SVG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    BATCH_EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'BATCH_EXPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })
  
  handleExport = () => {
    this.setState({ isLoading: true })
    
    sendPluginMessage({
      pluginMessage: {
        type: 'EXPORT_NODES',
        data: {
          format: this.state.exportFormat,
          name: this.state.name
        }
      }
    })
  }
  
  render() {
    const features = ExportPanel.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
    
    return (
      <div>
        <Bar
          leftPartSlot={
            <div className={layouts['snackbar--medium']}>
              <span className={texts['type']}>
                {this.props.t('export.title')}
              </span>
            </div>
          }
          border={['BOTTOM']}
        />
        
        <div style={{ padding: '16px' }}>
          <Input
            id="export-name"
            type="TEXT"
            placeholder={this.props.t('export.namePlaceholder')}
            value={this.state.name}
            charactersLimit={64}
            helper={{
              label: this.props.t('export.nameHelper'),
              pin: 'TOP'
            }}
            onChange={(e) => this.setState({ name: e.currentTarget.value })}
            onValid={(e) => this.handleExport()}
          />
          
          <Dropdown
            id="export-format"
            options={[
              {
                label: 'PNG',
                value: 'PNG',
                type: 'OPTION',
                isActive: this.state.exportFormat === 'PNG',
                isBlocked: features.EXPORT_PNG.isBlocked(),
                action: () => this.setState({ exportFormat: 'PNG' })
              },
              {
                label: 'SVG',
                value: 'SVG',
                type: 'OPTION',
                isActive: this.state.exportFormat === 'SVG',
                isBlocked: features.EXPORT_SVG.isBlocked(),
                isNew: features.EXPORT_SVG.isNew(),
                action: () => this.setState({ exportFormat: 'SVG' })
              }
            ]}
            selected={this.state.exportFormat}
            pin="BOTTOM"
          />
          
          <Button
            type="primary"
            label={this.props.t('export.button')}
            feature="EXPORT"
            isBlocked={features.BATCH_EXPORT.isBlocked()}
            isLoading={this.state.isLoading}
            isDisabled={!this.state.name}
            action={this.handleExport}
            onUnblock={() => {
              sendPluginMessage({
                pluginMessage: { type: this.props.config.plan.isTrialEnabled && this.props.trialStatus !== 'EXPIRED' ? 'GET_TRIAL' : 'GET_PRO' }
              }, '*')
            }}
          />
        </div>
      </div>
    )
  }
}
```

## Gotchas & Pitfalls

> **CRITICAL**: These are real issues encountered during development. AI agents MUST follow these rules to avoid broken implementations.

### 1. Component Names May Differ from Expectations

Several components have unexpected names. Always check before importing:

| ❌ Expected Name | ✅ Actual Name |
|---|---|
| `Slider` | `SimpleSlider` |
| `ListItem` | `SimpleItem` |
| `Modal` | `Dialog` |
| `OptionsList` / `DropdownList` | `ActionsList` |

### 1b. Menu `type` Values Are `"ICON"` and `"PRIMARY"`, Not `"PRIMARY"` and `"SECONDARY"`

```typescript
// ❌ WRONG
<Menu type="SECONDARY" />

// ✅ CORRECT
<Menu type="ICON" />    // icon-only trigger (default)
<Menu type="PRIMARY" /> // labeled button trigger
```

### 2. Section — No `children`, Use `body` and `title` Props

`Section` does **NOT** accept JSX children. See the [Section](#section) component documentation above for the correct `body` and `title` prop pattern.

### 3. SimpleSlider — Non-Standard `onChange` Signature

`SimpleSlider.onChange` is `(feature: string, state: string, value: number) => void`, **NOT** a React event handler. See the [SimpleSlider](#simpleslider) component documentation above.

### 4. Dropdown — Option `action` Is a Closure, Not a Value Handler

Dropdown option `action` callbacks are `() => void` closures. They do NOT receive the selected value as an argument. Each option must capture its own value in the closure.

```typescript
// ❌ WRONG — action does not receive the value
action: (value) => this.setState({ color: value })

// ✅ CORRECT — closure captures value
action: () => this.setState({ color: 'red' })
```

Also: `Dropdown` does **NOT** have a `parentClassName` prop.

### 5. Preact `TargetedEvent` — Use `e.currentTarget`, Not `e.target`

In Preact, `e.target` is typed as `EventTarget | null` (not narrowed to the element). Always use `e.currentTarget` to access element properties like `.value`.

```typescript
// ❌ WRONG — e.target is EventTarget | null in Preact
onChange={(e) => this.setState({ name: e.target.value })}

// ✅ CORRECT — e.currentTarget is properly typed
onChange={(e) => this.setState({ name: e.currentTarget.value })}
```

This applies to ALL event handlers: `onChange`, `onBlur`, `onInput`, `onValid`, etc.

### 6. Button — `action`, Not `onClick`

The click handler for `Button` is the `action` prop, not `onClick`. Similarly, `isLoading`, `isBlocked`, `isNew` are boolean props (not state variants).

### 7. Always Verify Props Against Type Definitions

Before using any `unoff-ui` component, check the actual `.d.ts` type definitions or the [Storybook](https://ui.unoff.dev/) to verify prop names and types.

## Best Practices

### 1. Always Use FeatureStatus

```typescript
// ✅ Use FeatureStatus for feature checks
const features = MyComponent.features(planStatus, config, service, editor)
<Button isBlocked={features.MY_FEATURE.isBlocked()} />

// ❌ Don't manually check plan status
<Button isBlocked={planStatus.status === 'free'} />
```

### 2. Add feature Prop for Tracking

```typescript
// ✅ Include feature name
<Button feature="EXPORT_PNG" label="Export" />

// ❌ Missing feature name
<Button label="Export" />
```

### 3. Implement onUnblock

```typescript
// ✅ Handle upgrade flow
<Button
  isBlocked={true}
  onUnblock={() => {
    sendPluginMessage({ pluginMessage: { type: this.props.config.plan.isTrialEnabled && this.props.trialStatus !== 'EXPIRED' ? 'GET_TRIAL' : 'GET_PRO' } }, '*')
  }}
/>

// ❌ No upgrade path
<Button isBlocked={true} />
```

### 4. Use Helper Tooltips

```typescript
// ✅ Provide helpful context
<Input
  helper={{
    label: "Maximum 64 characters",
    pin: "TOP"
  }}
/>

// ❌ No guidance for users
<Input placeholder="Enter value" />
```

### 5. Handle Loading States

```typescript
// ✅ Show loading feedback
<Button
  isLoading={this.state.isLoading}
  label="Save"
/>

// ❌ No feedback during async operations
<Button label="Save" />
```

## Theme Integration

The library automatically adapts to Figma's light/dark theme. No additional configuration needed.

```typescript
// Components automatically use theme colors
<Button type="primary" label="Click me" />
// Primary color adapts to current theme
```

## Accessibility

All components include:
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

```typescript
// Accessibility is built-in
<Button label="Submit" />
// Automatically accessible
```

## Related Skills

- **[component-mapping](./component-mapping.md)** — Complete table mapping every Figma library component to its `@unoff/ui` export and Storybook story URL
- **[implement-design](../externals/implement-design.md)** — End-to-end workflow for translating a Figma spec document into production code
