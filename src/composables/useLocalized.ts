import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

export type ContentLang = 'en' | 'zh-Hant-TW'

export interface Localized {
  /** 目前是英文介面 */
  isEn: ComputedRef<boolean>
  /** 英文介面且有英文值時回傳英文，否則回傳中文 */
  pick: (zh: string, en?: string) => string
  /** 與 pick 顯示的語言一致的 lang 屬性值 */
  langOf: (en?: string) => ContentLang
}

/**
 * 資料內容（消息標題、檔名、農場名稱…）以中文為主，選填英文欄位（xxxEn）。
 * 模板用法：`span(:lang="langOf(f.nameEn)") {{ pick(f.name, f.nameEn) }}`
 */
export function useLocalized(): Localized {
  const { locale } = useI18n()
  const isEn = computed(() => locale.value === 'en')
  const useEn = (en?: string): en is string => isEn.value && Boolean(en?.trim())
  return {
    isEn,
    pick: (zh, en) => (useEn(en) ? en : zh),
    langOf: (en) => (useEn(en) ? 'en' : 'zh-Hant-TW'),
  }
}
