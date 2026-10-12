import { describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import type { GroupCheckService, OrganizationCheckResult } from '@/local-government/master-editor/types'
import { useOrganizationCheck } from '@/local-government/master-editor/useOrganizationCheck'
import {
  availableResult,
  createDeferred,
  createFakeGroupCheckService,
  unavailableResult,
} from '@/local-government/master-editor/__tests__/fake-service'

const VALID_UUID = '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0'
const ANOTHER_UUID = '7b2e9c14-5a6d-42f3-8c19-de30b7a95f62'

describe('useOrganizationCheck', () => {
  describe('初期値が空のとき', () => {
    test('サーバーに問い合わせず、空のまま保存できる', async () => {
      // Arrange
      const checkOrganizationId = vi.fn<GroupCheckService['checkOrganizationId']>(async (organizationId) =>
        availableResult(organizationId),
      )
      const service = createFakeGroupCheckService({ checkOrganizationId })

      // Act
      const organization = useOrganizationCheck(service)
      await flushPromises()

      // Assert（組織IDは空のままでも登録できる仕様）
      expect(checkOrganizationId).not.toHaveBeenCalled()
      expect(organization.verified.value).toBe(true)
      expect(organization.errorMessages.value).toEqual([])
    })
  })

  describe('初期値がUUIDのとき', () => {
    test('開いた直後にチェックが走り、組織名が表示される', async () => {
      // Arrange
      const checkOrganizationId = vi.fn<GroupCheckService['checkOrganizationId']>(async (organizationId) =>
        availableResult(organizationId),
      )
      const service = createFakeGroupCheckService({ checkOrganizationId })

      // Act
      const organization = useOrganizationCheck(service, VALID_UUID)
      await flushPromises()

      // Assert
      expect(checkOrganizationId).toHaveBeenCalledWith(VALID_UUID)
      expect(organization.organizationName.value).toBe(`${VALID_UUID} 組織`)
      expect(organization.verified.value).toBe(true)
    })
  })

  describe('形式チェック', () => {
    test('UUID形式でない入力はサーバーに問い合わせず、形式エラーを出す', async () => {
      // Arrange
      const checkOrganizationId = vi.fn<GroupCheckService['checkOrganizationId']>(async (organizationId) =>
        availableResult(organizationId),
      )
      const service = createFakeGroupCheckService({ checkOrganizationId })
      const organization = useOrganizationCheck(service)

      // Act
      organization.organizationId.value = 'not-a-uuid'
      await flushPromises()

      // Assert
      expect(checkOrganizationId).not.toHaveBeenCalled()
      expect(organization.errorMessages.value).toEqual(['組織IDはUUID形式で入力してください'])
      expect(organization.verified.value).toBe(false)
    })

    test('形式エラーのほうをサーバーのエラーより優先して出す', async () => {
      // Arrange（まずサーバーから利用不可を受け取る）
      const service = createFakeGroupCheckService({
        checkOrganizationId: async (organizationId) => unavailableResult(organizationId),
      })
      const organization = useOrganizationCheck(service, VALID_UUID)
      await flushPromises()
      expect(organization.errorMessages.value).toEqual(['この組織IDは利用できません'])

      // Act（1文字足して形式を崩す）
      organization.organizationId.value = `${VALID_UUID}0`
      await flushPromises()

      // Assert
      expect(organization.errorMessages.value).toEqual(['組織IDはUUID形式で入力してください'])
    })
  })

  describe('サーバーのチェック結果', () => {
    test('利用不可のときはサーバーのメッセージを出し、保存させない', async () => {
      // Arrange
      const service = createFakeGroupCheckService({
        checkOrganizationId: async (organizationId) => unavailableResult(organizationId),
      })

      // Act
      const organization = useOrganizationCheck(service, VALID_UUID)
      await flushPromises()

      // Assert
      expect(organization.organizationName.value).toBe(null)
      expect(organization.errorMessages.value).toEqual(['この組織IDは利用できません'])
      expect(organization.verified.value).toBe(false)
    })

    test('入力が変わった瞬間に前の結果は使われなくなる', async () => {
      // Arrange
      const service = createFakeGroupCheckService()
      const organization = useOrganizationCheck(service, VALID_UUID)
      await flushPromises()
      expect(organization.verified.value).toBe(true)

      // Act（チェックが返る前の状態を見るため flush しない）
      organization.organizationId.value = ANOTHER_UUID

      // Assert（古い結果のまま保存できてしまわない）
      expect(organization.organizationName.value).toBe(null)
      expect(organization.verified.value).toBe(false)
    })

    test('チェック中はcheckingがtrueで、終わるとfalseに戻る', async () => {
      // Arrange
      const deferred = createDeferred<OrganizationCheckResult>()
      const service = createFakeGroupCheckService({ checkOrganizationId: () => deferred.promise })

      // Act
      const organization = useOrganizationCheck(service, VALID_UUID)

      // Assert（問い合わせ中は保存できない）
      expect(organization.checking.value).toBe(true)
      expect(organization.verified.value).toBe(false)

      // Act
      deferred.resolve(availableResult(VALID_UUID))
      await flushPromises()

      // Assert
      expect(organization.checking.value).toBe(false)
      expect(organization.verified.value).toBe(true)
    })
  })

  describe('check', () => {
    test('空の入力では呼んでも問い合わせない', async () => {
      // Arrange
      const checkOrganizationId = vi.fn<GroupCheckService['checkOrganizationId']>(async (organizationId) =>
        availableResult(organizationId),
      )
      const service = createFakeGroupCheckService({ checkOrganizationId })
      const organization = useOrganizationCheck(service)

      // Act
      await organization.check()

      // Assert
      expect(checkOrganizationId).not.toHaveBeenCalled()
    })
  })

  describe('入力が空に戻ったとき', () => {
    test('飛んでいる問い合わせの完了を待たずに保存できるようになる', async () => {
      // Arrange（問い合わせ中の状態を作る）
      const deferred = createDeferred<OrganizationCheckResult>()
      const service = createFakeGroupCheckService({ checkOrganizationId: () => deferred.promise })
      const organization = useOrganizationCheck(service, VALID_UUID)
      expect(organization.checking.value).toBe(true)

      // Act
      organization.organizationId.value = ''
      await flushPromises()

      // Assert（空の組織IDはチェック不要なので、古い問い合わせに待たされない）
      expect(organization.checking.value).toBe(false)
      expect(organization.verified.value).toBe(true)

      // Act（遅れて返ってきた結果は捨てられる）
      deferred.resolve(availableResult(VALID_UUID))
      await flushPromises()

      // Assert
      expect(organization.checking.value).toBe(false)
      expect(organization.organizationName.value).toBe(null)
    })
  })
})
