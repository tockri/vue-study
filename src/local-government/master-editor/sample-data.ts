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

const groups: readonly Group[] = [
  {
    groupId: '福岡市-1',
    organizationId: 'xxxx-yyyy-zzzz-wwww',
    bankCode: '0177',
    localGovernmentName: '福岡市',
  },
  {
    groupId: '北九州市-1',
    organizationId: 'aaaa-bbbb-cccc-dddd',
    bankCode: '0177',
    localGovernmentName: '北九州市',
  },
  {
    groupId: '長崎市-1',
    organizationId: 'eeee-ffff-gggg-hhhh',
    bankCode: '0181',
    localGovernmentName: '長崎市',
  },
]

export const SampleData = {
  banks,
  groups,
}
