# overlayer-ui

> A premium, high-fidelity Vue 3 UI component library based on Overlayer V5 aesthetics.

`overlayer-ui` provides high-fidelity, interactive components including buttons, toggles, sliders, and dropdowns, with smooth micro-animations, customizable outlines, and a built-in decoupled state manager.

---

## Features

- **Harmonious Dark Theme**: Specifically tailored using a premium color palette (`#3C3A4B`, `#919AFF`, `#6C78FF`).
- **Interactive Micro-Animations**: Outline glows on hover, click animations, and smooth transitions.
- **Value-Change Dot Indicators**: Automatically signals to users when a component's current value differs from its default.
- **Middle-Click to Reset**: Instantly restore default state with a scroll-wheel click.
- **Decoupled i18n Sync**: Built-in reactive state synchronization with any external internationalization library (e.g. `vue-i18n`).

---

## Installation

```bash
npm install overlayer-ui
# or
bun add overlayer-ui
```

---

## Setup & Basic Usage

Import the CSS styles and register components individually or globally in your Vue 3 application.

### 1. Style Import
Import the CSS styles in your main entry file (e.g., `main.ts` or `app.vue`):

```typescript
import 'overlayer-ui/dist/overlayer-ui.css'
```

### 2. Basic Component Usage

```vue
<template>
  <div class="settings-panel">
    <!-- Dropdown Selection -->
    <UIDropdown
      v-model="state.language"
      :default-value="defaults.language"
      :values="['en-US', 'ko-KR']"
      :display="val => val"
    />

    <!-- Toggle Switch -->
    <UIToggle
      v-model="state.active"
      :default-value="defaults.active"
      label="Enable Overlay"
    />

    <!-- Range Slider -->
    <UISlider
      v-model="state.uiScale"
      :default-value="defaults.uiScale"
      :min="0.8"
      :max="1.6"
      label="UI Scale"
      format="0.00x"
    />

    <!-- Button -->
    <UIButton label="Apply Settings" @click="handleApply" />
  </div>
</template>

<script setup lang="ts">
import {
  UIButton,
  UIToggle,
  UISlider,
  UIDropdown,
  useOverlayerState
} from 'overlayer-ui'

const { state, defaults } = useOverlayerState()

const handleApply = () => {
  console.log('Current settings:', state)
}
</script>
```

---

## State & API Details

### Global State Management (`useOverlayerState`)
The library comes with a lightweight, client-side persistent state manager that handles options and tooltips.

```typescript
const {
  state,           // Reactive settings object (saves to localStorage on changes)
  defaults,        // Readonly default settings object
  loadSettings,    // Load settings from localStorage (client-side only)
  resetKey,        // Reset a specific key to default, e.g. resetKey('uiScale')
  resetAll,        // Reset all settings to defaults
  
  // Tooltip APIs
  tooltipText,
  tooltipVisible,
  tooltipX,
  tooltipY,
  showTooltip,
  hideTooltip
} = useOverlayerState()
```

### Syncing with custom i18n (`setI18nLocaleRef`)
To synchronize the state's `language` with your app's standard `vue-i18n` locale, register the locale ref using `setI18nLocaleRef`:

```typescript
import { useI18n } from 'vue-i18n'
import { setI18nLocaleRef } from 'overlayer-ui'

const i18n = useI18n()
setI18nLocaleRef(i18n.locale) // Any changes to state.language will now update i18n.locale automatically.
```

---

## Component Reference

### `UIButton`
A simple high-fidelity button with hover/active transitions.
- **Props**:
  - `label`: `string` (Optional) - Button text.
  - `blocked`: `boolean` (Default: `false`) - Disabled state.

### `UIToggle`
A checkbox/toggle element showcasing a custom hollow/filled circle animation.
- **Props**:
  - `modelValue`: `boolean` (Required) - Binding value.
  - `defaultValue`: `boolean` (Required) - Used to check if value changed.
  - `label`: `string` (Optional) - Display label.
  - `blocked`: `boolean` (Default: `false`) - Disable interactions.

### `UISlider`
A precision slider for selecting numeric scales or values. Supports middle-click reset.
- **Props**:
  - `modelValue`: `number` (Required) - Binding value.
  - `defaultValue`: `number` (Required) - Used to check if value changed.
  - `min`: `number` (Required) - Minimum value.
  - `max`: `number` (Required) - Maximum value.
  - `label`: `string` (Optional) - Display label.
  - `format`: `'0.00x'` | `undefined` - Value formatting preset.
  - `blocked`: `boolean` (Default: `false`) - Disable interactions.

### `UIDropdown`
A customizable dropdown menu supporting generic item types.
- **Props**:
  - `modelValue`: `T` (Required) - Selected item.
  - `defaultValue`: `T` (Required) - Used to check if value changed.
  - `values`: `T[] | readonly T[]` (Required) - List of selectable options.
  - `display`: `(item: T) => string` (Required) - Mapping function to convert items to labels.
  - `blocked`: `boolean` (Default: `false`) - Disable interactions.

---

## License

GPLv3
