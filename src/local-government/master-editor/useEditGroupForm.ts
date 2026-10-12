import { computed, ref } from 'vue'
import type { EditGroupPayload, Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useOrganizationCheck } from '@/local-government/master-editor/useOrganizationCheck'

/**
 * editForm の状態と送信を担当する composable。
 * 編集できるのは組織IDだけ（EditGroupPayload にそれしか無い）なので、
 * グループIDと市町村名は表示専用として受け取った group から読む。
 *
 * existingGroups は組織IDの重複チェックに使う一覧。編集中のグループ自身は相手に含めない。
 */
export const useEditGroupForm = (service: GroupCheckService, group: Group, existingGroups: ReadonlyArray<Group>) => {
  // 自分が今使っている組織IDはそのまま保存できないといけないので、自分自身は除く
  const usedOrganizationIds = existingGroups.flatMap((other) =>
    other.groupId === group.groupId || other.organizationId === null ? [] : [other.organizationId],
  )

  // 組織IDは未設定（null）があり得る。フォーム上は空文字として扱う
  const organization = useOrganizationCheck(service, group.organizationId ?? '', usedOrganizationIds)
  const submitting = ref(false)
  const deleting = ref(false)
  // 保存エラーはフォーム上に、削除エラーは確認ダイアログの中に出す。
  // 共有すると削除の失敗がダイアログの裏に隠れてユーザーに届かないので分けている
  const saveError = ref<string | null>(null)
  const deleteError = ref<string | null>(null)

  const payload = computed<EditGroupPayload>(() => ({
    groupId: group.groupId,
    organizationId: organization.trimmed.value,
  }))

  // 初期値も含めて毎回チェックし直す（useOrganizationCheck が開いた直後にチェックを走らせる）
  const canSubmit = computed(() => !submitting.value && organization.verified.value && !organization.checking.value)

  const submit = async (): Promise<boolean> => {
    if (!canSubmit.value) {
      return false
    }
    submitting.value = true
    saveError.value = null
    try {
      await service.editGroup(payload.value)
      return true
    } catch (error) {
      saveError.value = error instanceof Error ? error.message : '更新に失敗しました'
      return false
    } finally {
      submitting.value = false
    }
  }

  // 確認ダイアログを開き直したときに前回の失敗メッセージが残らないようにする
  const clearDeleteError = () => {
    deleteError.value = null
  }

  const remove = async (): Promise<boolean> => {
    // 連打で deleteGroup が複数回飛ぶのを防ぐ。ボタンの :loading だけに頼らない
    if (deleting.value) {
      return false
    }
    deleting.value = true
    deleteError.value = null
    try {
      await service.deleteGroup(group.groupId)
      return true
    } catch (error) {
      deleteError.value = error instanceof Error ? error.message : '削除に失敗しました'
      return false
    } finally {
      deleting.value = false
    }
  }

  return {
    organization,
    submitting,
    deleting,
    saveError,
    deleteError,
    payload,
    canSubmit,
    submit,
    clearDeleteError,
    remove,
  }
}
