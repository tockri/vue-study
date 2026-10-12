<script setup lang="ts">
import type { Group } from '@/local-government/master-editor/types'

defineProps<{
  group: Group
  deleting: boolean
  // 削除の失敗はこのダイアログの中で見せる（裏のフォームに出すとユーザーに届かない）
  errorMessage: string | null
}>()

const emit = defineEmits<{
  confirm: []
}>()

const open = defineModel<boolean>({ required: true })
</script>

<template>
  <!-- editDialog の上にさらに重ねる。v-dialog は後から開いたものが上に来るので z-index の指定は不要 -->
  <v-dialog id="confirmDeleteDialog" v-model="open" max-width="420">
    <v-card>
      <v-card-title>グループの削除</v-card-title>
      <v-card-text>
        {{ group.localGovernmentName }}（{{ group.groupId }}）を削除してよろしいですか？
        <v-alert v-if="errorMessage" type="error" density="compact" class="mt-2">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="open = false">キャンセル</v-btn>
        <v-btn color="error" :loading="deleting" @click="emit('confirm')">削除する</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
