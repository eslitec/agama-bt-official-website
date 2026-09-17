import type { Directive, DirectiveBinding } from 'vue'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'

export type RevealEffect = 'fade-up' | 'fade-right' | 'clip'

/**
 * 進場動畫（取代設計稿的 AOS + GSAP ScrollTrigger）。
 *
 * - `v-reveal`                 元素本身淡入上移
 * - `v-reveal="effect"`        指定效果（'fade-up' | 'fade-right' | 'clip'，以變數傳入以免 Prettier 改寫引號）
 * - `v-reveal.stagger`         套用到子元素並依序延遲 80ms（非同步載入的子元素也會套用）
 *
 * 與設計稿一致：出現當下已在首屏內的元素不做動畫，避免閃爍。
 */
const FOLD = 0.92
const STAGGER_MS = 80

interface RevealState {
  io: IntersectionObserver
  effect: RevealEffect
  stagger: boolean
}

const states = new WeakMap<HTMLElement, RevealState>()

const enabled = (): boolean =>
  typeof window !== 'undefined' &&
  typeof IntersectionObserver !== 'undefined' &&
  !prefersReducedMotion()

const belowFold = (el: Element): boolean =>
  el.getBoundingClientRect().top > window.innerHeight * FOLD

function track(host: HTMLElement): void {
  const state = states.get(host)
  if (!state) return
  const candidates = state.stagger ? (Array.from(host.children) as HTMLElement[]) : [host]
  candidates
    .filter((t) => !t.dataset.revealSeen)
    .forEach((t) => {
      t.dataset.revealSeen = '1'
      if (!belowFold(t)) return
      t.classList.add('reveal', `reveal--${state.effect}`)
      state.io.observe(t)
    })
}

function mounted(el: HTMLElement, binding: DirectiveBinding<RevealEffect | undefined>): void {
  if (!enabled()) return
  const stagger = Boolean(binding.modifiers.stagger)
  const io = new IntersectionObserver(
    (entries) => {
      let order = 0
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const t = entry.target as HTMLElement
        if (stagger) t.style.setProperty('--reveal-delay', `${order++ * STAGGER_MS}ms`)
        t.classList.add('is-revealed')
        io.unobserve(t)
      })
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  states.set(el, { io, effect: binding.value ?? 'fade-up', stagger })
  requestAnimationFrame(() => track(el))
}

export const vReveal: Directive<HTMLElement, RevealEffect | undefined> = {
  mounted,
  updated(el) {
    if (states.get(el)?.stagger) requestAnimationFrame(() => track(el))
  },
  beforeUnmount(el) {
    states.get(el)?.io.disconnect()
    states.delete(el)
  },
}
