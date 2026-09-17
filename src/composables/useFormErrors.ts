import { computed, nextTick, reactive } from 'vue'

export type Rule = () => string | null

/**
 * 表單錯誤狀態：以欄位 key 對應錯誤訊息（空字串代表無誤）。
 * validate() 會跑完所有規則並回傳是否通過；未通過時把焦點移到第一個錯誤欄位。
 */
export function useFormErrors<K extends string>(rules: Record<K, Rule>) {
  const keys = Object.keys(rules) as K[]
  const errors = reactive<Record<string, string>>(Object.fromEntries(keys.map((k) => [k, ''])))
  const count = computed(() => keys.filter((k) => errors[k]).length)

  function check(key: K): boolean {
    errors[key] = rules[key]() ?? ''
    return !errors[key]
  }

  async function validate(
    root?: HTMLElement | null,
    idOf: (key: K) => string = (k) => k,
  ): Promise<boolean> {
    keys.forEach(check)
    const first = keys.find((k) => errors[k])
    if (!first) return true
    await nextTick()
    const el = (root ?? document).querySelector<HTMLElement>(`#${CSS.escape(idOf(first))}`)
    el?.focus()
    return false
  }

  function clear(): void {
    keys.forEach((k) => (errors[k] = ''))
  }

  /** 綁定到 input 的無障礙屬性 */
  const aria = (key: K, id: string): { 'aria-invalid'?: 'true'; 'aria-describedby'?: string } =>
    errors[key] ? { 'aria-invalid': 'true', 'aria-describedby': `${id}-error` } : {}

  return {
    errors: errors as Readonly<Record<K, string>> & Record<K, string>,
    count,
    check,
    validate,
    clear,
    aria,
  }
}
