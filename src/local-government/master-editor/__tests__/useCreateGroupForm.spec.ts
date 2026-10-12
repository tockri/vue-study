import { describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useCreateGroupForm } from '@/local-government/master-editor/useCreateGroupForm'
import {
  availableResult,
  createFakeGroupCheckService,
  unavailableResult,
} from '@/local-government/master-editor/__tests__/fake-service'

// 一覧の他のグループが使っている組織ID / まだ誰も使っていない組織ID
const USED_UUID = '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0'
const FREE_UUID = '7b2e9c14-5a6d-42f3-8c19-de30b7a95f62'

// 必須項目だけ埋めた状態を作る
const fillRequired = (form: ReturnType<typeof useCreateGroupForm>) => {
  form.groupId.model.value = '福岡市-1'
  form.localGovernmentName.model.value = '福岡市'
}

describe('useCreateGroupForm', () => {
  describe('payload', () => {
    test('選択中の金融機関を登録先として組み立てる', async () => {
      // Arrange
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0181', [])

      // Act
      fillRequired(form)
      await flushPromises()

      // Assert
      expect(form.payload.value).toEqual({
        groupId: '福岡市-1',
        localGovernmentName: '福岡市',
        organizationId: '',
        bankCode: '0181',
      })
    })

    test('前後の空白を落とした値を使う', async () => {
      // Arrange
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', [])

      // Act
      form.groupId.model.value = '  福岡市-1  '
      form.localGovernmentName.model.value = '  福岡市  '
      await flushPromises()

      // Assert
      expect(form.payload.value.groupId).toBe('福岡市-1')
      expect(form.payload.value.localGovernmentName).toBe('福岡市')
    })
  })

  describe('canSubmit', () => {
    test('必須項目が空のうちは押せない', () => {
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', [])

      expect(form.canSubmit.value).toBe(false)
    })

    test('必須項目が埋まっていれば、組織IDが空でも押せる', async () => {
      // Arrange
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', [])

      // Act
      fillRequired(form)
      await flushPromises()

      // Assert
      expect(form.canSubmit.value).toBe(true)
    })

    test('組織IDが利用不可なら押せない', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        checkOrganizationId: async (organizationId) => unavailableResult(organizationId),
      })
      const form = useCreateGroupForm(service, '0177', [])

      // Act
      fillRequired(form)
      form.organization.organizationId.value = FREE_UUID
      await flushPromises()

      // Assert
      expect(form.canSubmit.value).toBe(false)
    })
  })

  describe('submit', () => {
    test('成功したらtrueを返す', async () => {
      // Arrange
      const createGroup = vi.fn<GroupCheckService['createGroup']>(async () => {})
      const form = useCreateGroupForm(createFakeGroupCheckService({ createGroup }), '0177', [])
      fillRequired(form)
      await flushPromises()

      // Act
      const result = await form.submit()

      // Assert
      expect(result).toBe(true)
      expect(createGroup).toHaveBeenCalledWith(form.payload.value)
      expect(form.errorMessage.value).toBe(null)
    })

    test('送信できない状態なら、サーバーを呼ばずにfalseを返す', async () => {
      // Arrange（必須項目が空のまま）
      const createGroup = vi.fn<GroupCheckService['createGroup']>(async () => {})
      const form = useCreateGroupForm(createFakeGroupCheckService({ createGroup }), '0177', [])
      await flushPromises()

      // Act
      const result = await form.submit()

      // Assert
      expect(result).toBe(false)
      expect(createGroup).not.toHaveBeenCalled()
    })

    test('失敗したらerrorMessageにメッセージを入れてfalseを返す', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        createGroup: async () => {
          throw new Error('同じグループIDが既に登録されています')
        },
      })
      const form = useCreateGroupForm(service, '0177', [])
      fillRequired(form)
      await flushPromises()

      // Act
      const result = await form.submit()

      // Assert
      expect(result).toBe(false)
      expect(form.errorMessage.value).toBe('同じグループIDが既に登録されています')
      expect(form.submitting.value).toBe(false)
    })
  })

  describe('一覧との重複', () => {
    const existingGroups: ReadonlyArray<Group> = [
      {
        groupId: '福岡市-1',
        localGovernmentName: '福岡市',
        organizationId: USED_UUID,
        bankCode: '0177',
      },
      {
        groupId: '北九州市-1',
        localGovernmentName: '北九州市',
        organizationId: null,
        bankCode: '0177',
      },
    ]

    test('既にあるグループIDはエラーになり、送信できない', async () => {
      // Arrange
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', existingGroups)

      // Act
      form.groupId.model.value = '福岡市-1'
      form.localGovernmentName.model.value = '福岡市'
      await flushPromises()

      // Assert
      expect(form.groupId.errorMessages.value).toEqual(['そのグループIDは既に使われています'])
      expect(form.canSubmit.value).toBe(false)
    })

    test('既にある組織IDはエラーになり、サーバーにも問い合わせない', async () => {
      // Arrange
      const checkOrganizationId = vi.fn<GroupCheckService['checkOrganizationId']>(async (organizationId) =>
        availableResult(organizationId),
      )
      const service = createFakeGroupCheckService({ checkOrganizationId })
      const form = useCreateGroupForm(service, '0177', existingGroups)

      // Act
      fillRequired(form)
      form.organization.organizationId.value = USED_UUID
      await flushPromises()

      // Assert（入力エラーの時点で弾くので問い合わせない）
      expect(form.organization.errorMessages.value).toEqual(['その組織IDは他のグループで使われています'])
      expect(checkOrganizationId).not.toHaveBeenCalled()
      expect(form.canSubmit.value).toBe(false)
    })

    test('重複していないグループIDと組織IDなら送信できる', async () => {
      // Arrange
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', existingGroups)

      // Act
      form.groupId.model.value = '佐世保市-1'
      form.localGovernmentName.model.value = '佐世保市'
      form.organization.organizationId.value = FREE_UUID
      await flushPromises()

      // Assert
      expect(form.groupId.errorMessages.value).toEqual([])
      expect(form.organization.errorMessages.value).toEqual([])
      expect(form.canSubmit.value).toBe(true)
    })

    test('組織IDが未設定のグループがあっても、空のまま登録できる', async () => {
      // Arrange（北九州市-1 の organizationId が null）
      const form = useCreateGroupForm(createFakeGroupCheckService(), '0177', existingGroups)

      // Act
      form.groupId.model.value = '佐世保市-1'
      form.localGovernmentName.model.value = '佐世保市'
      await flushPromises()

      // Assert
      expect(form.organization.errorMessages.value).toEqual([])
      expect(form.canSubmit.value).toBe(true)
    })
  })
})
