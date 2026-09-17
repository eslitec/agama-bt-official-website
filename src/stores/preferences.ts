import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { applyLocale, type AppLocale } from '@/i18n'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const locale = ref<AppLocale>('zh-TW')
    watch(locale, (v) => applyLocale(v), { immediate: true })

    function setLocale(v: AppLocale): void {
      locale.value = v
    }

    return { locale, setLocale }
  },
  { persist: { pick: ['locale'] } },
)
