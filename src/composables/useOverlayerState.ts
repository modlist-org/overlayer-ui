import { reactive, ref, watch } from 'vue'

export interface OverlayerSettings {
  active: boolean
  language: string
  showOnStartup: boolean
  tooltip: boolean
  middleClickToDefault: boolean
  uiScale: number
  showAutoplayJudgment: boolean
}

export const DEFAULTS: Readonly<OverlayerSettings> = {
  active: true,
  language: 'en-US',
  showOnStartup: false,
  tooltip: true,
  middleClickToDefault: true,
  uiScale: 1.0,
  showAutoplayJudgment: false,
}

// Global reactive state instance
const state = reactive<OverlayerSettings>({ ...DEFAULTS })
const isInitialized = ref(false)

// Global tooltip state
const tooltipText = ref('')
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)

// Optional locale ref for synchronizing with the parent application's i18n
interface SimpleRef<T> {
  value: T
}
let localeRef: SimpleRef<string> | null = null

export function setI18nLocaleRef(refVal: SimpleRef<string> | null) {
  localeRef = refVal
  if (localeRef) {
    localeRef.value = state.language
  }
}

export function useOverlayerState() {
  const loadSettings = () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('overlayer_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        const parsedData = parsed as Partial<OverlayerSettings>
        for (const key in DEFAULTS) {
          const k = key as keyof OverlayerSettings
          if (parsedData[k] !== undefined) {
            state[k] = parsedData[k] as never
          }
        }
      }
    } catch (e) {
      console.error('Failed to load overlayer settings:', e)
    }
    // Sync i18n language
    if (localeRef) {
      localeRef.value = state.language
    }
    isInitialized.value = true
  }

  const saveSettings = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('overlayer_settings', JSON.stringify(state))
  }

  // Set up client-side watchers once
  if (typeof window !== 'undefined' && !isInitialized.value) {
    watch(state, () => {
      saveSettings()
    }, { deep: true })

    watch(() => state.language, (newLang) => {
      if (localeRef) {
        localeRef.value = newLang
      }
    })
  }

  const resetKey = <K extends keyof OverlayerSettings>(key: K) => {
    state[key] = DEFAULTS[key]
  }

  const resetAll = () => {
    Object.assign(state, DEFAULTS)
  }

  const showTooltip = (text: string, x: number, y: number) => {
    if (!state.tooltip) return
    tooltipText.value = text
    tooltipX.value = x
    tooltipY.value = y
    tooltipVisible.value = true
  }

  const hideTooltip = () => {
    tooltipVisible.value = false
  }

  return {
    state,
    defaults: DEFAULTS,
    isInitialized,
    loadSettings,
    resetKey,
    resetAll,
    // Tooltip APIs
    tooltipText,
    tooltipVisible,
    tooltipX,
    tooltipY,
    showTooltip,
    hideTooltip
  }
}
