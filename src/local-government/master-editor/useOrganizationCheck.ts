import { computed, ref, watch } from 'vue'
import type { GroupCheckService, OrganizationCheckResult } from '@/local-government/master-editor/types'
import { useValidatedField } from '@/local-government/master-editor/useValidatedField'
import { validateOrganizationId } from '@/local-government/master-editor/validation'

/**
 * 組織IDの入力・形式チェック・サーバーチェックを担当する composable。
 * 新規登録フォームと編集フォームの両方が同じ挙動を必要とするのでここに切り出している。
 */
export const useOrganizationCheck = (service: GroupCheckService, initialOrganizationId = '') => {
  const field = useValidatedField(validateOrganizationId, initialOrganizationId)
  const result = ref<OrganizationCheckResult | null>(null)
  const checking = ref(false)

  // 結果を消して回るのではなく「今の入力に対する結果か」で判定する。
  // 入力が変わった瞬間に同期的に無効化されるので、古い結果のまま保存できてしまうことがない
  const currentResult = computed(() =>
    result.value !== null && result.value.organizationId === field.trimmed.value ? result.value : null,
  )

  const check = async () => {
    const target = field.trimmed.value
    // 空のときと形式が不正なときはサーバーに聞きに行かない
    if (target === '' || !field.valid.value) {
      return
    }
    checking.value = true
    try {
      result.value = await service.checkOrganizationId(target)
    } finally {
      checking.value = false
    }
  }

  // UUID として入力が完成した時点で自動的にチェックする。
  // immediate で、初期値を持つ編集フォームは開いた直後にチェック済みになる
  watch([field.trimmed, field.valid], () => void check(), { immediate: true })

  const organizationName = computed(() =>
    currentResult.value?.available === true ? currentResult.value.organizationName : null,
  )

  // 形式エラーを優先して出す（形式が不正ならサーバーには聞いていない）
  const errorMessages = computed<ReadonlyArray<string>>(() => {
    if (field.errorMessages.value.length > 0) {
      return field.errorMessages.value
    }
    return currentResult.value?.available === false ? [currentResult.value.message] : []
  })

  // 空ならチェック不要。入力されているなら組織名が返っていることが保存の条件
  const verified = computed(() => field.trimmed.value === '' || currentResult.value?.available === true)

  return {
    organizationId: field.model,
    trimmed: field.trimmed,
    result,
    checking,
    check,
    organizationName,
    errorMessages,
    verified,
  }
}
