<template>
  <div
    ref="containerRef"
    class="overlayer-slider"
    :class="{ 'is-blocked': blocked, 'is-dragging': isDragging }"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @contextmenu.prevent
  >
    <!-- Hover Outline Overlay -->
    <div class="hover-outline" />

    <!-- Progress Fill Bar -->
    <div class="slider-fill" :style="{ width: percent + '%' }">
      <!-- Masked Changed Dot (inside fill, colored dark) -->
      <transition name="fade">
        <div v-if="isChanged" class="changed-dot fill-dot" />
      </transition>
    </div>

    <!-- Background Changed Dot (outside fill, colored light) -->
    <transition name="fade">
      <div v-if="isChanged" class="changed-dot bg-dot" />
    </transition>

    <!-- Content (Layered on top) -->
    <div class="slider-content">
      <span class="slider-label">
        <slot>{{ label }}</slot>
      </span>
      <span class="slider-value">
        {{ formattedValue }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useOverlayerState } from '../composables/useOverlayerState'

const props = defineProps<{
  modelValue: number
  defaultValue: number
  min: number
  max: number
  label?: string
  format?: string
  blocked?: boolean
  fontSize?: number
  disableReset?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue' | 'complete', value: number): void
}>()

const { state } = useOverlayerState()
const containerRef = ref<HTMLDivElement | null>(null)
const fontSizeStyle = computed(() => `${props.fontSize || state.fontSize || 24}px`)
const isDragging = ref(false)

const percent = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 0
  const val = Math.max(props.min, Math.min(props.max, props.modelValue))
  return ((val - props.min) / range) * 100
})

const isChanged = computed(() => {
  return Math.abs(props.modelValue - props.defaultValue) > 0.0001
})

const formattedValue = computed(() => {
  const val = props.modelValue
  if (props.format === '0.00x') {
    return `${val.toFixed(2)}x`
  }
  // Default format "0.##"
  return String(Math.round(val * 100) / 100)
})

const updateValueFromCoords = (clientX: number) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const t = Math.max(0, Math.min(1, x / rect.width))
  let rawVal = props.min + t * (props.max - props.min)
  
  // Custom slider filter (round UI scale to 2 decimals)
  if (props.format === '0.00x') {
    rawVal = Math.round(rawVal * 100) / 100
  }
  
  emit('update:modelValue', rawVal)
}

const handleMouseDown = (e: MouseEvent) => {
  if (props.blocked) return
  if (e.button === 1) { // Middle click
    if (state.middleClickToDefault && isChanged.value && !props.disableReset) {
      emit('update:modelValue', props.defaultValue)
      emit('complete', props.defaultValue)
    }
    return
  }
  if (e.button !== 0) return // Left click only

  isDragging.value = true
  updateValueFromCoords(e.clientX)
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  updateValueFromCoords(e.clientX)
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isDragging.value) return
  isDragging.value = false
  updateValueFromCoords(e.clientX)
  emit('complete', props.modelValue)
  
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

const handleTouchStart = (e: TouchEvent) => {
  if (props.blocked) return
  isDragging.value = true
  updateValueFromCoords(e.touches[0].clientX)
  
  window.addEventListener('touchmove', handleTouchMove)
  window.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  updateValueFromCoords(e.touches[0].clientX)
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  emit('complete', props.modelValue)
  
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleTouchEnd)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.overlayer-slider {
  position: relative;
  display: flex;
  align-items: center;
  height: 50px;
  background-color: #3C3A4B; /* UIColors.ObjectBG */
  border-radius: 8px;
  cursor: ew-resize;
  user-select: none;
  box-sizing: border-box;
  overflow: hidden;
  transition: opacity 0.2s ease-out;
}

.overlayer-slider.is-blocked {
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
  z-index: 10;
}

.overlayer-slider:hover:not(.is-blocked) .hover-outline {
  opacity: 1;
}

/* Fill bar progress */
.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: #919AFF; /* UIColors.ObjectActive */
  border-radius: 8px 0 0 8px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

/* Connect the transition to dragging to make it feel immediate */
.is-dragging .slider-fill {
  transition: none !important;
}

/* Changed Dot layout */
.changed-dot {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
}

/* Light dot on dark background */
.bg-dot {
  background-color: #626696; /* Figma Changed Dot Color */
  z-index: 2;
}

/* Dark dot inside light progress fill */
.fill-dot {
  background-color: #3C3A4B; /* UIColors.ObjectBG */
  z-index: 4;
}

/* Text overlays */
.slider-content {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  pointer-events: none; /* Make clicking pass through to parent slider drag */
}

.slider-label {
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400;
  color: #ffffff;
  padding-left: 4px;
}

.slider-value {
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400;
  color: #ffffff;
  padding-right: 4px;
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
