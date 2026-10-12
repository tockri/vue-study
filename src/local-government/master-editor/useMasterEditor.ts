import { ref } from 'vue'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useGroupList } from '@/local-government/master-editor/useGroupList'

/**
 * View.vue が持つ状態をまとめた composable。
 * 「一覧」と「どのダイアログが開いているか」だけを持ち、フォームの中身は各フォームの composable に任せる。
 */
export const useMasterEditor = (service: GroupCheckService, initialBankCode: string) => {
  const list = useGroupList(service, initialBankCode)

  const createDialogOpen = ref(false)
  // 編集対象そのものを状態にする（null = 閉じている）。開閉フラグと対象を二重に持たないため
  const editTarget = ref<Group | null>(null)

  const openCreateDialog = () => {
    createDialogOpen.value = true
  }
  const closeCreateDialog = () => {
    createDialogOpen.value = false
  }
  const openEditDialog = (group: Group) => {
    editTarget.value = group
  }
  const closeEditDialog = () => {
    editTarget.value = null
  }

  // 更新系の操作はすべて「閉じて再取得」で画面を揃える
  const handleCreated = async () => {
    closeCreateDialog()
    await list.reload()
  }
  const handleSaved = async () => {
    closeEditDialog()
    await list.reload()
  }
  const handleDeleted = async () => {
    closeEditDialog()
    await list.reload()
  }

  return {
    list,
    createDialogOpen,
    editTarget,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    handleCreated,
    handleSaved,
    handleDeleted,
  }
}
