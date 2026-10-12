import { computed, ref } from 'vue'
import type { GroupCheckService, OrganizationCheckResult } from '@/local-government/master-editor/types'

/**
 * 組織IDの入力とサーバーチェックを担当する composable。
 * 新規登録フォームと編集フォームの両方が同じ挙動を必要とするのでここに切り出している。
 */
export const useOrganizationCheck = (service: GroupCheckService, initialOrganizationId = '') => {
  const organizationId = ref(initialOrganizationId)
  const result = ref<OrganizationCheckResult | null>(null)
  const checking = ref(false)

  const check = async () => {
    const value = organizationId.value.trim()
    if (value === '') {
      result.value = null
      return
    }
    // 入力途中の値に対する古いレスポンスで上書きしないよう、チェック開始時に結果を捨てる
    result.value = null
    checking.value = true
    try {
      const checked = await service.checkOrganizationId(value)
      // チェック中に入力が変わっていたら結果を採用しない
      if (checked.organizationId === organizationId.value.trim()) {
        result.value = checked
      }
    } finally {
      checking.value = false
    }
  }

  const organizationName = computed(() => (result.value?.available === true ? result.value.organizationName : null))

  // v-text-field の :error-messages にそのまま渡せる形にしておく
  const errorMessages = computed(() => (result.value?.available === false ? [result.value.message] : []))

  // 「チェック済みで利用可能」でなければ保存させない
  const verified = computed(() => result.value?.available === true)

  return { organizationId, result, checking, check, organizationName, errorMessages, verified }
}
