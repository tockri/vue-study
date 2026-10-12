import { describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useMasterEditor } from '@/local-government/master-editor/useMasterEditor'
import { createFakeGroupCheckService } from '@/local-government/master-editor/__tests__/fake-service'

const fukuokaGroup: Group = {
  groupId: '福岡市-1',
  localGovernmentName: '福岡市',
  organizationId: null,
  bankCode: '0177',
}

const setup = async () => {
  const loadGroups = vi.fn<GroupCheckService['loadGroups']>(async () => [fukuokaGroup])
  const editor = useMasterEditor(createFakeGroupCheckService({ loadGroups }), '0177')
  await flushPromises()
  return { editor, loadGroups }
}

describe('useMasterEditor', () => {
  describe('ダイアログの開閉', () => {
    test('新規登録ダイアログを開ける', async () => {
      // Arrange
      const { editor } = await setup()
      expect(editor.createDialogOpen.value).toBe(false)

      // Act
      editor.openCreateDialog()

      // Assert
      expect(editor.createDialogOpen.value).toBe(true)
    })

    test('編集ダイアログは対象そのものを状態として持つ', async () => {
      // Arrange
      const { editor } = await setup()
      expect(editor.editTarget.value).toBe(null)

      // Act
      editor.openEditDialog(fukuokaGroup)

      // Assert（開閉フラグと対象を二重に持たない）
      expect(editor.editTarget.value).toEqual(fukuokaGroup)
    })
  })

  describe('更新後の後始末', () => {
    test('登録したらダイアログを閉じて一覧を取り直す', async () => {
      // Arrange
      const { editor, loadGroups } = await setup()
      editor.openCreateDialog()

      // Act
      await editor.handleCreated()

      // Assert
      expect(editor.createDialogOpen.value).toBe(false)
      expect(loadGroups).toHaveBeenCalledTimes(2)
    })

    test('保存・削除のどちらでも編集ダイアログを閉じて一覧を取り直す', async () => {
      // Arrange
      const { editor, loadGroups } = await setup()
      editor.openEditDialog(fukuokaGroup)

      // Act
      await editor.handleEditDone()

      // Assert
      expect(editor.editTarget.value).toBe(null)
      expect(loadGroups).toHaveBeenCalledTimes(2)
    })
  })
})
