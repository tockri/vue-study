import { describe, expect, test } from 'vitest'
import { useValidatedField } from '@/local-government/master-editor/useValidatedField'
import { validateRequired } from '@/local-government/master-editor/validation'

const validateName = validateRequired('市町村名')

describe('useValidatedField', () => {
  describe('model', () => {
    test('setterで値とtouchedの両方が更新される', () => {
      // Arrange
      const field = useValidatedField(validateName)

      // Act
      field.model.value = '福岡市'

      // Assert
      expect(field.model.value).toBe('福岡市')
      expect(field.touched.value).toBe(true)
    })
  })

  describe('trimmed', () => {
    test('前後の空白を落とした値を返す', () => {
      // Arrange
      const field = useValidatedField(validateName)

      // Act
      field.model.value = '  福岡市  '

      // Assert
      expect(field.trimmed.value).toBe('福岡市')
    })
  })

  describe('valid', () => {
    test('エラーが無ければtrue', () => {
      const field = useValidatedField(validateName, '福岡市')

      expect(field.valid.value).toBe(true)
    })

    test('エラーがあればfalse（まだ表示していなくても判定は走る）', () => {
      const field = useValidatedField(validateName)

      expect(field.valid.value).toBe(false)
      expect(field.error.value).toBe('市町村名を入力してください')
    })
  })

  describe('errorMessages', () => {
    test('初期値が空のうちは、エラーがあってもメッセージを出さない', () => {
      // Arrange
      const field = useValidatedField(validateName)

      // Assert（未入力の空欄にいきなり必須エラーを出さない）
      expect(field.touched.value).toBe(false)
      expect(field.errorMessages.value).toEqual([])
    })

    test('一度入力したあとはメッセージを出す', () => {
      // Arrange
      const field = useValidatedField(validateName)

      // Act
      field.model.value = '福岡市'
      field.model.value = ''

      // Assert
      expect(field.errorMessages.value).toEqual(['市町村名を入力してください'])
    })

    test('初期値が不正なときは触らなくても最初からメッセージを出す', () => {
      // Arrange
      const field = useValidatedField(validateName, '   ')

      // Assert
      expect(field.touched.value).toBe(true)
      expect(field.errorMessages.value).toEqual(['市町村名を入力してください'])
    })

    test('エラーが無ければ空配列を返す', () => {
      const field = useValidatedField(validateName, '福岡市')

      expect(field.errorMessages.value).toEqual([])
    })
  })
})
