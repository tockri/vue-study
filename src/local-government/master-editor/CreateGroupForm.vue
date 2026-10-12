<script setup lang="ts">
import type { GroupCheckService } from '@/local-government/master-editor/types'
import { useCreateGroupForm } from '@/local-government/master-editor/useCreateGroupForm'
import OrganizationIdField from '@/local-government/master-editor/OrganizationIdField.vue'

const props = defineProps<{ service: GroupCheckService }>()

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const form = useCreateGroupForm(props.service)

const submit = async () => {
  if (await form.submit()) {
    emit('created')
  }
}
</script>

<template>
  <!-- v-form は使わない。検証ルールと「送信できるか」は composable 側に置いてテストしやすくしている -->
  <form id="createForm" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <v-text-field
        v-model="form.groupId.model.value"
        label="グループID"
        class="groupIdField"
        :error-messages="[...form.groupId.errorMessages.value]"
      />
      <v-text-field
        v-model="form.localGovernmentName.model.value"
        label="市町村名"
        class="localGovernmentNameField"
        :error-messages="[...form.localGovernmentName.errorMessages.value]"
      />
      <OrganizationIdField
        v-model="form.organization.organizationId.value"
        :checking="form.organization.checking.value"
        :error-messages="form.organization.errorMessages.value"
        :organization-name="form.organization.organizationName.value"
      />
      <v-alert v-if="form.errorMessage.value" type="error" density="compact" class="mt-2">
        {{ form.errorMessage.value }}
      </v-alert>
    </div>
    <div class="mt-4 flex justify-end gap-2">
      <v-btn variant="text" @click="emit('cancel')">キャンセル</v-btn>
      <v-btn type="submit" color="primary" :disabled="!form.canSubmit.value" :loading="form.submitting.value">
        登録
      </v-btn>
    </div>
  </form>
</template>
