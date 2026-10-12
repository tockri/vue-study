<script setup lang="ts">
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import EditGroupForm from '@/local-government/master-editor/EditGroupForm.vue'

defineProps<{
  service: GroupCheckService
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
}>()

// 編集対象そのものを親と双方向に持つ（null = 閉じている）。
// 開閉フラグを別に持たないことで「開いているのに対象が無い」状態を作らない。
// CreateGroupDialog と同じく、閉じる操作は子で完結する
const target = defineModel<Group | null>({ required: true })
</script>

<template>
  <v-dialog
    id="editDialog"
    :model-value="target !== null"
    max-width="520"
    @update:model-value="(value) => !value && (target = null)"
  >
    <!-- 閉じている間はフォームごと捨てる。開閉と作り直しの関係をこのファイルに閉じ込める -->
    <v-card v-if="target">
      <v-card-title>グループの編集</v-card-title>
      <v-card-text>
        <!-- 閉じずに対象だけ変わっても状態（組織IDのチェック結果）を作り直すため :key を付ける -->
        <EditGroupForm
          :key="target.groupId"
          :group="target"
          :service="service"
          @saved="emit('saved')"
          @deleted="emit('deleted')"
          @cancel="target = null"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
