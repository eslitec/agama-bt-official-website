import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 頁面捲動進度（0–1）與是否已捲過指定距離，rAF 節流 */
export function useScrollProgress(condenseAt = 90) {
  const progress = ref(0)
  const condensed = ref(false)
  let raf = 0

  const measure = (): void => {
    raf = 0
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    condensed.value = window.scrollY > condenseAt
  }

  const onScroll = (): void => {
    if (!raf) raf = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
  })

  return { progress, condensed }
}
