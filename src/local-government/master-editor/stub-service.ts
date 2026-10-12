import type {
  CreateGroupPayload,
  EditGroupPayload,
  Group,
  GroupCheckService,
  OrganizationCheckResult,
} from '@/local-government/master-editor/types'
import { SampleData } from '@/local-government/master-editor/sample-data'

// 学習用サンプルなのでバックエンドは持たず、モジュール内の配列を書き換えて永続化のかわりにする
const createStubGroupCheckService = (initial: ReadonlyArray<Group> = SampleData.groups): GroupCheckService => {
  let groups: Group[] = [...initial]

  // Group.organizationId は null 許容だが payload 側は string なので、空文字は null に寄せて保存する
  const toStoredOrganizationId = (value: string): string | null => (value.trim() === '' ? null : value.trim())

  // 通信待ちの loading 表示を確認できるように、わざと遅延を入れている
  const delay = () => new Promise((resolve) => setTimeout(resolve, 300))

  return {
    async loadGroups(bankCode) {
      await delay()
      return groups.filter((group) => group.bankCode === bankCode)
    },

    async checkOrganizationId(organizationId): Promise<OrganizationCheckResult> {
      await delay()
      // 成功・失敗の両方の表示を試せるように、'f' で始まる組織IDだけ利用不可として返す
      // （UUID は16進数しか含まないため、文字列の一部で判定すると失敗パターンに到達できない）
      if (organizationId.startsWith('f')) {
        return { organizationId, available: false, message: 'この組織IDは利用できません' }
      }
      return { organizationId, available: true, organizationName: `${organizationId} 組織` }
    },

    async createGroup(payload: CreateGroupPayload) {
      await delay()
      if (groups.some((group) => group.groupId === payload.groupId)) {
        throw new Error('同じグループIDが既に登録されています')
      }
      groups.push({
        ...payload,
        organizationId: toStoredOrganizationId(payload.organizationId),
      })
    },

    async editGroup(payload: EditGroupPayload) {
      await delay()
      groups = groups.map((group) =>
        group.groupId === payload.groupId
          ? { ...group, organizationId: toStoredOrganizationId(payload.organizationId) }
          : group,
      )
    },

    async deleteGroup(groupId: string) {
      await delay()
      groups = groups.filter((group) => group.groupId !== groupId)
    },
  }
}

// 画面から import して使う既定のスタブ。テストでは createStubGroupCheckService で別インスタンスを作る
export const stubGroupCheckService = createStubGroupCheckService()

export { createStubGroupCheckService }
