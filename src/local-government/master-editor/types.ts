export type Bank = {
  bankCode: string
  name: string
}

// 地公体グループ
export type Group = {
  // グループID
  groupId: string
  // 市町村名
  localGovernmentName: string
  // 組織ID。UUID形式
  organizationId: string | null
  // 金融機関コード
  bankCode: string
}

type OrganizationCheckFail = {
  organizationId: string
  available: false
  // エラーメッセージ
  message: string
}

type OrganizationCheckSuccess = {
  organizationId: string
  available: true
  // 組織名
  organizationName: string
}

export type OrganizationCheckResult = OrganizationCheckFail | OrganizationCheckSuccess

export type EditGroupPayload = {
  groupId: string
  // 空文字列で編集すると、loadGroupsが返すGroup.organizationIdがnullになる
  organizationId: string
}

export type CreateGroupPayload = {
  groupId: string
  localGovernmentName: string
  // 空文字列で登録すると、loadGroupsが返すGroup.organizationIdがnullになる
  organizationId: string
  // 登録先の金融機関。画面で選択中のものを明示的に渡す
  bankCode: string
}

// バックエンドで利用できるAPI
export interface GroupCheckService {
  // グループ一覧を取得する。bankCodeによる絞り込みだけで、全件取得する。キーワードでの絞り込みはフロントエンド側でリアルタイムに行う。
  loadGroups(bankCode: string): Promise<ReadonlyArray<Group>>
  // 組織IDを入力されたときに存在、利用可能組織かのチェックをする
  checkOrganizationId(organizationId: string): Promise<OrganizationCheckResult>
  // グループを新規登録する
  createGroup(payload: CreateGroupPayload): Promise<void>
  // グループを編集する
  editGroup(payload: EditGroupPayload): Promise<void>
  // グループを削除する
  deleteGroup(groupId: string): Promise<void>
}
