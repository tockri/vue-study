<script setup lang="ts">
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import CreateGroupForm from '@/local-government/master-editor/CreateGroupForm.vue'

defineProps<{
  service: GroupCheckService
  // 重複チェックに使う、ダイアログを開いた時点の一覧
  existingGroups: ReadonlyArray<Group>
  bankCode: string
}>()

const emit = defineEmits<{
  created: []
}>()

// 開閉は親と双方向（親は v-model で渡す）。閉じる操作は子から open.value = false で済む
const open = defineModel<boolean>({ required: true })
</script>

<template>
  <v-dialog id="createDialog" v-model="open" max-width="520">
    <v-card>
      <v-card-title>グループの新規登録</v-card-title>
      <v-card-text>
        <!-- 閉じるたびにフォームの状態を捨てたいので v-if でマウントし直す（v-dialog の遅延生成だけでは残る） -->
        <CreateGroupForm
          v-if="open"
          :service="service"
          :bank-code="bankCode"
          :existing-groups="existingGroups"
          @created="emit('created')"
          @cancel="open = false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
