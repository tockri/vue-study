import { computed, ref } from 'vue'
import type { CreateGroupPayload, GroupCheckService } from '@/local-government/master-editor/types'
import { useOrganizationCheck } from '@/local-government/master-editor/useOrganizationCheck'

/**
 * createForm の状態と送信を担当する composable。
 * CreateGroupPayload を組み立てるところまでが責務で、ダイアログの開閉は呼び出し側に任せる。
 */
export const useCreateGroupForm = (service: GroupCheckService) => {
  const groupId = ref('')
  const localGovernmentName = ref('')
  const organization = useOrganizationCheck(service)
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  const payload = computed<CreateGroupPayload>(() => ({
    groupId: groupId.value.trim(),
    localGovernmentName: localGovernmentName.value.trim(),
    organizationId: organization.organizationId.value.trim(),
  }))

  const canSubmit = computed(
    () =>
      !submitting.value &&
      payload.value.groupId !== '' &&
      payload.value.localGovernmentName !== '' &&
      organization.verified.value,
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
