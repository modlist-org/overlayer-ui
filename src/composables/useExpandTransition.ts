// Height + fade transition matching O5Kit's dropdown (O5FactoryDropdowns):
// the measured content height is tweened with OutBack over 0.14s while opacity
// fades over 0.16s. Animating the real height (instead of max-height to a large
// constant) keeps the motion proportional to the list, in both directions.

export const EXPAND_HEIGHT_MS = 140
export const EXPAND_FADE_MS = 160
// easeOutBack, same curve DOTween's Ease.OutBack uses (overshoot 1.70158)
export const EASE_OUT_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
// O5Kit's default tween ease
export const EASE_OUT_SINE = 'cubic-bezier(0.61, 1, 0.88, 1)'

const TRANSITION = `height ${EXPAND_HEIGHT_MS}ms ${EASE_OUT_BACK}, opacity ${EXPAND_FADE_MS}ms ${EASE_OUT_SINE}`

function cleanup(el: HTMLElement) {
  el.style.height = ''
  el.style.opacity = ''
  el.style.transition = ''
  el.style.overflow = ''
}

function whenDone(el: HTMLElement, done: () => void) {
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    el.removeEventListener('transitionend', onEnd)
    done()
  }
  const onEnd = (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === 'opacity') finish()
  }
  el.addEventListener('transitionend', onEnd)
  // Fallback in case transitionend never fires (e.g. element hidden)
  setTimeout(finish, Math.max(EXPAND_HEIGHT_MS, EXPAND_FADE_MS) + 50)
}

/** Hooks for `<Transition :css="false" v-bind="expandHooks">`. */
export const expandHooks = {
  onEnter(element: Element, done: () => void) {
    const el = element as HTMLElement
    const target = el.offsetHeight
    el.style.overflow = 'hidden'
    el.style.height = '0px'
    el.style.opacity = '0'
    void el.offsetHeight // commit the start state
    el.style.transition = TRANSITION
    el.style.height = `${target}px`
    el.style.opacity = '1'
    whenDone(el, done)
  },
  onAfterEnter(element: Element) {
    cleanup(element as HTMLElement)
  },
  onEnterCancelled(element: Element) {
    cleanup(element as HTMLElement)
  },
  onLeave(element: Element, done: () => void) {
    const el = element as HTMLElement
    el.style.overflow = 'hidden'
    el.style.height = `${el.offsetHeight}px`
    el.style.opacity = getComputedStyle(el).opacity
    void el.offsetHeight
    el.style.transition = TRANSITION
    el.style.height = '0px'
    el.style.opacity = '0'
    whenDone(el, done)
  },
  onAfterLeave(element: Element) {
    cleanup(element as HTMLElement)
  }
}
