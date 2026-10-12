import { computed, ref } from 'vue'
import type { EditGroupPayload, Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useOrganizationCheck } from '@/local-government/master-editor/useOrganizationCheck'

/**
 * editForm の状態と送信を担当する composable。
 * 編集できるのは組織IDだけ（EditGroupPayload にそれしか無い）なので、
 * グループIDと市町村名は表示専用として受け取った group から読む。
 */
export const useEditGroupForm = (service: GroupCheckService, group: Group) => {
  const organization = useOrganizationCheck(service, group.organizationId)
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  const payload = computed<EditGroupPayload>(() => ({
    groupId: group.groupId,
    organizationId: organization.organizationId.value.trim(),
  }))

  // 初期値は登録時にチェック済みなので、変更していなければ再チェックなしで保存できる
  const unchanged = computed(() => payload.value.organizationId === group.organizationId)

  const canSubmit = computed(
    () => !submitting.value && payload.value.organizationId !== '' && (unchanged.value || organization.verified.value),
  )

  const submit = async (): Promise<boolean> => {
    if (!canSubmit.value) {
      return false
    }
    submitting.value = true
    errorMessage.value = null
    try {
      await service.editGroup(payload.value)
      return true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新に失敗しました'
      return false
    } finally {
      submitting.value = false
    }
  }

  const deleting = ref(false)

  const remove = async (): Promise<boolean> => {
    deleting.value = true
    errorMessage.value = null
    try {
      await service.deleteGroup(group.groupId)
      return true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '削除に失敗しました'
      return false
    } finally {
      deleting.value = false
    }
  }

  return { organization, submitting, deleting, errorMessage, payload, unchanged, canSubmit, submit, remove }
}
