import { computed, ref } from 'vue'
import type { CreateGroupPayload, GroupCheckService } from '@/local-government/master-editor/types'
import { useOrganizationCheck } from '@/local-government/master-editor/useOrganizationCheck'
import { useValidatedField } from '@/local-government/master-editor/useValidatedField'
import { validateGroupId, validateLocalGovernmentName } from '@/local-government/master-editor/validation'

/**
 * createForm の状態と送信を担当する composable。
 * CreateGroupPayload を組み立てるところまでが責務で、ダイアログの開閉は呼び出し側に任せる。
 *
 * 登録先の金融機関は入力項目ではないので、画面で選択中のものを引数で受け取る。
 */
export const useCreateGroupForm = (service: GroupCheckService, bankCode: string) => {
  const groupId = useValidatedField(validateGroupId)
  const localGovernmentName = useValidatedField(validateLocalGovernmentName)
  const organization = useOrganizationCheck(service)
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  const payload = computed<CreateGroupPayload>(() => ({
    groupId: groupId.trimmed.value,
    localGovernmentName: localGovernmentName.trimmed.value,
    organizationId: organization.trimmed.value,
    bankCode,
  }))

  // 「入力ルールを全部クリア」かつ「組織IDが空、または組織名が返っている」
  const canSubmit = computed(
    () =>
      !submitting.value &&
      groupId.valid.value &&
      localGovernmentName.valid.value &&
      organization.verified.value &&
      !organization.checking.value,
  )

  const submit = async (): Promise<boolean> => {
    if (!canSubmit.value) {
      return false
    }
    submitting.value = true
    errorMessage.value = null
    try {
      await service.createGroup(payload.value)
      return true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '登録に失敗しました'
      return false
    } finally {
      submitting.value = false
    }
  }

  return { groupId, localGovernmentName, organization, submitting, errorMessage, payload, canSubmit, submit }
}
