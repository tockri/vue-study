import { computed, ref } from 'vue'
import type { Validator } from '@/local-government/master-editor/validation'

/**
 * 1項目ぶんの「値 + 検証結果 + エラーを表示してよいか」をまとめた composable。
 *
 * 検証自体は入力のたびに走るが、まだ触っていない空欄にいきなり「必須です」と出ると
 * うるさいので、表示は touched になってからにしている（初期値があれば最初から表示する）。
 */
export const useValidatedField = (validate: Validator, initialValue = '') => {
  const rawValue = ref(initialValue)
  // 初期値が入っている項目は、開いた時点で不正なら理由を見せたいので触れた扱いにする
  const touched = ref(initialValue !== '')

  // setter で touched を立てるので、テンプレート側は v-model を書くだけでよい
  const model = computed({
    get: () => rawValue.value,
    set: (next: string) => {
      rawValue.value = next
      touched.value = true
    },
  })

  const trimmed = computed(() => rawValue.value.trim())
  const error = computed(() => validate(rawValue.value))
  const valid = computed(() => error.value === null)

  // v-text-field の :error-messages にそのまま渡せる形
  const errorMessages = computed(() => (touched.value && error.value !== null ? [error.value] : []))

  return { model, trimmed, touched, error, valid, errorMessages }
}
