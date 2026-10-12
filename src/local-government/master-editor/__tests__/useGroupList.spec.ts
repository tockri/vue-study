import { describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useGroupList } from '@/local-government/master-editor/useGroupList'
import { createDeferred, createFakeGroupCheckService } from '@/local-government/master-editor/__tests__/fake-service'

const fukuokaGroups: ReadonlyArray<Group> = [
  {
    groupId: '福岡市-1',
    localGovernmentName: '福岡市',
    organizationId: '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0',
    bankCode: '0177',
  },
  {
    groupId: '北九州市-1',
    localGovernmentName: '北九州市',
    organizationId: null,
    bankCode: '0177',
  },
]

const nagasakiGroups: ReadonlyArray<Group> = [
  {
    groupId: '長崎市-1',
    localGovernmentName: '長崎市',
    organizationId: null,
    bankCode: '0181',
  },
]

const groupIdsOf = (groups: ReadonlyArray<Group>) => groups.map((group) => group.groupId)

describe('useGroupList', () => {
  describe('取得', () => {
    test('渡された金融機関で初回の取得をする', async () => {
      // Arrange
      const loadGroups = vi.fn<GroupCheckService['loadGroups']>(async () => fukuokaGroups)
      const service = createFakeGroupCheckService({ loadGroups })

      // Act
      const list = useGroupList(service, '0177')
      await flushPromises()

      // Assert
      expect(loadGroups).toHaveBeenCalledWith('0177')
      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['福岡市-1', '北九州市-1'])
    })

    test('金融機関を変えるとサーバーから取り直す', async () => {
      // Arrange
      const loadGroups = vi.fn<GroupCheckService['loadGroups']>(async (bankCode) =>
        bankCode === '0177' ? fukuokaGroups : nagasakiGroups,
      )
      const service = createFakeGroupCheckService({ loadGroups })
      const list = useGroupList(service, '0177')
      await flushPromises()

      // Act
      list.bankCode.value = '0181'
      await flushPromises()

      // Assert
      expect(loadGroups).toHaveBeenLastCalledWith('0181')
      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['長崎市-1'])
    })

    test('絞り込みキーワードを変えても取り直さない', async () => {
      // Arrange
      const loadGroups = vi.fn<GroupCheckService['loadGroups']>(async () => fukuokaGroups)
      const service = createFakeGroupCheckService({ loadGroups })
      const list = useGroupList(service, '0177')
      await flushPromises()

      // Act
      list.query.value = '福岡'
      await flushPromises()

      // Assert（query はクライアント側だけで処理する）
      expect(loadGroups).toHaveBeenCalledTimes(1)
    })

    test('取得中はloadingがtrueで、終わるとfalseに戻る', async () => {
      // Arrange
      const deferred = createDeferred<ReadonlyArray<Group>>()
      const service = createFakeGroupCheckService({ loadGroups: () => deferred.promise })

      // Act
      const list = useGroupList(service, '0177')

      // Assert
      expect(list.loading.value).toBe(true)

      // Act
      deferred.resolve(fukuokaGroups)
      await flushPromises()

      // Assert
      expect(list.loading.value).toBe(false)
    })

    test('先に投げた取得が後から返っても一覧を上書きしない', async () => {
      // Arrange（金融機関を素早く切り替えて、応答が追い越される状況を作る）
      const firstLoad = createDeferred<ReadonlyArray<Group>>()
      const secondLoad = createDeferred<ReadonlyArray<Group>>()
      let callCount = 0
      const service = createFakeGroupCheckService({
        loadGroups: () => {
          callCount += 1
          return callCount === 1 ? firstLoad.promise : secondLoad.promise
        },
      })
      const list = useGroupList(service, '0177')

      // Act
      list.bankCode.value = '0181'
      await flushPromises()
      secondLoad.resolve(nagasakiGroups)
      await flushPromises()
      firstLoad.resolve(fukuokaGroups)
      await flushPromises()

      // Assert（後から返った古い結果は捨てる）
      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['長崎市-1'])
      expect(list.loading.value).toBe(false)
    })
  })

  describe('filteredGroups', () => {
    const setup = async () => {
      const service = createFakeGroupCheckService({ loadGroups: async () => fukuokaGroups })
      const list = useGroupList(service, '0177')
      await flushPromises()
      return list
    }

    test('キーワードが空なら全件返す', async () => {
      const list = await setup()

      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['福岡市-1', '北九州市-1'])
    })

    test('市町村名の部分一致で絞り込む', async () => {
      const list = await setup()

      list.query.value = '北九州'

      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['北九州市-1'])
    })

    test('組織IDの部分一致でも絞り込む', async () => {
      const list = await setup()

      list.query.value = '0f4c1a52'

      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['福岡市-1'])
    })

    test('前後の空白は無視する', async () => {
      const list = await setup()

      list.query.value = '  北九州  '

      expect(groupIdsOf(list.filteredGroups.value)).toEqual(['北九州市-1'])
    })

    test('該当が無ければ空になる', async () => {
      const list = await setup()

      list.query.value = '長崎'

      expect(list.filteredGroups.value).toEqual([])
    })
  })
})
