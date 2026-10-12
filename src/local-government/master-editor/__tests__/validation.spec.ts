import { describe, expect, test } from 'vitest'
import {
  combineValidators,
  validateGroupId,
  validateLocalGovernmentName,
  validateOrganizationId,
  validateRequired,
  validateUnusedGroupId,
  validateUnusedOrganizationId,
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

  describe('validateUnusedGroupId', () => {
    const validate = validateUnusedGroupId(['福岡市-1', '北九州市-1'])

    test('一覧に無いグループIDならnullを返す', () => {
      expect(validate('佐世保市-1')).toBe(null)
    })

    test('一覧にあるグループIDはエラーを返す', () => {
      expect(validate('福岡市-1')).toBe('そのグループIDは既に使われています')
    })

    test('前後の空白を落として判定する', () => {
      expect(validate('  福岡市-1  ')).toBe('そのグループIDは既に使われています')
    })

    test('空のときは判定しない（未入力は必須チェックの担当）', () => {
      expect(validate('')).toBe(null)
    })
  })

  describe('validateUnusedOrganizationId', () => {
    const used = '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0'
    const validate = validateUnusedOrganizationId([used])

    test('他のグループが使っていない組織IDならnullを返す', () => {
      expect(validate('7b2e9c14-5a6d-42f3-8c19-de30b7a95f62')).toBe(null)
    })

    test('他のグループが使っている組織IDはエラーを返す', () => {
      expect(validate(used)).toBe('その組織IDは他のグループで使われています')
    })

    test('UUIDは大文字小文字を区別せずに重複と判定する', () => {
      expect(validate(used.toUpperCase())).toBe('その組織IDは他のグループで使われています')
    })

    test('空のときは判定しない（組織IDは未設定のまま複数あってよい）', () => {
      expect(validate('')).toBe(null)
    })
  })

  describe('combineValidators', () => {
    const validate = combineValidators(validateRequired('グループID'), validateUnusedGroupId(['福岡市-1']))

    test('どのルールにも引っかからなければnullを返す', () => {
      expect(validate('佐世保市-1')).toBe(null)
    })

    test('先に書いたルールのエラーを優先して返す', () => {
      expect(validate('')).toBe('グループIDを入力してください')
    })

    test('後ろのルールのエラーも返す', () => {
      expect(validate('福岡市-1')).toBe('そのグループIDは既に使われています')
    })
  })
})
