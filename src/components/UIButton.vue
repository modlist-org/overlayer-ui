<template>
  <button
    class="overlayer-btn"
    :class="{ 'is-blocked': blocked }"
    :disabled="blocked"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOverlayerState } from '../composables/useOverlayerState'

const props = defineProps<{
  label?: string
  blocked?: boolean
  fontSize?: number
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { state } = useOverlayerState()

const fontSizeStyle = computed(() => `${props.fontSize || state.fontSize || 24}px`)

const handleClick = () => {
  if (props.blocked) return
  emit('click')
}
</script>

<style scoped>
.overlayer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 24px;
  background-color: #6C78FF; /* Figma Reload Button BG */
  color: #ffffff;
  font-family: 'SUIT', sans-serif;
  font-size: v-bind(fontSizeStyle);
  font-weight: 400; /* Figma: Regular */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.12s ease-out, opacity 0.2s ease-out;
  outline: none;
  user-select: none;
  box-sizing: border-box;
}

.overlayer-btn:hover:not(:disabled) {
  background-color: #838EFF;
}

.overlayer-btn:active:not(:disabled) {
  background-color: #B1B8FF;
  transition: background-color 0s;
}

.overlayer-btn.is-blocked {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
