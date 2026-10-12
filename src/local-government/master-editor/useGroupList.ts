import { computed, ref, watch } from 'vue'
import type { Group, GroupCheckService, SearchCondition } from '@/local-government/master-editor/types'

/**
 * 一覧の取得と絞り込みだけを担当する composable。
 * 金融機関（bankCode）の切り替えはサーバー再取得、query はクライアント側で即時絞り込み、
 * という types.ts の API コメントどおりの分担にしてある。
 *
 * 最初に表示する金融機関は呼び出し側から受け取る（サンプルデータに依存させない）。
 */
export const useGroupList = (service: GroupCheckService, initialBankCode: string) => {
  const condition = ref<SearchCondition>({
    bankCode: initialBankCode,
    query: '',
  })
  const groups = ref<ReadonlyArray<Group>>([])
  const loading = ref(false)

  const reload = async () => {
    loading.value = true
    try {
      groups.value = await service.loadGroups(condition.value.bankCode)
    } finally {
      loading.value = false
    }
  }

  // bankCode だけを監視する。query で再取得してしまわないようにゲッターで絞っている
  watch(() => condition.value.bankCode, reload, { immediate: true })

  const filteredGroups = computed(() => {
    const query = condition.value.query.trim()
    if (query === '') {
      return groups.value
    }
    return groups.value.filter((group) =>
      [group.groupId, group.localGovernmentName, group.organizationId ?? ''].some((value) => value.includes(query)),
    )
  })

  return { condition, groups, filteredGroups, loading, reload }
}
