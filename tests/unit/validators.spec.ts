import { describe, expect, it } from 'vitest'
import {
  isAdminPassword,
  isAdminUsername,
  isEmail,
  isHttpUrl,
  isNationalId,
  isPhone,
  isTaxId,
} from '@/utils/validators'

describe('validators', () => {
  it('統一編號檢查碼', () => {
    expect(isTaxId('04595257')).toBe(true)
    expect(isTaxId('10458575')).toBe(true) // 第 7 碼為 7
    expect(isTaxId('12345678')).toBe(false)
    expect(isTaxId('1234567')).toBe(false)
  })

  it('身分證／居留證號檢查碼', () => {
    expect(isNationalId('A123456789')).toBe(true)
    expect(isNationalId('a123456789')).toBe(true)
    expect(isNationalId('A123456788')).toBe(false)
    expect(isNationalId('A323456789')).toBe(false)
  })

  it('電子郵件', () => {
    expect(isEmail('name@example.com')).toBe(true)
    expect(isEmail('name@example')).toBe(false)
    expect(isEmail('a b@example.com')).toBe(false)
  })

  it('電話', () => {
    expect(isPhone('06-786-4313')).toBe(true)
    expect(isPhone('0912 345 678')).toBe(true)
    expect(isPhone('+886 912-345-678')).toBe(true)
    expect(isPhone('(02)2345-6789#12')).toBe(true)
    expect(isPhone('12345')).toBe(false)
  })

  it('管理者帳號、密碼與網址', () => {
    expect(isAdminUsername('admin')).toBe(true)
    expect(isAdminUsername('Ncku.Admin_01')).toBe(true)
    expect(isAdminUsername('ab')).toBe(false)
    expect(isAdminUsername('王小明')).toBe(false)
    expect(isAdminUsername('a b c')).toBe(false)
    expect(isAdminPassword('admin12345')).toBe(true)
    expect(isAdminPassword('abc12345')).toBe(false)
    expect(isAdminPassword('abcdefghijk')).toBe(false)
    expect(isAdminPassword('12345678901')).toBe(false)
    expect(isHttpUrl('https://example.com/a?b=1')).toBe(true)
    expect(isHttpUrl('http://x')).toBe(true)
    expect(isHttpUrl('ftp://example.com')).toBe(false)
    expect(isHttpUrl('https://example.com/a b')).toBe(false)
  })
})
