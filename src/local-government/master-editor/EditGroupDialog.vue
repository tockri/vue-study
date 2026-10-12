<script setup lang="ts">
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import EditGroupForm from '@/local-government/master-editor/EditGroupForm.vue'

// group が null なら閉じている。開閉フラグを別に持たないことで「開いているのに対象が無い」状態を作らない
defineProps<{
  group: Group | null
  service: GroupCheckService
}>()

const emit = defineEmits<{
  close: []
  saved: []
  deleted: []
}>()
</script>

<template>
  <v-dialog
    id="editDialog"
    :model-value="group !== null"
    max-width="520"
    @update:model-value="(value) => !value && emit('close')"
  >
    <v-card v-if="group">
      <v-card-title>グループの編集</v-card-title>
      <v-card-text>
        <!-- 対象が変わったらフォームの状態（組織IDのチェック結果）を作り直すため :key を付ける -->
        <EditGroupForm
          :key="group.groupId"
          :group="group"
          :service="service"
          @saved="emit('saved')"
          @deleted="emit('deleted')"
          @cancel="emit('close')"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
