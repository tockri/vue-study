<script setup lang="ts">

// 組織IDの入力欄（入力 + 形式エラー + チェック結果の表示）だけを担当する。
// 状態は useOrganizationCheck が持つので、ここは入力値以外を書き換えない
defineProps<{
  checking: boolean
  errorMessages: ReadonlyArray<string>
  organizationName: string | null
}>()

// 入力値だけが双方向。残りは表示専用なので props のまま
const organizationId = defineModel<string>({ required: true })

</script>

<template>
  <div>
    <v-text-field
      v-model="organizationId"
      class="organizationIdField"
      placeholder="空のままでも登録できます。入力する場合はUUID形式"
      label="組織ID"
      :loading="checking"
      :error-messages="[...errorMessages]"
    />
    <!-- チェック済みであることが分かるように組織名を出す。未チェックのまま保存はできない -->
    <p v-if="organizationName" class="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
      {{ organizationName }}
    </p>
  </div>
</template>
