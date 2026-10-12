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
  // CreateGroupPayload に bankCode が無い（本来はログインユーザーの所属から決まる）ため、
  // スタブでは直前に一覧取得した金融機関を「今の金融機関」として覚えておく
  let currentBankCode: string = SampleData.banks[0].bankCode

  // 通信待ちの loading 表示を確認できるように、わざと遅延を入れている
  const delay = () => new Promise((resolve) => setTimeout(resolve, 300))

  return {
    async loadGroups(bankCode) {
      await delay()
      currentBankCode = bankCode
      return groups.filter((group) => group.bankCode === bankCode)
    },

    async checkOrganizationId(organizationId): Promise<OrganizationCheckResult> {
      await delay()
      // 成功・失敗の両方の表示を試せるように、'ng' を含む組織IDだけ利用不可として返す
      if (organizationId.includes('ng')) {
        return { organizationId, available: false, message: 'この組織IDは利用できません' }
      }
      return { organizationId, available: true, organizationName: `${organizationId} 組織` }
    },

    async createGroup(payload: CreateGroupPayload) {
      await delay()
      if (groups.some((group) => group.groupId === payload.groupId)) {
        throw new Error('同じグループIDが既に登録されています')
      }
      groups.push({ ...payload, bankCode: currentBankCode })
    },

    async editGroup(payload: EditGroupPayload) {
      await delay()
      groups = groups.map((group) =>
        group.groupId === payload.groupId ? { ...group, organizationId: payload.organizationId } : group,
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
