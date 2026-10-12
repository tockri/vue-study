import { describe, expect, test } from 'vitest'
import type { Group } from '@/local-government/master-editor/types'
import { createStubGroupCheckService } from '@/local-government/master-editor/stub-service'

const fukuokaGroup: Group = {
  groupId: '福岡市-1',
  localGovernmentName: '福岡市',
  organizationId: '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0',
  bankCode: '0177',
}

describe('stubGroupCheckService', () => {
  describe('createGroup', () => {
    test('loadGroupsを呼ぶ前でも、payloadの金融機関に登録する', async () => {
      // Arrange（呼ぶ順番で結果が変わらないことを確かめる）
      const service = createStubGroupCheckService([])

      // Act
      await service.createGroup({
        groupId: '長崎市-1',
        localGovernmentName: '長崎市',
        organizationId: '',
        bankCode: '0181',
      })

      // Assert
      expect(await service.loadGroups('0181')).toHaveLength(1)
      expect(await service.loadGroups('0177')).toHaveLength(0)
    })

    test('組織IDが空文字のときはnullとして保存する', async () => {
      // Arrange
      const service = createStubGroupCheckService([])

      // Act
      await service.createGroup({
        groupId: '福岡市-2',
        localGovernmentName: '福岡市',
        organizationId: '  ',
        bankCode: '0177',
      })

      // Assert
      const [created] = await service.loadGroups('0177')
      expect(created?.organizationId).toBe(null)
    })

    test('同じグループIDは登録できない', async () => {
      // Arrange
      const service = createStubGroupCheckService([fukuokaGroup])

      // Act / Assert
      await expect(
        service.createGroup({
          groupId: '福岡市-1',
          localGovernmentName: '福岡市',
          organizationId: '',
          bankCode: '0177',
        }),
      ).rejects.toThrow('同じグループIDが既に登録されています')
    })
  })
})
