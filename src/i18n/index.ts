import { createI18n } from 'vue-i18n'
import zhTW, { type MessageSchema } from './locales/zh-TW'
import en from './locales/en'

export const SUPPORTED_LOCALES = ['zh-TW', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const isAppLocale = (v: unknown): v is AppLocale =>
  typeof v === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(v)

export const i18n = createI18n<[MessageSchema], AppLocale, false>({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'zh-TW',
  messages: { 'zh-TW': zhTW, en },
})

/** 切換語系並同步 <html lang> */
export const applyLocale = (locale: AppLocale): void => {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant-TW' : 'en'
  }
}
