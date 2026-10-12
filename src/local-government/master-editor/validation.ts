// 8-4-4-4-12 の16進数。バージョン/バリアントまでは縛らない（既存データを弾かないため）
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 入力値の検証はすべてここに置く。ref を触らない純粋関数なので単体テストしやすい。
 * エラーが無ければ null、あればそのままユーザーに出すメッセージを返す。
 */
export type Validator = (value: string) => string | null

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

export const validateGroupId = validateRequired('グループID')
export const validateLocalGovernmentName = validateRequired('市町村名')

export { UUID_PATTERN }
