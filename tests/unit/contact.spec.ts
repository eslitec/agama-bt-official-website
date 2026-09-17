import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CONTACT_FIELDS,
  CONTACT_FORM_NAME,
  CONTACT_HONEYPOT,
  encodeContactForm,
  type ContactPayload,
} from '@/api/modules/contact'

const html = readFileSync(resolve(process.cwd(), 'public/forms/contact.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')

describe('意見反應表單（Netlify Forms）', () => {
  it('靜態偵測表單的名稱、honeypot 與欄位和程式一致', () => {
    const form = doc.querySelector('form')!
    expect(form.getAttribute('name')).toBe(CONTACT_FORM_NAME)
    expect(form.hasAttribute('data-netlify')).toBe(true)
    expect(form.getAttribute('netlify-honeypot')).toBe(CONTACT_HONEYPOT)
    const names = [...form.querySelectorAll('[name]')].map((el) => el.getAttribute('name'))
    expect(names.sort()).toEqual(['form-name', CONTACT_HONEYPOT, ...CONTACT_FIELDS].sort())
  })

  it('送出內容為 urlencoded 並帶 form-name', () => {
    const payload = Object.fromEntries(CONTACT_FIELDS.map((k) => [k, ''])) as ContactPayload
    payload.name = '王小明'
    payload.message = 'a&b=c'
    const params = new URLSearchParams(encodeContactForm(payload))
    expect(params.get('form-name')).toBe(CONTACT_FORM_NAME)
    expect(params.get('name')).toBe('王小明')
    expect(params.get('message')).toBe('a&b=c')
    expect(params.get(CONTACT_HONEYPOT)).toBe('')
  })
})
