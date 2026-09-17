import { describe, expect, it } from 'vitest'
import {
  isEmail,
  isMemberAccount,
  isNationalId,
  isPhone,
  isStrongPassword,
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

  it('密碼強度與帳號', () => {
    expect(isStrongPassword('abc12345')).toBe(true)
    expect(isStrongPassword('abcdefgh')).toBe(false)
    expect(isStrongPassword('a1')).toBe(false)
    expect(isMemberAccount('04595257')).toBe(true)
    expect(isMemberAccount('name@example.com')).toBe(true)
    expect(isMemberAccount('abc')).toBe(false)
  })
})
