import { describe, expect, test } from 'vitest'
import {
  validateGroupId,
  validateLocalGovernmentName,
  validateOrganizationId,
  validateRequired,
} from '@/local-government/master-editor/validation'

describe('validation', () => {
  describe('validateRequired', () => {
    const validate = validateRequired('グループID')

    test('値が入っていればnullを返す', () => {
      // Act
      const result = validate('福岡市-1')

      // Assert
      expect(result).toBe(null)
    })

    test('空文字のときはラベル入りのメッセージを返す', () => {
      // Act
      const result = validate('')

      // Assert
      expect(result).toBe('グループIDを入力してください')
    })

    test('空白だけのときも未入力として扱う', () => {
      // Act
      const result = validate('   ')

      // Assert
      expect(result).toBe('グループIDを入力してください')
    })
  })

  describe('validateOrganizationId', () => {
    const message = '組織IDはUUID形式で入力してください'

    test('空文字は許可する（後から設定する運用があるため）', () => {
      expect(validateOrganizationId('')).toBe(null)
    })

    test('空白だけのときも空として許可する', () => {
      expect(validateOrganizationId('  ')).toBe(null)
    })

    test('UUID形式ならnullを返す', () => {
      expect(validateOrganizationId('0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0')).toBe(null)
    })

    test('大文字のUUIDも許可する', () => {
      expect(validateOrganizationId('0F4C1A52-9D3B-4E81-9A77-2C8E6B5D41A0')).toBe(null)
    })

    test('前後に空白があってもトリムして判定する', () => {
      expect(validateOrganizationId(' 0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0 ')).toBe(null)
    })

    test('16進数以外の文字が含まれるときはエラーを返す', () => {
      expect(validateOrganizationId('0g4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0')).toBe(message)
    })

    test('ハイフンの区切り位置が違うときはエラーを返す', () => {
      expect(validateOrganizationId('0f4c1a5-29d3b-4e81-9a77-2c8e6b5d41a0')).toBe(message)
    })

    test('桁数が足りないときはエラーを返す', () => {
      expect(validateOrganizationId('0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a')).toBe(message)
    })

    test('ハイフンが無いときはエラーを返す', () => {
      expect(validateOrganizationId('0f4c1a529d3b4e819a772c8e6b5d41a0')).toBe(message)
    })
  })

  describe('validateGroupId / validateLocalGovernmentName', () => {
    test('それぞれの項目名でメッセージを出す', () => {
      expect(validateGroupId('')).toBe('グループIDを入力してください')
      expect(validateLocalGovernmentName('')).toBe('市町村名を入力してください')
    })
  })
})
