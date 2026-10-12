import { describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useEditGroupForm } from '@/local-government/master-editor/useEditGroupForm'
import { createDeferred, createFakeGroupCheckService } from '@/local-government/master-editor/__tests__/fake-service'

// 組織IDが未設定のグループを使う。空ならサーバーチェックが走らないので submit の条件を単純に保てる
const group: Group = {
  groupId: '長崎市-1',
  localGovernmentName: '長崎市',
  organizationId: null,
  bankCode: '0181',
}

describe('useEditGroupForm', () => {
  describe('submit', () => {
    test('編集内容をpayloadとして渡し、成功したらtrueを返す', async () => {
      // Arrange
      const editGroup = vi.fn<GroupCheckService['editGroup']>(async () => {})
      const service = createFakeGroupCheckService({ editGroup })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()

      // Act
      const result = await form.submit()

      // Assert
      expect(result).toBe(true)
      expect(editGroup).toHaveBeenCalledWith({ groupId: '長崎市-1', organizationId: '' })
      expect(form.saveError.value).toBe(null)
    })

    test('失敗したらsaveErrorにメッセージを入れてfalseを返す', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        editGroup: async () => {
          throw new Error('更新できませんでした')
        },
      })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()

      // Act
      const result = await form.submit()

      // Assert（保存の失敗は削除用のメッセージを汚さない）
      expect(result).toBe(false)
      expect(form.saveError.value).toBe('更新できませんでした')
      expect(form.deleteError.value).toBe(null)
      expect(form.submitting.value).toBe(false)
    })
  })

  describe('remove', () => {
    test('成功したらtrueを返す', async () => {
      // Arrange
      const deleteGroup = vi.fn<GroupCheckService['deleteGroup']>(async () => {})
      const service = createFakeGroupCheckService({ deleteGroup })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()

      // Act
      const result = await form.remove()

      // Assert
      expect(result).toBe(true)
      expect(deleteGroup).toHaveBeenCalledWith('長崎市-1')
      expect(form.deleting.value).toBe(false)
    })

    test('失敗したらdeleteErrorにメッセージを入れてfalseを返す', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        deleteGroup: async () => {
          throw new Error('削除できませんでした')
        },
      })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()

      // Act
      const result = await form.remove()

      // Assert（確認ダイアログの中に出すメッセージなので saveError とは分けて持つ）
      expect(result).toBe(false)
      expect(form.deleteError.value).toBe('削除できませんでした')
      expect(form.saveError.value).toBe(null)
      expect(form.deleting.value).toBe(false)
    })

    test('削除中に呼び直してもサーバーには1回しか送らない', async () => {
      // Arrange
      const deferred = createDeferred<void>()
      const deleteGroup = vi.fn<GroupCheckService['deleteGroup']>(() => deferred.promise)
      const service = createFakeGroupCheckService({ deleteGroup })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()

      // Act（1回目の応答を待たずに2回目を呼ぶ = ボタン連打）
      const first = form.remove()
      const second = await form.remove()
      deferred.resolve()

      // Assert
      expect(second).toBe(false)
      expect(deleteGroup).toHaveBeenCalledTimes(1)
      expect(await first).toBe(true)
    })
  })

  describe('clearDeleteError', () => {
    test('前回の失敗メッセージを消せる', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        deleteGroup: async () => {
          throw new Error('削除できませんでした')
        },
      })
      const form = useEditGroupForm(service, group, [])
      await flushPromises()
      await form.remove()

      // Act
      form.clearDeleteError()

      // Assert
      expect(form.deleteError.value).toBe(null)
    })
  })

  describe('組織IDの重複', () => {
    const otherOrganizationId = '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0'
    const ownOrganizationId = '7b2e9c14-5a6d-42f3-8c19-de30b7a95f62'

    // 編集対象は組織IDを持っていて、別のグループが別の組織IDを使っている状態
    const editing: Group = { ...group, organizationId: ownOrganizationId }
    const existingGroups: ReadonlyArray<Group> = [
      editing,
      {
        groupId: '長崎市-2',
        localGovernmentName: '長崎市',
        organizationId: otherOrganizationId,
        bankCode: '0181',
      },
    ]

    test('自分が今使っている組織IDはそのまま保存できる', async () => {
      // Arrange / Act（初期値のまま開く）
      const form = useEditGroupForm(createFakeGroupCheckService(), editing, existingGroups)
      await flushPromises()

      // Assert（自分自身は重複の相手にしない）
      expect(form.organization.errorMessages.value).toEqual([])
      expect(form.canSubmit.value).toBe(true)
    })

    test('他のグループが使っている組織IDはエラーになり、保存できない', async () => {
      // Arrange
      const form = useEditGroupForm(createFakeGroupCheckService(), editing, existingGroups)
      await flushPromises()

      // Act
      form.organization.organizationId.value = otherOrganizationId
      await flushPromises()

      // Assert
      expect(form.organization.errorMessages.value).toEqual(['その組織IDは他のグループで使われています'])
      expect(form.canSubmit.value).toBe(false)
    })

    test('空にして未設定に戻すことはできる', async () => {
      // Arrange
      const form = useEditGroupForm(createFakeGroupCheckService(), editing, existingGroups)
      await flushPromises()

      // Act
      form.organization.organizationId.value = ''
      await flushPromises()

      // Assert
      expect(form.organization.errorMessages.value).toEqual([])
      expect(form.payload.value.organizationId).toBe('')
      expect(form.canSubmit.value).toBe(true)
    })
  })
})
