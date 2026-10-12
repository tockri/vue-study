import { computed, ref, watch } from 'vue'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'

/**
 * 一覧の取得と絞り込みだけを担当する composable。
 * 金融機関（bankCode）の切り替えはサーバー再取得、query はクライアント側で即時絞り込み、
 * という types.ts の API コメントどおりの分担にしてある。
 * 扱いが違う 2 つなので、1 つの条件オブジェクトにまとめず別々の ref で持つ。
 *
 * 最初に表示する金融機関は呼び出し側から受け取る（サンプルデータに依存させない）。
 */
export const useGroupList = (service: GroupCheckService, initialBankCode: string) => {
  const bankCode = ref(initialBankCode)
  const query = ref('')
  const groups = ref<ReadonlyArray<Group>>([])
  const loading = ref(false)

  // 金融機関を素早く切り替えたときに、先に投げた取得が後から返って一覧を上書きしないようにする
  let latestRequestId = 0

  const reload = async () => {
    const requestId = ++latestRequestId
    loading.value = true
    try {
      const loaded = await service.loadGroups(bankCode.value)
      // 自分より後の取得が始まっていたら、この結果はもう古い
      if (requestId !== latestRequestId) {
        return
      }
      groups.value = loaded
    } finally {
      // loading を下ろすのも最新の取得だけ（古い取得が先に下ろすとスピナーが消えてしまう）
      if (requestId === latestRequestId) {
        loading.value = false
      }
    }
  }

  watch(bankCode, reload, { immediate: true })

  const filteredGroups = computed(() => {
    const keyword = query.value.trim()
    if (keyword === '') {
      return groups.value
    }
    return groups.value.filter((group) =>
      [group.groupId, group.localGovernmentName, group.organizationId ?? ''].some((value) => value.includes(keyword)),
    )
  })

  return { bankCode, query, groups, filteredGroups, loading, reload }
}
