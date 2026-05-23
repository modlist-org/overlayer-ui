<template>
  <div
    class="overlayer-toggle"
    :class="{ 'is-blocked': blocked }"
    @click="toggle"
    @mousedown.prevent="handleMouseDown"
    @contextmenu.prevent
  >
    <!-- Hover Outline Overlay -->
    <div class="hover-outline" />

    <!-- Changed Dot Indicator (top-left) -->
    <transition name="fade">
      <div v-if="isChanged" class="changed-dot" />
    </transition>

    <!-- Label -->
    <span class="toggle-label">
      <slot>{{ label }}</slot>
    </span>

    <!-- Toggle Indicator -->
    <div class="toggle-indicator-wrapper">
      <svg
        class="toggle-indicator"
        :class="{ 'is-active': modelValue, 'animate-bounce': isAnimating }"
        viewBox="0 0 100 100"
        @animationend="isAnimating = false"
      >
        <!-- Active state (Filled Circle) -->
        <circle v-if="modelValue" cx="50" cy="50" r="46" fill="currentColor" />
        <!-- Inactive state (Hollow Circle Outline) -->
        <circle v-else cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="16" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useOverlayerState } from '../composables/useOverlayerState'

const props = defineProps<{
  modelValue: boolean
  defaultValue: boolean
  label?: string
  blocked?: boolean
  fontSize?: number
  disableReset?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { state } = useOverlayerState()
const fontSizeStyle = computed(() => `${props.fontSize || state.fontSize || 24}px`)
const isAnimating = ref(false)

const isChanged = computed(() => {
  if (props.disableReset) return false
  return props.modelValue !== props.defaultValue
})

// Trigger animation on change
watch(() => props.modelValue, () => {
  isAnimating.value = true
})

const toggle = () => {
  if (props.blocked) return
  emit('update:modelValue', !props.modelValue)
}

const handleMouseDown = (e: MouseEvent) => {
  if (props.blocked) return
  if (e.button === 1) { // Middle click
    if (state.middleClickToDefault && props.modelValue !== props.defaultValue && !props.disableReset) {
      emit('update:modelValue', props.defaultValue)
    }
  }
}
</script>

<style scoped>
.overlayer-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 11px 0 16px;
  background-color: #3C3A4B; /* UIColors.ObjectBG */
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  transition: opacity 0.2s ease-out;
}

.overlayer-toggle.is-blocked {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Hover Outline Effect */
.hover-outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #919AFF; /* UIColors.ObjectActive */
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.1s ease-out;
  pointer-events: none;
}

.overlayer-toggle:hover:not(.is-blocked) .hover-outline {
  opacity: 1;
}

/* Changed Dot */
.changed-dot {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #626696; /* Figma Changed Dot Color */
}

/* Label */
.toggle-label {
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Toggle Indicator */
.toggle-indicator-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px; /* Figma: 24px */
  height: 24px; /* Figma: 24px */
}

.toggle-indicator {
  width: 24px; /* Figma: 24px */
  height: 24px; /* Figma: 24px */
  color: #626696; /* Figma Inactive Toggle Color */
  transition: color 0.15s ease-out;
}

.toggle-indicator.is-active {
  color: #919AFF; /* UIColors.ObjectActive */
}

/* Dynamic click resize animation */
@keyframes toggle-click {
  0% {
    width: 26px;
    height: 26px;
  }
  40% {
    width: 30px;
    height: 30px;
  }
  100% {
    width: 26px;
    height: 26px;
  }
}

.toggle-indicator.animate-bounce {
  animation: toggle-click 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
