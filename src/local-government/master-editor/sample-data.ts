import type { Bank, Group } from '@/local-government/master-editor/types'

// as const satisfies で「空でない」ことを型に残す（banks[0] を既定値として使えるようにするため）
const banks = [
  {
    bankCode: '0177',
    name: '福岡銀行',
  },
  {
    bankCode: '0181',
    name: '十八親和銀行',
  },
] as const satisfies readonly [Bank, ...Bank[]]

// 組織IDは UUID 形式でバリデーションするので、サンプルも UUID で持つ
const groups: readonly Group[] = [
  {
    groupId: '福岡市-1',
    organizationId: '0f4c1a52-9d3b-4e81-9a77-2c8e6b5d41a0',
    bankCode: '0177',
    localGovernmentName: '福岡市',
  },
  {
    groupId: '北九州市-1',
    organizationId: '7b2e9c14-5a6d-42f3-8c19-de30b7a95f62',
    bankCode: '0177',
    localGovernmentName: '北九州市',
  },
  {
    groupId: '長崎市-1',
    organizationId: null,
    bankCode: '0181',
    localGovernmentName: '長崎市',
  },
]

export const SampleData = {
  banks,
  groups,
}
