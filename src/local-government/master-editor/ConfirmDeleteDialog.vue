<script setup lang="ts">
import type { Group } from '@/local-government/master-editor/types'

defineProps<{
  modelValue: boolean
  group: Group
  deleting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <!-- editDialog の上にさらに重ねる。v-dialog は後から開いたものが上に来るので z-index の指定は不要 -->
  <v-dialog
    id="confirmDeleteDialog"
    :model-value="modelValue"
    max-width="420"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>グループの削除</v-card-title>
      <v-card-text> {{ group.localGovernmentName }}（{{ group.groupId }}）を削除してよろしいですか？ </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">キャンセル</v-btn>
        <v-btn color="error" :loading="deleting" @click="emit('confirm')">削除する</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
