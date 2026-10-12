// 8-4-4-4-12 の16進数。バージョン/バリアントまでは縛らない（既存データを弾かないため）
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 入力値の検証はすべてここに置く。ref を触らない純粋関数なので単体テストしやすい。
 * エラーが無ければ null、あればそのままユーザーに出すメッセージを返す。
 */
export type Validator = (value: string) => string | null

/**
 * 複数のルールを順に適用して、最初に見つかったエラーだけを返す。
 * 「必須」と「重複」のように、1つの項目に複数のルールが要るときに使う。
 */
export const combineValidators =
  (...validators: ReadonlyArray<Validator>): Validator =>
  (value) => {
    for (const validate of validators) {
      const error = validate(value)
      if (error !== null) {
        return error
      }
    }
    return null
  }

export const validateRequired =
  (label: string): Validator =>
  (value) =>
    value.trim() === '' ? `${label}を入力してください` : null

export const validateOrganizationId: Validator = (value) => {
  const trimmed = value.trim()
  // 組織IDは空のまま登録できる（後から設定する運用があるため）
  if (trimmed === '') {
    return null
  }
  return UUID_PATTERN.test(trimmed) ? null : '組織IDはUUID形式で入力してください'
}

/**
 * 既に一覧にある値との重複を弾く。
 * 空のときは判定しない（未入力は必須チェックの担当で、組織IDは空のまま複数あってよい）。
 */
const validateNotUsed = (
  usedValues: ReadonlyArray<string>,
  message: string,
  normalize: (value: string) => string = (value) => value,
): Validator => {
  const used = new Set(usedValues.map(normalize))
  return (value) => {
    const trimmed = value.trim()
    if (trimmed === '') {
      return null
    }
    return used.has(normalize(trimmed)) ? message : null
  }
}

/**
 * フロントエンドが見られるのは取得済みの一覧（＝選択中の金融機関ぶん）だけなので、
 * これは「送信前に気づける範囲のチェック」。最終的な重複判定はサーバー側の責務。
 */
export const validateUnusedGroupId = (usedGroupIds: ReadonlyArray<string>): Validator =>
  validateNotUsed(usedGroupIds, 'そのグループIDは既に使われています')

// UUID は大文字小文字を区別しないので、比較するときだけ小文字に揃える
export const validateUnusedOrganizationId = (usedOrganizationIds: ReadonlyArray<string>): Validator =>
  validateNotUsed(usedOrganizationIds, 'その組織IDは他のグループで使われています', (value) => value.toLowerCase())

export const validateGroupId = validateRequired('グループID')
export const validateLocalGovernmentName = validateRequired('市町村名')

export { UUID_PATTERN }
