<script setup lang="ts">
import { ref } from 'vue'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useEditGroupForm } from '@/local-government/master-editor/useEditGroupForm'
import OrganizationIdField from '@/local-government/master-editor/OrganizationIdField.vue'
import ConfirmDeleteDialog from '@/local-government/master-editor/ConfirmDeleteDialog.vue'

const props = defineProps<{
  group: Group
  service: GroupCheckService
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
  cancel: []
}>()

// group は親から渡された時点で固定したいので、composable には props.group をそのまま渡す
// （親側で :key を付けて対象が変わったらマウントし直している）
const form = useEditGroupForm(props.service, props.group)

const confirmDeleteOpen = ref(false)

const submit = async () => {
  if (await form.submit()) {
    emit('saved')
  }
}

const remove = async () => {
  if (await form.remove()) {
    confirmDeleteOpen.value = false
    emit('deleted')
  }
}
</script>

<template>
  <form id="editForm" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <!-- グループIDと市町村名は EditGroupPayload に含まれないので表示のみ -->
      <v-text-field :model-value="group.groupId" label="グループID" readonly disabled />
      <v-text-field :model-value="group.localGovernmentName" label="市町村名" readonly disabled />
      <OrganizationIdField
        :model-value="form.organization.organizationId.value"
        :checking="form.organization.checking.value"
        :error-messages="form.organization.errorMessages.value"
        :organization-name="form.organization.organizationName.value"
        @update:model-value="form.organization.organizationId.value = $event"
        @check="form.organization.check()"
      />
      <v-alert v-if="form.errorMessage.value" type="error" density="compact" class="mt-2">
        {{ form.errorMessage.value }}
      </v-alert>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <v-btn id="confirmDeleteButton" color="error" variant="outlined" @click="confirmDeleteOpen = true">削除</v-btn>
      <div class="flex gap-2">
        <v-btn variant="text" @click="emit('cancel')">キャンセル</v-btn>
        <v-btn type="submit" color="primary" :disabled="!form.canSubmit.value" :loading="form.submitting.value">
          保存
        </v-btn>
      </div>
    </div>

    <ConfirmDeleteDialog v-model="confirmDeleteOpen" :group="group" :deleting="form.deleting.value" @confirm="remove" />
  </form>
</template>
