<script setup lang="ts">
import type { GroupCheckService } from '@/local-government/master-editor/types'
import CreateGroupForm from '@/local-government/master-editor/CreateGroupForm.vue'

defineProps<{
  modelValue: boolean
  service: GroupCheckService
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()
</script>

<template>
  <v-dialog
    id="createDialog"
    :model-value="modelValue"
    max-width="520"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>グループの新規登録</v-card-title>
      <v-card-text>
        <!-- 閉じるたびにフォームの状態を捨てたいので v-if でマウントし直す（v-dialog の遅延生成だけでは残る） -->
        <CreateGroupForm
          v-if="modelValue"
          :service="service"
          @created="emit('created')"
          @cancel="emit('update:modelValue', false)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
