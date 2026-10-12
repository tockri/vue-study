<script setup lang="ts">
// 組織IDの入力欄（入力 + チェック結果の表示）だけを担当する。
// 状態は useOrganizationCheck が持つので、ここは props / emits だけの素直な部品にしておく
defineProps<{
  modelValue: string
  checking: boolean
  errorMessages: ReadonlyArray<string>
  organizationName: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  check: []
}>()
</script>

<template>
  <div>
    <v-text-field
      class="organizationIdField"
      :model-value="modelValue"
      label="組織ID"
      :loading="checking"
      :error-messages="[...errorMessages]"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('check')"
    />
    <!-- チェック済みであることが分かるように組織名を出す。未チェックのまま保存はできない -->
    <p v-if="organizationName" class="text-sm text-emerald-700 dark:text-emerald-400">
      {{ organizationName }}
    </p>
  </div>
</template>
