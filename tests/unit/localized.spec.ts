import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { i18n } from '@/i18n'
import { useLocalized } from '@/composables/useLocalized'

const setup = () => {
  let api!: ReturnType<typeof useLocalized>
  const Comp = defineComponent({
    setup() {
      api = useLocalized()
      return () => h('span', { lang: api.langOf('Farm') }, api.pick('農場', 'Farm'))
    },
  })
  const w = mount(Comp, { global: { plugins: [i18n] } })
  return { w, api: () => api }
}

describe('useLocalized', () => {
  afterEach(() => {
    i18n.global.locale.value = 'zh-TW'
  })

  it('中文介面一律顯示中文', () => {
    i18n.global.locale.value = 'zh-TW'
    const { api } = setup()
    const { isEn, pick, langOf } = api()
    expect(isEn.value).toBe(false)
    expect(pick('農場', 'Farm')).toBe('農場')
    expect(langOf('Farm')).toBe('zh-Hant-TW')
  })

  it('英文介面有英文值時顯示英文，沒有或空白時退回中文', () => {
    i18n.global.locale.value = 'en'
    const { api } = setup()
    const { isEn, pick, langOf } = api()
    expect(isEn.value).toBe(true)
    expect(pick('農場', 'Farm')).toBe('Farm')
    expect(langOf('Farm')).toBe('en')
    expect(pick('農場')).toBe('農場')
    expect(langOf(undefined)).toBe('zh-Hant-TW')
    expect(pick('農場', '  ')).toBe('農場')
    expect(langOf('')).toBe('zh-Hant-TW')
  })

  it('切換語系時重新渲染', async () => {
    i18n.global.locale.value = 'zh-TW'
    const { w } = setup()
    expect(w.text()).toBe('農場')
    expect(w.attributes('lang')).toBe('zh-Hant-TW')
    i18n.global.locale.value = 'en'
    await nextTick()
    expect(w.text()).toBe('Farm')
    expect(w.attributes('lang')).toBe('en')
  })
})
