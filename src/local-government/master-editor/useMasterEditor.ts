import { ref } from 'vue'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useGroupList } from '@/local-government/master-editor/useGroupList'

/**
 * View.vue が持つ状態をまとめた composable。
 * 「一覧」と「どのダイアログが開いているか」だけを持ち、フォームの中身は各フォームの composable に任せる。
 * ダイアログを閉じる操作はダイアログ自身が v-model 経由で行うので、ここには開く操作だけを置く。
 */
export const useMasterEditor = (service: GroupCheckService, initialBankCode: string) => {
  const list = useGroupList(service, initialBankCode)

  const createDialogOpen = ref(false)
  // 編集対象そのものを状態にする（null = 閉じている）。開閉フラグと対象を二重に持たないため
  const editTarget = ref<Group | null>(null)

  const openCreateDialog = () => {
    createDialogOpen.value = true
  }
  const openEditDialog = (group: Group) => {
    editTarget.value = group
  }

  // 更新系の操作はすべて「閉じて再取得」で画面を揃える。
  // 編集ダイアログは保存も削除も閉じ方と後始末が同じなので 1 つにまとめている
  const handleCreated = async () => {
    createDialogOpen.value = false
    await list.reload()
  }
  const handleEditDone = async () => {
    editTarget.value = null
    await list.reload()
  }

  return { list, createDialogOpen, editTarget, openCreateDialog, openEditDialog, handleCreated, handleEditDone }
}
