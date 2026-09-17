import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { prefersReducedMotion } from './usePrefersReducedMotion'

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t)

/**
 * 元素進入視窗時由 0 數到 target（取代設計稿的 GSAP data-count）。
 * 回傳要綁定的元素 ref 與目前顯示的數字。
 */
export function useCountUp(target: number, duration = 1100) {
  const el: Ref<HTMLElement | null> = ref(null)
  const value = ref(target)
  let observer: IntersectionObserver | null = null
  let raf = 0

  const run = (): void => {
    const start = performance.now()
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration)
      value.value = Math.round(target * easeOut(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    value.value = 0
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (!el.value || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer?.disconnect()
          run()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(raf)
  })

  return { el, value }
}
