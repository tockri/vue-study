import type { GroupCheckService, OrganizationCheckResult } from '@/local-government/master-editor/types'

export const availableResult = (organizationId: string): OrganizationCheckResult => ({
  organizationId,
  available: true,
  organizationName: `${organizationId} 組織`,
})

export const unavailableResult = (
  organizationId: string,
  message = 'この組織IDは利用できません',
): OrganizationCheckResult => ({
  organizationId,
  available: false,
  message,
})

/**
 * テスト用の GroupCheckService。既定は「一覧は空」「組織IDは常に利用可能」で、
 * テストで関心のあるメソッドだけ overrides で差し替える。
 */
export const createFakeGroupCheckService = (overrides: Partial<GroupCheckService> = {}): GroupCheckService => ({
  loadGroups: async () => [],
  checkOrganizationId: async (organizationId) => availableResult(organizationId),
  createGroup: async () => {},
  editGroup: async () => {},
  deleteGroup: async () => {},
  ...overrides,
})

/**
 * 解決タイミングをテストから制御したいときに使う Promise。
 * loading / checking が立っている途中の状態を観測するために必要。
 */
export const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolveFn, rejectFn) => {
    resolve = resolveFn
    reject = rejectFn
  })
  return { promise, resolve, reject }
}
