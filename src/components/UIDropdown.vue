<template>
  <div
    ref="containerRef"
    class="overlayer-dropdown"
    :class="{ 'is-expanded': isExpanded, 'is-blocked': blocked }"
    @contextmenu.prevent
  >
    <!-- Header trigger -->
    <div
      class="dropdown-header"
      @click="toggle"
      @mousedown.prevent="handleMouseDown"
    >
      <!-- Hover Outline Overlay -->
      <div class="hover-outline" />

      <!-- Changed Dot Indicator -->
      <transition name="fade">
        <div v-if="isChanged" class="changed-dot" />
      </transition>

      <!-- Current selection label -->
      <span class="selected-label">
        {{ display(modelValue) }}
      </span>

      <!-- Triangle Icon -->
      <div class="triangle-wrapper">
        <svg
          class="triangle-icon"
          :class="{ 'is-expanded': isExpanded }"
          viewBox="0 0 24 24"
        >
          <polygon points="6,9 12,15 18,9" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- Dropdown Options List -->
    <transition name="expand">
      <div v-if="isExpanded" class="dropdown-list">
        <div
          v-for="(item, idx) in values"
          :key="idx"
          class="dropdown-row"
          @click="selectItem(item)"
        >
          {{ display(item) }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useOverlayerState } from '../composables/useOverlayerState'

const props = defineProps<{
  modelValue: T
  defaultValue: T
  values: T[] | readonly T[]
  display: (item: T) => string
  blocked?: boolean
  fontSize?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const { state } = useOverlayerState()
const isExpanded = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const isChanged = computed(() => {
  if (props.defaultValue === null || props.defaultValue === undefined) return false
  return props.modelValue !== props.defaultValue
})

const fontSizeStyle = computed(() => `${props.fontSize || state.fontSize || 24}px`)

const toggle = () => {
  if (props.blocked) return
  isExpanded.value = !isExpanded.value
}

const selectItem = (item: T) => {
  emit('update:modelValue', item)
  isExpanded.value = false
}

const handleMouseDown = (e: MouseEvent) => {
  if (props.blocked) return
  if (e.button === 1) { // Middle click
    if (state.middleClickToDefault && isChanged.value) {
      emit('update:modelValue', props.defaultValue)
      isExpanded.value = false
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (isExpanded.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.overlayer-dropdown {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.dropdown-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 8px 0 16px;
  background-color: #3C3A4B; /* UIColors.ObjectBG */
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.overlayer-dropdown.is-blocked {
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

.dropdown-header:hover .hover-outline {
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

/* Current selection label */
.selected-label {
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Triangle icon wrapper and styles */
.triangle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; /* Figma: ~30px */
  height: 30px; /* Figma: ~30px */
}

.triangle-icon {
  width: 30px; /* Figma: ~30px */
  height: 30px; /* Figma: ~30px */
  color: #F3F4FF; /* Figma Down Arrow Color */
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease-out;
}

.triangle-icon.is-expanded {
  color: #919AFF; /* UIColors.ObjectActive */
  transform: rotate(180deg);
}

/* Dropdown list */
.dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background-color: #3C3A4B; /* UIColors.ObjectBG */
  border-radius: 8px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 250px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-row {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  transition: background-color 0.12s ease-out;
}

.dropdown-row:hover {
  background-color: #919AFF; /* UIColors.ObjectActive */
}

/* Height expansion transitions */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.16s ease-out, opacity 0.16s ease-out;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0 !important;
  opacity: 0;
}

/* Fades */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
